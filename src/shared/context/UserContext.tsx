import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CreatorProfile } from '../../features/onboarding/QuizFunnel';
import type { ViralScript, SavedScript } from '../../types';
import { supabase } from '../../lib/supabase';

// Re-export SavedScript for backwards compatibility
export type { SavedScript } from '../../types';

// Weekly challenge
export interface WeeklyChallenge {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    reward: string;
    expiresAt: string;
}


interface UserState {
    // Auth
    session: any; // any: Supabase Auth session type is complex and varies by auth method
    user: any; // any: Supabase User type varies based on provider metadata

    // Quiz data
    hasCompletedQuiz: boolean;
    creatorProfile: CreatorProfile | null;

    // Usage limits
    freeScriptsRemaining: number;
    totalScriptsCreated: number;

    // Script Library
    scripts: SavedScript[];

    // Streaks
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;

    // Activity tracking (for heatmap)
    activityLog: { [date: string]: number }; // date -> scripts created

    // Weekly goals
    weeklyGoal: number;
    scriptsThisWeek: number;
    weekStartDate: string | null;

    // Challenges
    activeChallenge: WeeklyChallenge | null;
    completedChallenges: string[];

    // Badges
    badges: string[];

    // Premium status
    isPremium: boolean;
    subscriptionExpiresAt: string | null;
    isSubscriptionExpired: boolean;

    // Shares count
    sharesCount: number;

    // Notification State
    newlyEarnedBadge: string | null;

    // Growth Goal
    growthGoal?: {
        targetFollowers: number;
        targetDate?: Date;
        notificationWeekly: boolean;
        notificationMonthly: boolean;
    };
}

interface UserContextType extends UserState {
    completeQuiz: (profile: CreatorProfile) => void;
    useScript: () => boolean;
    saveScript: (script: ViralScript, niche?: string) => void;
    deleteScript: (id: string) => void;
    toggleFavorite: (id: string) => void;
    checkStreak: () => void;
    addBadge: (badge: string) => void;
    upgradeToPremium: () => void;
    setWeeklyGoal: (goal: number) => void;
    incrementShares: () => void;
    startChallenge: (challenge: WeeklyChallenge) => void;
    resetUser: () => void;
    clearNewBadge: () => void;
    checkSubscription: (userId: string) => Promise<void>;
    setSubscriptionExpired: (expired: boolean) => void;
}

const DEFAULT_STATE: UserState = {
    session: null,
    user: null,
    hasCompletedQuiz: false,
    creatorProfile: null,
    freeScriptsRemaining: 3,
    totalScriptsCreated: 0,
    scripts: [],
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    activityLog: {},
    weeklyGoal: 5,
    scriptsThisWeek: 0,
    growthGoal: undefined,
    weekStartDate: null,
    activeChallenge: null,
    completedChallenges: [],
    badges: [],
    isPremium: false,
    subscriptionExpiresAt: null,
    isSubscriptionExpired: false,
    sharesCount: 0,
    newlyEarnedBadge: null
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'hooky_user';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Get start of current week (Sunday)
const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff)).toDateString();
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<UserState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_STATE, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load user state:', e);
        }
        return DEFAULT_STATE;
    });

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Check and reset weekly counter
    useEffect(() => {
        // Init Supabase Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setState(prev => ({ ...prev, session, user: session.user })); // Store session and user
                checkSubscription(session.user.id);
            }
        });

        const { data: { subscription: _subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setState(prev => ({ ...prev, session, user: session.user }));
                checkSubscription(session.user.id);
            } else {
                setState(prev => ({ ...prev, session: null, user: null }));
            }
        });

        const currentWeekStart = getWeekStart();
        if (state.weekStartDate !== currentWeekStart) {
            setState(prev => ({
                ...prev,
                scriptsThisWeek: 0,
                weekStartDate: currentWeekStart
            }));
        }
    }, []);

    const completeQuiz = (profile: CreatorProfile) => {
        setState(prev => ({
            ...prev,
            hasCompletedQuiz: true,
            creatorProfile: profile,
            badges: [...prev.badges, 'first_quiz']
        }));
    };

    const useScript = async (): Promise<boolean> => {
        if (state.isPremium) {
            return true;
        }
        if (state.freeScriptsRemaining <= 0) {
            return false;
        }

        // Optimistic
        setState(prev => ({
            ...prev,
            freeScriptsRemaining: prev.freeScriptsRemaining - 1
        }));

        // Persist
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // We increment the 'used' count using an RPC or just raw SQL (simple update here)
                // Ideally this should be a stored procedure to be atomic, but for now simple update is fine
                const { data: current } = await supabase.from('profiles').select('free_scripts_used').eq('id', session.user.id).single();
                const newUsed = (current?.free_scripts_used || 0) + 1;

                await supabase.from('profiles').update({ free_scripts_used: newUsed }).eq('id', session.user.id);
            }
        } catch (error) {
            console.error('Error updating usage:', error);
        }

        return true;
    };

    // Validar assinatura ao carregar e quando mudar o usuário
    useEffect(() => {
        // Agora verificamos a sessão para carregar dados do banco
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                checkSubscription(session.user.id);
                fetchScripts(session.user.id);
                fetchBadges(session.user.id); // Load badges
            }
        });

        // Listener para mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                checkSubscription(session.user.id);
                fetchScripts(session.user.id);
            } else {
                // Logout: limpar dados sensíveis mas manter estado básico
                setState(prev => ({ ...prev, scripts: [], activityLog: {}, isPremium: false }));
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchScripts = async (userId: string) => {

        try {
            // 1. Fetch Scripts
            const { data: scripts, error } = await supabase
                .from('frequency_scripts') // Atualizado para nome único
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // 2. Fetch Trial Usage
            const { data: profileArgs } = await supabase
                .from('profiles')
                .select('free_scripts_used, free_scripts_limit')
                .eq('id', userId)
                .single();

            if (profileArgs) {
                const limit = profileArgs.free_scripts_limit || 3;
                const used = profileArgs.free_scripts_used || 0;
                setState(prev => ({
                    ...prev,
                    freeScriptsRemaining: Math.max(0, limit - used)
                }));
            }

            if (error) {
                console.error('❌ Erro Supabase:', error);
                throw error;
            }



            // ... rest of logic

            if (scripts) {
                // Reconstruir activityLog baseado nos scripts do banco
                const newActivityLog: { [date: string]: number } = {};

                // Tipagem frouxa para evitar erros de build com campos novos vs antigos
                const loadedScripts = scripts.map((item: any) => { // any: Supabase row type not generated for this table
                    // FIX: Converter data UTC do banco para data LOCAL "yyyy-mm-dd"
                    // Isso garante que bate com o ActivityHeatmap que usa hora local
                    const dateObj = new Date(item.created_at);
                    const dateKey = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD Local

                    newActivityLog[dateKey] = (newActivityLog[dateKey] || 0) + 1;

                    return {
                        id: item.id,
                        script: JSON.parse(item.content), // Assumindo que salvamos como JSON string
                        createdAt: item.created_at,
                        niche: item.niche,
                        isFavorite: item.is_favorite
                    } as SavedScript;
                });

                setState(prev => ({
                    ...prev,
                    scripts: loadedScripts,
                    activityLog: newActivityLog,
                    totalScriptsCreated: loadedScripts.length
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar scripts:', error);
        }
    };

    const saveScript = async (script: ViralScript, niche?: string) => {
        // FIX: Usar data LOCAL para a chave do log (igual ao fetchScripts)
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD Local
        const todayISO = new Date().toISOString(); // UTC para o banco (padrao correto)

        // 1. Optimistic Update (UI Primeiro)
        const tempId = generateId();
        const newScript: SavedScript = {
            id: tempId,
            script,
            createdAt: todayISO,
            niche,
            isFavorite: false
        };

        // Check for new badges
        const newBadges = [...state.badges];
        const newTotal = state.totalScriptsCreated + 1;

        if (newTotal === 1 && !newBadges.includes('first_script')) {
            newBadges.push('first_script');
        }
        if (newTotal === 10 && !newBadges.includes('scripts_10')) {
            newBadges.push('scripts_10');
        }
        if (newTotal === 50 && !newBadges.includes('scripts_50')) {
            newBadges.push('scripts_50');
        }
        if (newTotal === 100 && !newBadges.includes('scripts_100')) {
            newBadges.push('scripts_100');
        }

        setState(prev => ({
            ...prev,
            scripts: [newScript, ...prev.scripts],
            totalScriptsCreated: newTotal,
            scriptsThisWeek: prev.scriptsThisWeek + 1,
            activityLog: {
                ...prev.activityLog,
                [today]: (prev.activityLog[today] || 0) + 1
            },
            badges: newBadges
        }));

        // 2. Persist to Database (Background)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: savedScript, error } = await supabase
                    .from('frequency_scripts') // Atualizado para nome único
                    .insert({
                        user_id: session.user.id,
                        content: JSON.stringify(script), // Serializar o objeto script
                        niche,
                        is_favorite: false,
                        created_at: todayISO
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Atualizar ID temporário com o real do banco
                if (savedScript) {
                    setState(prev => ({
                        ...prev,
                        scripts: prev.scripts.map(s => s.id === tempId ? { ...s, id: savedScript.id } : s)
                    }));
                }
            }
        } catch (error) {
            console.error('Erro ao salvar no Supabase:', error);
            // Opcional: Reverter estado ou mostrar erro
        }

        // --- SECRET BADGES LOGIC ---
        // 1. Secret Owl: Create between 00:00 and 05:00
        const currentHour = new Date().getHours();
        if (currentHour >= 0 && currentHour < 5) {
            addBadge('secret_owl');
        }

        // 2. Secret Seer: Create on the 1st of the month
        if (new Date().getDate() === 1) {
            addBadge('secret_seer');
        }

        // 3. Secret Lightning: 3 scripts in 1 hour
        // Get scripts created in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        // Note: Using updated state for check would be better, but approximation here is fine
        // filtering existing scripts plus the new one
        const recentScripts = [newScript, ...state.scripts].filter(s =>
            new Date(s.createdAt) > oneHourAgo
        );

        if (recentScripts.length >= 3) {
            addBadge('secret_lightning');
        }
    };

    const deleteScript = (id: string) => {
        setState(prev => ({
            ...prev,
            scripts: prev.scripts.filter(s => s.id !== id)
        }));
    };

    const toggleFavorite = (id: string) => {
        setState(prev => ({
            ...prev,
            scripts: prev.scripts.map(s =>
                s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
            )
        }));
    };

    const checkStreak = async () => { // Async now
        const today = new Date().toISOString().split('T')[0];
        const lastActive = state.lastActiveDate;

        if (lastActive === today) {
            return;
        }

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        let newStreak = 1;

        if (lastActive === yesterday) {
            newStreak = state.currentStreak + 1;
        } else if (lastActive && lastActive !== today) {
            // Streak broken, reset to 1
            newStreak = 1;
        }

        const newLongest = Math.max(state.longestStreak, newStreak);

        // Check badges logic (simplified for brevity, assume addBadge handles DB)
        if (newStreak === 7) addBadge('streak_7');
        if (newStreak === 30) addBadge('streak_30');
        if (newStreak === 100) addBadge('streak_100');

        // Optimistic
        setState(prev => ({
            ...prev,
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastActiveDate: today
        }));

        // Persist
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await supabase
                    .from('user_goals')
                    .upsert({
                        user_id: session.user.id,
                        current_streak: newStreak,
                        longest_streak: newLongest,
                        last_active_date: today
                    }, { onConflict: 'user_id' });
            }
        } catch (error) {
            console.error("Error saving streak", error)
        }
    };

    const fetchBadges = async (userId: string) => {
        try {
            const { data: badgeRows, error: _error } = await supabase
                .from('progress_badges')
                .select('badge_slug') // Use badge_slug column
                .eq('user_id', userId);

            if (badgeRows) {
                const badgeSlugs = badgeRows.map((b: any) => b.badge_slug); // any: badge row schema not typed
                setState(prev => ({
                    ...prev,
                    badges: badgeSlugs
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar badges:', error);
        }
    };

    const addBadge = async (badge: string) => {
        if (!state.badges.includes(badge)) {
            // 1. Optimistic Update
            setState(prev => ({
                ...prev,
                badges: [...prev.badges, badge],
                newlyEarnedBadge: badge
            }));

            // 2. Persist to DB
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await supabase
                        .from('progress_badges')
                        .upsert({
                            user_id: session.user.id,
                            badge_slug: badge
                        }, { onConflict: 'user_id, badge_slug' });
                }
            } catch (error) {
                console.error('Erro ao salvar badge:', error);
            }
        }
    };

    const clearNewBadge = () => {
        setState(prev => ({
            ...prev,
            newlyEarnedBadge: null
        }));
    };

    const upgradeToPremium = async () => {
        try {
            // In a real app, we would get the email from the auth session
            const { init_point } = await import('../services').then(m => m.initiateCheckout('user@example.com'));

            // Redirect to Mercado Pago
            if (init_point) {
                window.location.href = init_point;
            }
        } catch (error) {
            console.error('Failed to start premium upgrade:', error);
            alert('Não foi possível iniciar o pagamento. Tente novamente.');
        }

        // For testing/mock purposes (REMOVE IN PROD if fully integrated):
        // setState(prev => ({
        //     ...prev,
        //     isPremium: true,
        //     freeScriptsRemaining: 999,
        //     badges: prev.badges.includes('premium_member') 
        //         ? prev.badges 
        //         : [...prev.badges, 'premium_member']
        // }));
    };

    const setWeeklyGoal = async (goal: number) => {
        // 1. Optimistic Update
        setState(prev => ({
            ...prev,
            weeklyGoal: goal
        }));

        // 2. Persist
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await supabase
                    .from('user_goals')
                    .upsert({
                        user_id: session.user.id,
                        weekly_scripts_goal: goal
                    }, { onConflict: 'user_id' }); // Important: merge with existing row
            }
        } catch (error) {
            console.error('Error saving weekly goal:', error);
        }
    };

    const incrementShares = () => {
        const newCount = state.sharesCount + 1;
        const newBadges = [...state.badges];

        if (newCount === 1 && !newBadges.includes('first_share')) {
            newBadges.push('first_share');
        }
        if (newCount === 10 && !newBadges.includes('shared_10')) {
            newBadges.push('shared_10');
        }

        setState(prev => ({
            ...prev,
            sharesCount: newCount,
            badges: newBadges
        }));
    };

    const startChallenge = (challenge: WeeklyChallenge) => {
        setState(prev => ({
            ...prev,
            activeChallenge: challenge
        }));
    };

    const resetUser = () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(DEFAULT_STATE);
    };

    // Verificar assinatura no Supabase
    const checkSubscription = async (userId: string) => {

        try {
            // 1. Check for Lifetime Access (Tier) in Profiles
            const { data: profileData, error: _profileError } = await supabase
                .from('profiles')
                .select('tier')
                .eq('id', userId)
                .single();

            if (profileData && profileData.tier === 'desafio_45') {

                setState(prev => ({
                    ...prev,
                    isPremium: true,
                    subscriptionExpiresAt: null, // Lifetime
                    isSubscriptionExpired: false
                }));
                return;
            }

            // 2. Fallback: Check for Subscriptions (Recurring) using maybeSingle()
            const { data: subscription, error } = await supabase
                .from('subscriptions')
                .select('status, expires_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();



            if (error) {
                console.error('❌ Supabase query error:', error.message);
                return;
            }

            if (!subscription) {
                // Sem assinatura - this is normal for new users

                setState(prev => ({
                    ...prev,
                    isPremium: false,
                    subscriptionExpiresAt: null,
                    isSubscriptionExpired: false
                }));
                return;
            }

            const expiresAt = new Date(subscription.expires_at);
            const isExpired = expiresAt < new Date();
            const isPremiumResult = subscription.status === 'active' && !isExpired;


            setState(prev => ({
                ...prev,
                isPremium: isPremiumResult,
                subscriptionExpiresAt: subscription.expires_at,
                isSubscriptionExpired: isExpired
            }));
        } catch (error) {
            console.error('❌ Failed to check subscription:', error);
        }
    };


    const setSubscriptionExpired = (expired: boolean) => {
        setState(prev => ({
            ...prev,
            isSubscriptionExpired: expired,
            isPremium: expired ? false : prev.isPremium
        }));
    };

    // --- SOCIAL METRICS (GROWTH TRACKER) ---

    const fetchMetrics = async (userId: string, startDate?: string, endDate?: string) => {
        try {
            let query = supabase
                .from('social_metrics')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: true }); // Chart needs chronological order

            if (startDate) {
                query = query.gte('date', startDate);
            }
            if (endDate) {
                query = query.lte('date', endDate);
            }

            const { data: metricRows, error } = await query;

            if (error) throw error;
            return metricRows || [];
        } catch (error) {
            console.error('Erro ao buscar métricas:', error);
            return [];
        }
    };

    const saveMetric = async (metricData: {
        // Profile fields
        followers: number;
        seguidores?: number;
        seguindo?: number;
        posts?: number;

        // Insights fields (from OCR)
        contas_alcancadas?: number;
        contas_com_engajamento?: number;
        impressoes?: number;
        interacoes?: number;
        cliques_site?: number;
        cliques_email?: number;
        visitas_perfil?: number;
        saves?: number;
        shares?: number;
        likes_periodo?: number;
        comentarios_periodo?: number;
        engajamento_percent?: number;

        // Legacy fields
        avg_likes?: number;
        avg_comments?: number;
        date?: string;
        screenshot_url?: string;
    }) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            // Use provided date or today (Local YYYY-MM-DD)
            const date = metricData.date || new Date().toLocaleDateString('en-CA');

            // Build the upsert object with all available fields
            const upsertData: Record<string, any> = {
                user_id: session.user.id,
                date: date,
                followers: metricData.followers,
                seguidores: metricData.seguidores || metricData.followers, // Sync both
                platform: 'instagram'
            };

            // Add all optional fields if provided
            if (metricData.seguindo != null) upsertData.seguindo = metricData.seguindo;
            if (metricData.posts != null) upsertData.posts = metricData.posts;
            if (metricData.contas_alcancadas != null) upsertData.contas_alcancadas = metricData.contas_alcancadas;
            if (metricData.contas_com_engajamento != null) upsertData.contas_com_engajamento = metricData.contas_com_engajamento;
            if (metricData.impressoes != null) upsertData.impressoes = metricData.impressoes;
            if (metricData.interacoes != null) upsertData.interacoes = metricData.interacoes;
            if (metricData.cliques_site != null) upsertData.cliques_site = metricData.cliques_site;
            if (metricData.cliques_email != null) upsertData.cliques_email = metricData.cliques_email;
            if (metricData.visitas_perfil != null) upsertData.visitas_perfil = metricData.visitas_perfil;
            if (metricData.saves != null) upsertData.saves = metricData.saves;
            if (metricData.shares != null) upsertData.shares = metricData.shares;
            if (metricData.likes_periodo != null) upsertData.likes_periodo = metricData.likes_periodo;
            if (metricData.comentarios_periodo != null) upsertData.comentarios_periodo = metricData.comentarios_periodo;
            if (metricData.engajamento_percent != null) upsertData.engajamento_percent = metricData.engajamento_percent;
            if (metricData.avg_likes != null) upsertData.avg_likes = metricData.avg_likes;
            if (metricData.avg_comments != null) upsertData.avg_comments = metricData.avg_comments;
            if (metricData.screenshot_url) upsertData.screenshot_url = metricData.screenshot_url;



            const { data, error } = await supabase
                .from('social_metrics')
                .upsert(upsertData, {
                    onConflict: 'user_id,date,platform'
                })
                .select()
                .single();

            if (error) throw error;



            // Check for badges and goal achievement immediately
            if (metricData.followers) {
                // Use the state's growth goal target
                const targetFollowers = state.growthGoal?.targetFollowers;
                await checkProgressBadges(metricData.followers, targetFollowers);
            }

            return data;
        } catch (error) {
            console.error('Erro ao salvar métrica:', error);
            throw error;
        }
    };

    const fetchLatestMetric = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            const { data, error } = await supabase
                .from('social_metrics')
                .select('*')
                .eq('user_id', session.user.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Erro ao buscar última métrica:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Erro ao buscar última métrica:', error);
            return null;
        }
    };

    // --- DAILY CHALLENGES ---

    const fetchDailyChallenge = async (dateStr: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            const { data, error } = await supabase
                .from('user_daily_challenges')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('date', dateStr)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching challenge:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error fetching challenge:', error);
            return null;
        }
    };

    const saveDailyChallenge = async (challenge: any, dateStr: string) => { // any: challenge shape defined by AI prompt, not typed yet
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            await supabase
                .from('user_daily_challenges')
                .insert({
                    user_id: session.user.id,
                    date: dateStr,
                    content: challenge,
                    completed: false
                });
        } catch (error) {
            console.error('Error saving challenge:', error);
        }
    };

    const completeDailyChallenge = async (dateStr: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            await supabase
                .from('user_daily_challenges')
                .update({ completed: true })
                .eq('user_id', session.user.id)
                .eq('date', dateStr);
        } catch (error) {
            console.error('Error completing challenge:', error);
        }
    };

    // --- GOALS & NOTIFICATIONS ---

    const fetchGoal = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            const { data, error } = await supabase
                .from('user_goals')
                .select('target_followers, target_date, notification_weekly, notification_monthly, weekly_scripts_goal, current_streak, longest_streak, last_active_date')
                .eq('user_id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching goals:', error);
                return null;
            }

            if (data) {
                // Update global state for dashboard
                setState(prev => ({
                    ...prev,
                    growthGoal: {
                        targetFollowers: data.target_followers,
                        targetDate: data.target_date ? new Date(data.target_date) : undefined,
                        notificationWeekly: data.notification_weekly,
                        notificationMonthly: data.notification_monthly
                    },
                    // Load Persistent Dashboard Stats
                    weeklyGoal: data.weekly_scripts_goal || 3,
                    currentStreak: data.current_streak || 0,
                    longestStreak: data.longest_streak || 0,
                    lastActiveDate: data.last_active_date || null
                }));

                // Also return raw data for modal form population
                return data;
            }

            return null;
        } catch (error) {
            console.error('Error fetching goals:', error);
            return null;
        }
    };

    const saveGoal = async (goalData: {
        target_followers: number;
        target_date: string;
        notification_weekly: boolean;
        notification_monthly: boolean;
    }) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            const { data, error } = await supabase
                .from('user_goals')
                .upsert({
                    user_id: session.user.id,
                    ...goalData,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Optimistic Update: Update state immediately
            if (data) {
                setState(prev => ({
                    ...prev,
                    growthGoal: {
                        targetFollowers: data.target_followers,
                        targetDate: data.target_date ? new Date(data.target_date) : undefined,
                        notificationWeekly: data.notification_weekly,
                        notificationMonthly: data.notification_monthly
                    }
                }));
            }

            return data;
        } catch (error) {
            console.error('Erro ao salvar meta:', error);
            throw error;
        }
    };

    // --- BADGES PERSISTENTES (SUPABASE) ---



    const awardBadge = async (badgeSlug: string, badgeName: string, badgeDescription?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return false;

            // Check if already has badge
            if (state.badges.includes(badgeSlug)) {
                return false; // Already has it
            }

            const { error } = await supabase
                .from('progress_badges')
                .insert({
                    user_id: session.user.id,
                    badge_slug: badgeSlug,
                    badge_name: badgeName,
                    badge_description: badgeDescription || null
                });

            if (error) {
                if (error.code === '23505') {
                    // Duplicate - already has badge
                    return false;
                }
                throw error;
            }

            // Update state optimistically
            setState(prev => ({
                ...prev,
                badges: [...prev.badges, badgeSlug],
                newlyEarnedBadge: badgeSlug
            }));


            return true;
        } catch (error) {
            console.error('Error awarding badge:', error);
            return false;
        }
    };

    // Check and award follower-based badges
    const checkProgressBadges = async (currentFollowers: number, targetFollowers?: number) => {
        try {
            // Follower milestone badges
            if (currentFollowers >= 1000) {
                await awardBadge('followers_1k', '1K Seguidores', 'Atingiu 1.000 seguidores');
            }
            if (currentFollowers >= 5000) {
                await awardBadge('followers_5k', '5K Seguidores', 'Atingiu 5.000 seguidores');
            }
            if (currentFollowers >= 10000) {
                await awardBadge('followers_10k', '10K Seguidores', 'Atingiu 10.000 seguidores');
            }
            if (currentFollowers >= 25000) {
                await awardBadge('followers_25k', '25K Seguidores', 'Atingiu 25.000 seguidores');
            }
            if (currentFollowers >= 50000) {
                await awardBadge('followers_50k', '50K Seguidores', 'Atingiu 50.000 seguidores');
            }
            if (currentFollowers >= 100000) {
                await awardBadge('followers_100k', '100K Seguidores', 'Atingiu 100.000 seguidores');
            }

            // Goal achieved badge
            if (targetFollowers && currentFollowers >= targetFollowers) {
                await awardBadge('goal_achieved', 'Meta Batida!', 'Atingiu sua meta de seguidores');
                // Also save to goal history
                await saveGoalAchievement(targetFollowers, currentFollowers);
            }
        } catch (error) {
            console.error('Error checking progress badges:', error);
        }
    };

    // Save goal achievement to history (for timeline)
    const saveGoalAchievement = async (targetFollowers: number, achievedFollowers: number) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            // Get the goal start date from user_goals
            const { data: goalData } = await supabase
                .from('user_goals')
                .select('created_at, target_date')
                .eq('user_id', session.user.id)
                .single();

            const startedAt = goalData?.created_at || new Date().toISOString();

            // Check if this goal was already recorded (avoid duplicates)
            const { data: existing } = await supabase
                .from('goal_history')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('target_followers', targetFollowers)
                .single();

            if (existing) {

                return null;
            }

            // Insert into goal_history
            const { data, error } = await supabase
                .from('goal_history')
                .insert({
                    user_id: session.user.id,
                    target_followers: targetFollowers,
                    achieved_followers: achievedFollowers,
                    goal_name: `Meta de ${targetFollowers.toLocaleString()} seguidores`,
                    started_at: startedAt
                })
                .select()
                .single();

            if (error) throw error;


            return data;
        } catch (error) {
            console.error('Error saving goal achievement:', error);
            return null;
        }
    };

    // Fetch goal history for timeline display
    const fetchGoalHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return [];

            const { data, error } = await supabase
                .from('goal_history')
                .select('*')
                .eq('user_id', session.user.id)
                .order('achieved_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching goal history:', error);
            return [];
        }
    };

    return (
        <UserContext.Provider value={{
            ...state,
            completeQuiz,
            useScript,
            saveScript,
            deleteScript,
            toggleFavorite,
            checkStreak,
            addBadge,
            upgradeToPremium,
            setWeeklyGoal,
            incrementShares,
            startChallenge,
            resetUser,
            clearNewBadge,
            checkSubscription,
            setSubscriptionExpired,
            // Exporting new functions (cast as any for now or update interface)
            fetchMetrics,
            saveMetric,
            fetchLatestMetric,
            fetchDailyChallenge,
            saveDailyChallenge,
            completeDailyChallenge,
            fetchGoal,
            saveGoal,
            // Badge functions
            fetchBadges,
            awardBadge,
            checkProgressBadges,
            // Goal history functions
            fetchGoalHistory,
            saveGoalAchievement,
            user: state.user // Use the state property we just added
        } as any}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Expanded Badge definitions (20+)
export const BADGES: { [key: string]: { emoji: string; title: string; description: string; color: string } } = {
    // Getting Started
    first_quiz: { emoji: '🎯', title: 'Primeiro Passo', description: 'Completou o quiz', color: '#6366F1' },
    first_script: { emoji: '🔥', title: 'Primeira Chama', description: 'Criou o primeiro roteiro', color: '#EF4444' },
    first_share: { emoji: '📤', title: 'Compartilhador', description: 'Primeiro compartilhamento', color: '#8B5CF6' },

    // Streaks
    streak_7: { emoji: '⚡', title: 'Consistente', description: '7 dias seguidos', color: '#F59E0B' },
    streak_30: { emoji: '💎', title: 'Obsessivo', description: '30 dias seguidos', color: '#06B6D4' },
    streak_100: { emoji: '🏆', title: 'Lenda', description: '100 dias seguidos', color: '#FFD700' },

    // Volume
    scripts_10: { emoji: '📝', title: 'Produtivo', description: '10 roteiros criados', color: '#10B981' },
    scripts_50: { emoji: '🚀', title: 'Máquina', description: '50 roteiros criados', color: '#3B82F6' },
    scripts_100: { emoji: '👑', title: 'Rei do Conteúdo', description: '100 roteiros criados', color: '#EC4899' },

    // Sharing
    shared_10: { emoji: '🌟', title: 'Influenciador', description: 'Compartilhou 10 roteiros', color: '#8B5CF6' },

    // Premium
    premium_member: { emoji: '💫', title: 'VIP', description: 'Membro Premium', color: '#FFD700' },

    // Niches
    niche_fitness: { emoji: '💪', title: 'Fitness Creator', description: '10 roteiros de fitness', color: '#EF4444' },
    niche_business: { emoji: '💼', title: 'Business Mind', description: '10 roteiros de negócios', color: '#6366F1' },
    niche_humor: { emoji: '😂', title: 'Comediante', description: '10 roteiros de humor', color: '#F59E0B' },

    // Weekly Goals
    weekly_goal_1: { emoji: '✅', title: 'Meta Batida', description: 'Cumpriu 1 meta semanal', color: '#10B981' },
    weekly_goal_4: { emoji: '📈', title: 'Mês Perfeito', description: '4 semanas de metas batidas', color: '#3B82F6' },

    // Special
    night_owl: { emoji: '🦉', title: 'Coruja', description: 'Criou roteiro após meia-noite', color: '#6366F1' },
    early_bird: { emoji: '🐦', title: 'Madrugador', description: 'Criou roteiro antes das 6h', color: '#F59E0B' },
    weekend_warrior: { emoji: '⚔️', title: 'Guerreiro de Fds', description: 'Criou no sábado e domingo', color: '#EC4899' },

    // Challenges
    challenge_complete: { emoji: '🎖️', title: 'Desafiante', description: 'Completou um desafio', color: '#8B5CF6' },
    challenge_master: { emoji: '🏅', title: 'Mestre', description: 'Completou 5 desafios', color: '#FFD700' },

    // Secret Badges (Hidden)
    secret_owl: { emoji: '🦉', title: 'Coruja Noturna', description: 'Criou um roteiro na madrugada (00h-05h)', color: '#4B5563' },
    secret_lightning: { emoji: '⚡', title: 'Relâmpago', description: 'Criou 3 roteiros em menos de 1 hora', color: '#F59E0B' },
    secret_seer: { emoji: '🔮', title: 'Vidente', description: 'Criou um roteiro no dia 1º do mês', color: '#8B5CF6' },

    // Follower Milestone Badges
    followers_1k: { emoji: '🌱', title: '1K Seguidores', description: 'Atingiu 1.000 seguidores', color: '#10B981' },
    followers_5k: { emoji: '🌿', title: '5K Seguidores', description: 'Atingiu 5.000 seguidores', color: '#22C55E' },
    followers_10k: { emoji: '🌳', title: '10K Seguidores', description: 'Atingiu 10.000 seguidores', color: '#3B82F6' },
    followers_25k: { emoji: '💎', title: '25K Seguidores', description: 'Atingiu 25.000 seguidores', color: '#6366F1' },
    followers_50k: { emoji: '👑', title: '50K Seguidores', description: 'Atingiu 50.000 seguidores', color: '#8B5CF6' },
    followers_100k: { emoji: '🚀', title: '100K Seguidores', description: 'Atingiu 100.000 seguidores', color: '#EC4899' },
    goal_achieved: { emoji: '🏆', title: 'Meta Batida!', description: 'Atingiu sua meta de seguidores', color: '#FFD700' },
};
