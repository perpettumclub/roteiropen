import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CreatorProfile } from '../../features/onboarding/QuizFunnel';
import type { ViralScript, SavedScript } from '../../types';

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

    // Shares count
    sharesCount: number;

    // Notification State
    newlyEarnedBadge: string | null;
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
}

const DEFAULT_STATE: UserState = {
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
    weekStartDate: null,
    activeChallenge: null,
    completedChallenges: [],
    badges: [],
    isPremium: false,
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

    const useScript = (): boolean => {
        if (state.isPremium) {
            return true;
        }
        if (state.freeScriptsRemaining <= 0) {
            return false;
        }
        setState(prev => ({
            ...prev,
            freeScriptsRemaining: prev.freeScriptsRemaining - 1
        }));
        return true;
    };

    const saveScript = (script: ViralScript, niche?: string) => {
        const today = new Date().toDateString();
        const todayISO = new Date().toISOString();

        const newScript: SavedScript = {
            id: generateId(),
            script,
            createdAt: todayISO,
            niche,
            isFavorite: false
        };

        // Check for new badges
        const newBadges = [...state.badges];
        const newTotal = state.totalScriptsCreated + 1; 1

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

    const checkStreak = () => {
        const today = new Date().toDateString();
        const lastActive = state.lastActiveDate;

        if (lastActive === today) {
            return;
        }

        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (lastActive === yesterday) {
            const newStreak = state.currentStreak + 1;
            const newBadges = [...state.badges];

            if (newStreak === 7 && !newBadges.includes('streak_7')) {
                newBadges.push('streak_7');
            }
            if (newStreak === 30 && !newBadges.includes('streak_30')) {
                newBadges.push('streak_30');
            }
            if (newStreak === 100 && !newBadges.includes('streak_100')) {
                newBadges.push('streak_100');
            }

            setState(prev => ({
                ...prev,
                currentStreak: newStreak,
                longestStreak: Math.max(prev.longestStreak, newStreak),
                lastActiveDate: today,
                badges: newBadges
            }));
        } else if (!lastActive) {
            setState(prev => ({
                ...prev,
                currentStreak: 1,
                longestStreak: Math.max(prev.longestStreak, 1),
                lastActiveDate: today
            }));
        } else {
            setState(prev => ({
                ...prev,
                currentStreak: 1,
                lastActiveDate: today
            }));
        }
    };

    const addBadge = (badge: string) => {
        if (!state.badges.includes(badge)) {
            setState(prev => ({
                ...prev,
                badges: [...prev.badges, badge],
                newlyEarnedBadge: badge // Trigger notification
            }));
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

    const setWeeklyGoal = (goal: number) => {
        setState(prev => ({
            ...prev,
            weeklyGoal: goal
        }));
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
            clearNewBadge
        }}>
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
};
