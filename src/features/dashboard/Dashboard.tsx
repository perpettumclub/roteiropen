import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, BarChart3, Bell, ArrowRight, X, Settings, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../auth/AuthContext';
import { useUser, BADGES } from '../../shared/context/UserContext';
import { AISuggestions } from '../../shared/components/AISuggestions';
import { ActivityHeatmap } from '../../shared/components/ActivityHeatmap';
import { DailyChallengeCard } from '../../shared/components/DailyChallengeCard';
import { supabase } from '../../lib/supabase';
import { MILLISECONDS_PER_DAY, POSTING_GOAL_DAYS } from '../../shared/constants';


import { useReminders } from '../../hooks/useReminders';
import { useSubscription } from '../../hooks/useSubscription';
import { GrowthCard } from '../share';

interface DashboardProps {
    onCreateNew: () => void;
    onViewLibrary: () => void;
    onViewProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateNew, onViewLibrary, onViewProgress }) => {
    const {
        activityLog,
        weeklyGoal,
        scriptsThisWeek,
        creatorProfile,
        totalScriptsCreated,
        currentStreak,
        badges
    } = useUser();
    const { signOut } = useAuth();

    // Notifications logic
    const { permission, requestPermission } = useReminders();

    // Subscription data from Supabase
    const {
        subscription,
        loading: subscriptionLoading,
        daysRemaining,
        autoRenew,
        toggleAutoRenew,
        cancelSubscription
    } = useSubscription();


    const subscriptionStartDate = subscription?.started_at
        ? new Date(subscription.started_at)
        : new Date();

    // Growth Card Modal State
    const [showGrowthCard, setShowGrowthCard] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // NEW: Posting Modals State
    const [showPostedModal, setShowPostedModal] = useState(false);
    const [showNotPostedModal, setShowNotPostedModal] = useState(false);

    // Ref to track if confetti has been fired for this session/value to avoid double firing on re-renders
    const hasFiredConfetti = useRef(false);

    // NEW: Posting Stats from user_goals
    const [postingStreak, setPostingStreak] = useState(0);
    const [totalPostingDays, setTotalPostingDays] = useState(0); // Total unique days posted ever
    const [daysToGoal60, setDaysToGoal60] = useState(60);
    const [postsThisWeek, setPostsThisWeek] = useState(0); // Total posts (kept for reference)
    const [postingDaysThisWeek, setPostingDaysThisWeek] = useState(0); // Unique days
    const [postingLog, setPostingLog] = useState<{ [date: string]: number }>({});

    // Helper: convert a UTC timestamp to Brasilia date string (YYYY-MM-DD)
    // Migration 31 corrected all timestamps to proper UTC, so timezone conversion works correctly
    const toBrasiliaDate = (timestamp: string): string => {
        return new Date(timestamp).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    };

    // Helper: get today's date in Brasilia timezone
    const getTodayBrasilia = (): string => {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    };

    // Helper: get start of current week (Monday) in Brasilia timezone
    const getWeekStartBrasilia = (): string => {
        const now = new Date();
        // Get current day in Brasilia
        const brasiliaStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
        const brasiliaDate = new Date(brasiliaStr + 'T12:00:00'); // noon to avoid date shift
        const dayOfWeek = brasiliaDate.getDay(); // 0=Sun, 1=Mon, etc.
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        brasiliaDate.setDate(brasiliaDate.getDate() - daysToMonday);
        return brasiliaDate.toLocaleDateString('en-CA');
    };

    // PRIMARY STATS ENGINE: Compute ALL stats client-side from raw frequency_scripts data
    // This eliminates dependency on the RPC for display values
    const fetchPostingStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch ALL posted scripts (the single source of truth)
            const { data: postings } = await supabase
                .from('frequency_scripts')
                .select('posted_at')
                .eq('user_id', user.id)
                .not('posted_at', 'is', null)
                .order('posted_at', { ascending: false });



            if (!postings || postings.length === 0) {
                setPostingStreak(0);
                setTotalPostingDays(0);
                setDaysToGoal60(60);
                setPostsThisWeek(0);
                setPostingDaysThisWeek(0);
                setPostingLog({});
                return;
            }

            // Convert ALL timestamps to Brasilia dates
            const allBrasiliaDates: string[] = postings.map((p: any) => toBrasiliaDate(p.posted_at));
            const uniqueDates = new Set(allBrasiliaDates);



            // === 1. POSTING LOG (for heatmap) ===
            const log: { [date: string]: number } = {};
            allBrasiliaDates.forEach((dateStr: string) => {
                log[dateStr] = (log[dateStr] || 0) + 1;
            });
            setPostingLog(log);

            // === 2. STREAK (consecutive days with at least 1 post) ===
            const todayStr = getTodayBrasilia();
            let streak = 0;
            let checkDate = new Date(todayStr + 'T12:00:00'); // noon to avoid shifts

            // If no post today, start checking from yesterday
            if (!uniqueDates.has(todayStr)) {
                checkDate.setDate(checkDate.getDate() - 1);
            }

            // Count consecutive days backward
            while (true) {
                const dateStr = checkDate.toLocaleDateString('en-CA');
                if (uniqueDates.has(dateStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }


            setPostingStreak(streak);

            // === 3. TOTAL POSTING DAYS + GOAL 60 ===
            const totalUniqueDays = uniqueDates.size;
            setTotalPostingDays(totalUniqueDays);
            const goal60Remaining = Math.max(POSTING_GOAL_DAYS - totalUniqueDays, 0);
            setDaysToGoal60(goal60Remaining);



            // === 4. POSTING DAYS THIS WEEK (últimos 7 dias) ===
            // Changed from calendar week to last 7 days for better UX
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // today + 6 days before = 7 days total
            const sevenDaysAgoStr = sevenDaysAgo.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

            let daysThisWeek = 0;
            uniqueDates.forEach(dateStr => {
                if (dateStr >= sevenDaysAgoStr && dateStr <= todayStr) {
                    daysThisWeek++;
                }
            });
            setPostingDaysThisWeek(daysThisWeek);
            setPostsThisWeek(postings.length);



        } catch (error) {
            console.error('Error fetching posting stats:', error);
        }
    };

    // Call on mount
    useEffect(() => {
        fetchPostingStats();
    }, []);


    const weeklyProgress = Math.min((scriptsThisWeek / weeklyGoal) * 100, 100);

    // Celebration effect
    useEffect(() => {
        if (weeklyProgress >= 100 && !hasFiredConfetti.current) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#34D399', '#FBBF24']
            });
            hasFiredConfetti.current = true;
        }
    }, [weeklyProgress]);

    // Portuguese day abbreviations
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];


    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * MILLISECONDS_PER_DAY);
        const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
        const count = postingLog[dateStr] || 0; // Use postingLog instead of activityLog
        const dayName = dayNames[date.getDay()];
        return { date: dateStr, count, dayName };
    });



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}
        >
            {/* Welcome Header */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    color: 'var(--dark)',
                    marginBottom: '0.25rem'
                }}>
                    Olá, {creatorProfile?.creatorType === 'relampago' ? '⚡' :
                        creatorProfile?.creatorType === 'viral' ? '🔥' :
                            creatorProfile?.creatorType === 'estrategista' ? '🎯' : '💎'} Criador!
                </h1>
                <p style={{ color: 'var(--gray)', fontSize: '1rem' }}>
                    Sua central de roteiros virais
                </p>
            </div>

            {/* Notification Permission Request */}
            {permission === 'default' && (
                <motion.button
                    onClick={requestPermission}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        border: '1px solid #C7D2FE',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                    }}
                >
                    <Bell size={16} /> Ativar lembretes de progresso
                </motion.button>
            )}

            {/* Stats Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {/* Total Scripts */}
                <div className="glass-card" style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {totalScriptsCreated}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        Roteiros
                    </div>
                </div>

                {/* Current Posting Streak */}
                <div className="glass-card" style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF6B6B' }}>
                        🔥 {totalPostingDays}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        Dias postando
                    </div>
                </div>

                {/* Goal 60 Progress */}
                <div className="glass-card" style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>
                        🎯 {daysToGoal60 <= 0 ? '🏆' : daysToGoal60}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        {daysToGoal60 <= 0 ? 'Meta 60 atingida!' : 'Pra meta 60'}
                    </div>
                </div>
            </div>

            {/* Weekly Posting Progress */}
            <div className="glass-card" style={{
                padding: '1.5rem',
                borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>📅</span>
                        <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Esta semana</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: postingDaysThisWeek >= 7 ? '#10B981' : 'var(--gray)' }}>
                        {postingDaysThisWeek}/7 dias
                    </span>
                </div>
                <div style={{
                    height: '12px',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '6px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((postingDaysThisWeek / 7) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: postingDaysThisWeek >= 7
                                ? 'linear-gradient(90deg, #10B981, #34D399)'
                                : 'linear-gradient(90deg, #10B981, #6EE7B7)',
                            borderRadius: '6px'
                        }}
                    />
                </div>
                {postingDaysThisWeek >= 7 && (
                    <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        color: '#10B981',
                        fontWeight: 600
                    }}>
                        🎉 7/7 dias! Semana perfeita!
                    </div>
                )}
            </div>

            {/* Growth Card Banner */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGrowthCard(true)}
                className="glass-card"
                style={{
                    padding: '1rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        background: '#D4AF37',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--dark)' }}>
                            Seu crescimento
                        </h3>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--gray)' }}>
                            Compartilhe sua evolução e ganhe destaque
                        </p>
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <ArrowRight size={20} color="#D4AF37" />
                </div>
            </motion.div>

            {/* Badges Container - User Achievements */}
            {badges && badges.length > 0 && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>🏆</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>Suas Conquistas</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)', marginLeft: 'auto' }}>
                            {badges.filter((b: string) => BADGES[b]).length} badges
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {badges
                            .filter((badgeSlug: string) => BADGES[badgeSlug])
                            .map((badgeSlug: string) => {
                                const badge = BADGES[badgeSlug];
                                return (
                                    <motion.div
                                        key={badgeSlug}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        title={`${badge.title}: ${badge.description}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            padding: '0.4rem 0.7rem',
                                            background: `${badge.color}15`,
                                            border: `1px solid ${badge.color}40`,
                                            borderRadius: '20px',
                                            cursor: 'default'
                                        }}
                                    >
                                        <span style={{ fontSize: '1rem' }}>{badge.emoji}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: badge.color }}>
                                            {badge.title}
                                        </span>
                                    </motion.div>
                                );
                            })
                        }
                    </div>
                </motion.div>
            )}



            {/* Activity Heatmap (Last 7 Days) */}
            <div className="glass-card" style={{
                padding: '1.5rem',
                borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <TrendingUp size={20} color="var(--secondary)" />
                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Últimos 7 Dias</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {last7Days.map((day, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: day.count === 0
                                    ? 'rgba(0,0,0,0.05)'
                                    : day.count >= 3
                                        ? '#10B981'  // Verde forte (GitHub)
                                        : day.count >= 2
                                            ? 'rgba(16,185,129,0.6)'  // Verde médio
                                            : 'rgba(16,185,129,0.3)',  // Verde claro
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: day.count > 0 ? 'white' : 'var(--gray)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                marginBottom: '0.25rem'
                            }}>
                                {day.count || ''}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--gray)', textTransform: 'capitalize' }}>
                                {day.dayName}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Challenge */}
            <div style={{ marginBottom: '1.5rem' }}>
                <DailyChallengeCard />
            </div>

            {/* AI Suggestions */}
            <div style={{ marginBottom: '1.5rem' }}>
                <AISuggestions
                    onSuggestionClick={(suggestion) => {
                        onCreateNew();
                    }}
                />
            </div>

            {/* Activity Heatmap - Visual Consistency */}
            <div style={{ marginBottom: '1.5rem' }}>
                <ActivityHeatmap postingLog={postingLog} />
            </div>

            {/* PRIMARY ACTIONS: Posting Status - Most Important */}
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--gray)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-body)'
                }}>
                    ✨ Registrar postagem de hoje
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <motion.button
                        onClick={() => setShowNotPostedModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            background: 'white',
                            color: '#EF4444',
                            border: '2px solid rgba(239, 68, 68, 0.2)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
                        }}
                    >
                        ❌ Não postei
                    </motion.button>

                    <motion.button
                        onClick={() => setShowPostedModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #10B981, #34D399)',
                            color: 'white',
                            border: 'none',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        ✅ Postei!
                    </motion.button>
                </div>
            </div>

            {/* SECONDARY ACTIONS: Content & Analytics */}
            <div>
                <h3 style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.4)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-body)'
                }}>
                    Outras ações
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <motion.button
                        onClick={onCreateNew}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 2,
                            background: 'var(--dark)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '14px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        <Zap size={18} />
                        Criar Roteiro
                    </motion.button>

                    <motion.button
                        onClick={onViewLibrary}
                        whileHover={{ scale: 1.02, background: 'var(--bg-surface)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            background: 'white',
                            color: 'var(--dark)',
                            border: '1.5px solid rgba(0,0,0,0.08)',
                            padding: '1rem',
                            borderRadius: '14px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        📚 Biblioteca
                    </motion.button>

                    <motion.button
                        onClick={onViewProgress}
                        whileHover={{ scale: 1.02, background: 'var(--bg-surface)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            background: 'white',
                            color: 'var(--dark)',
                            border: '1.5px solid rgba(0,0,0,0.08)',
                            padding: '1rem',
                            borderRadius: '14px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        <BarChart3 size={16} />
                        Progresso
                    </motion.button>
                </div>
            </div>

            {/* Subscription Management */}
            <motion.div
                className="glass-card"
                initial={false}
                animate={{ height: showSubscriptionDetails ? 'auto' : 'auto' }}
                style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    marginTop: '0.5rem',
                    overflow: 'hidden'
                }}
            >
                <div
                    onClick={() => setShowSubscriptionDetails(!showSubscriptionDetails)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Settings size={20} color="var(--gray)" />
                        <span style={{ color: 'var(--dark)', fontSize: '0.9rem', fontWeight: 500 }}>Gerenciar assinatura</span>
                    </div>
                    <motion.div
                        animate={{ rotate: showSubscriptionDetails ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArrowRight size={18} color="var(--gray)" style={{ transform: 'rotate(90deg)' }} />
                    </motion.div>
                </div>

                {/* Expanded Subscription Details */}
                {showSubscriptionDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}
                    >
                        {/* Subscription Info Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            {/* Start Date */}
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.08)',
                                padding: '1rem',
                                borderRadius: '12px'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>Assinatura desde</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--dark)' }}>
                                    {subscriptionStartDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </div>

                            {/* Days Remaining */}
                            <div style={{
                                background: daysRemaining <= 7 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                padding: '1rem',
                                borderRadius: '12px'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>Expira em</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: daysRemaining <= 7 ? '#EF4444' : 'var(--dark)' }}>
                                    {daysRemaining} dias
                                </div>
                            </div>
                        </div>

                        {/* Auto-renewal Toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(212, 175, 55, 0.08)',
                            padding: '1rem',
                            borderRadius: '12px',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark)' }}>Renovação automática</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                                    {autoRenew ? 'Ativada - cobrança automática' : 'Desativada'}
                                </div>
                            </div>
                            <button
                                onClick={() => toggleAutoRenew()}
                                style={{
                                    width: '50px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: autoRenew ? '#10B981' : 'rgba(0,0,0,0.15)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <motion.div
                                    animate={{ x: autoRenew ? 22 : 2 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        position: 'absolute',
                                        top: '2px'
                                    }}
                                />
                            </button>
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={() => setShowCancelModal(true)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '12px',
                                color: '#EF4444',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <XCircle size={16} />
                            Cancelar plano
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={signOut}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                marginTop: '0.75rem',
                                background: 'transparent',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '12px',
                                color: 'var(--gray)',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span style={{ transform: 'rotate(180deg)' }}>➜</span>
                            Sair da conta
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Cancel Subscription Modal */}
            {showCancelModal && (() => {
                // Calcular eligibilidade para reembolso
                const isTrial = subscription?.status === 'trialing';
                const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
                const lastPaymentDate = expiresAt ? new Date(expiresAt) : null;
                if (lastPaymentDate) lastPaymentDate.setFullYear(lastPaymentDate.getFullYear() - 1);
                const daysSincePayment = lastPaymentDate
                    ? Math.floor((Date.now() - lastPaymentDate.getTime()) / MILLISECONDS_PER_DAY)
                    : 999;
                const isRefundEligible = !isTrial && daysSincePayment <= 7;

                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '2rem',
                                maxWidth: '400px',
                                width: '100%',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <XCircle size={32} color="#EF4444" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                Cancelar assinatura?
                            </h3>

                            {isTrial ? (
                                <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Seu período de teste será encerrado imediatamente. Nenhuma cobrança foi feita.
                                </p>
                            ) : isRefundEligible ? (
                                <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Sua assinatura será cancelada e o <strong style={{ color: '#10B981' }}>reembolso será processado automaticamente</strong>. Você está dentro do prazo de 7 dias.
                                </p>
                            ) : (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                        Sua assinatura será cancelada e futuras cobranças serão interrompidas.
                                    </p>
                                    <div style={{
                                        background: 'rgba(239, 68, 68, 0.08)',
                                        borderRadius: '12px',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.85rem',
                                        color: '#EF4444',
                                        fontWeight: 500
                                    }}>
                                        ⚠️ O prazo de 7 dias para reembolso já expirou. Não haverá devolução do valor pago.
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: '#f5f5f5',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Manter plano
                                </button>
                                <button
                                    disabled={isCancelling}
                                    onClick={async () => {
                                        setIsCancelling(true);
                                        const success = await cancelSubscription();
                                        setIsCancelling(false);
                                        setShowCancelModal(false);
                                        if (success) {
                                            if (isTrial) {
                                                alert('✅ Período de teste cancelado. Nenhuma cobrança foi feita.');
                                            } else if (isRefundEligible) {
                                                alert('✅ Assinatura cancelada e reembolso processado!');
                                            } else {
                                                alert('✅ Assinatura cancelada. Futuras cobranças foram interrompidas.');
                                            }
                                        } else {
                                            alert('Erro ao cancelar assinatura. Entre em contato com o suporte.');
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: isCancelling ? '#ccc' : '#EF4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: isCancelling ? 'wait' : 'pointer'
                                    }}
                                >
                                    {isCancelling ? 'Cancelando...' : 'Confirmar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                );
            })()}

            {/* Growth Card Modal */}
            {showGrowthCard && (
                <div
                    onClick={() => setShowGrowthCard(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        // FIX: Remover alignItems center para deixar o conteúdo crescer e ter scroll se precisar
                        // alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '1rem',
                        backdropFilter: 'blur(5px)',
                        cursor: 'pointer',
                        overflowY: 'auto' // FIX: Scroll no overlay principal
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '500px',
                            cursor: 'default',
                            margin: 'auto' // FIX: Centralizar verticalmente quando couber, mas permitir scroll
                        }}
                    >
                        <button
                            onClick={() => setShowGrowthCard(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'rgba(255,255,255,0.2)', // Semi-transparent for better integration
                                backdropFilter: 'blur(4px)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 1100,
                                color: 'white' // Icon white to match dark theme usually
                            }}
                        >
                            <X size={20} color="white" />
                        </button>
                        <GrowthCard onClose={() => setShowGrowthCard(false)} />
                    </div>
                </div>
            )}

            {/* NEW: Mark As Posted Modal */}
            {showPostedModal && (
                <div
                    onClick={() => setShowPostedModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card"
                        style={{
                            padding: '2rem',
                            borderRadius: '24px',
                            maxWidth: '400px',
                            width: '100%',
                            background: 'white'
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                fontSize: '2rem'
                            }}>
                                ✅
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                Parabéns! 🎉
                            </h3>
                            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Você postou hoje! Isso é consistência. Continue assim! 🔥
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const { data: { user } } = await supabase.auth.getUser();
                                        if (!user) return;

                                        // Get most recent script without posted_at
                                        const { data: scripts } = await supabase
                                            .from('frequency_scripts')
                                            .select('id')
                                            .eq('user_id', user.id)
                                            .is('posted_at', null)
                                            .order('created_at', { ascending: false })
                                            .limit(1);

                                        if (scripts && scripts[0]) {
                                            // FIX: Use standard UTC timestamp
                                            // The RPC function already handles timezone conversion with SET timezone = 'America/Sao_Paulo'
                                            // The previous manual offset was causing double-timezone-shift, making posted_at::date != CURRENT_DATE
                                            await supabase
                                                .from('frequency_scripts')
                                                .update({ posted_at: new Date().toISOString() })
                                                .eq('id', scripts[0].id);

                                            // Update persistent posting stats for notifications
                                            await supabase.rpc('update_posting_stats', { p_user_id: user.id });
                                        }

                                        setShowPostedModal(false);

                                        // FIX: Instead of reload, refresh the stats manually
                                        await fetchPostingStats();

                                        // Show success feedback
                                        alert('✅ Postagem registrada com sucesso!');
                                    } catch (error) {
                                        console.error('Error marking as posted:', error);
                                        alert('Erro ao registrar postagem');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* NEW: Mark As Not Posted Modal */}
            {showNotPostedModal && (
                <div
                    onClick={() => setShowNotPostedModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card"
                        style={{
                            padding: '2rem',
                            borderRadius: '24px',
                            maxWidth: '400px',
                            width: '100%',
                            background: 'white'
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                fontSize: '2rem'
                            }}>
                                ❌
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                Não postei hoje
                            </h3>
                            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Tudo bem! Consistência é sobre ser honesto. Amanhã é um novo dia para manter o ritmo. 💪
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const { data: { user } } = await supabase.auth.getUser();
                                        if (!user) return;

                                        // Create a log entry for not posting today
                                        // We'll use the most recent script or create a placeholder
                                        const { data: scripts } = await supabase
                                            .from('frequency_scripts')
                                            .select('id')
                                            .eq('user_id', user.id)
                                            .order('created_at', { ascending: false })
                                            .limit(1);

                                        if (scripts && scripts[0]) {
                                            // Use Brasília timezone (GMT-3)
                                            const now = new Date();
                                            const brasiliaOffset = -3 * 60; // -180 minutes
                                            const localTime = new Date(now.getTime() + brasiliaOffset * 60 * 1000);

                                            // Mark most recent script as not posted today
                                            await supabase
                                                .from('frequency_scripts')
                                                .update({ not_posted_at: localTime.toISOString() })
                                                .eq('id', scripts[0].id);
                                        }

                                        setShowNotPostedModal(false);
                                        window.location.reload();
                                    } catch (error) {
                                        console.error('Error marking as not posted:', error);
                                        alert('Erro ao registrar');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#EF4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                OK, entendi
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};
