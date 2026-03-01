import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, BarChart3, Bell, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';

// Context & Hooks
import { useUser } from '../../shared/context/UserContext';
import { useReminders } from '../../hooks/useReminders';
import { usePostingStats } from '../../hooks/usePostingStats';

// Shared Components
import { AISuggestions } from '../../shared/components/AISuggestions';
import { ActivityHeatmap } from '../../shared/components/ActivityHeatmap';
import { DailyChallengeCard } from '../../shared/components/DailyChallengeCard';
import { GrowthCard } from '../share';

// Dashboard Subcomponents
import { StatsCards } from './StatsCards';
import { WeeklyProgress } from './WeeklyProgress';
import { BadgesDisplay } from './BadgesDisplay';
import { Last7DaysChart } from './Last7DaysChart';
import { SubscriptionManager } from './SubscriptionManager';
import { PostingModals } from './PostingModals';

interface DashboardProps {
    onCreateNew: () => void;
    onViewLibrary: () => void;
    onViewProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateNew, onViewLibrary, onViewProgress }) => {
    const { scriptsThisWeek, weeklyGoal, creatorProfile, totalScriptsCreated, badges } = useUser();
    const { permission, requestPermission } = useReminders();
    const { totalPostingDays, daysToGoal60, postingDaysThisWeek, postingLog, refreshStats } = usePostingStats();

    // Modal state
    const [showGrowthCard, setShowGrowthCard] = useState(false);
    const [showPostedModal, setShowPostedModal] = useState(false);
    const [showNotPostedModal, setShowNotPostedModal] = useState(false);

    // Celebration effect
    const hasFiredConfetti = useRef(false);
    const weeklyProgress = Math.min((scriptsThisWeek / weeklyGoal) * 100, 100);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            {/* Welcome Header */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>
                    Olá, {creatorProfile?.creatorType === 'relampago' ? '⚡' :
                        creatorProfile?.creatorType === 'viral' ? '🔥' :
                            creatorProfile?.creatorType === 'estrategista' ? '🎯' : '💎'} Criador!
                </h1>
                <p style={{ color: 'var(--gray)', fontSize: '1rem' }}>Sua central de roteiros virais</p>
            </div>

            {/* Notification Permission */}
            {permission === 'default' && (
                <motion.button
                    onClick={requestPermission}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE',
                        padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', marginBottom: '0.5rem'
                    }}
                >
                    <Bell size={16} /> Ativar lembretes de progresso
                </motion.button>
            )}

            {/* Stats Cards */}
            <StatsCards
                totalScriptsCreated={totalScriptsCreated}
                totalPostingDays={totalPostingDays}
                daysToGoal60={daysToGoal60}
            />

            {/* Weekly Posting Progress */}
            <WeeklyProgress postingDaysThisWeek={postingDaysThisWeek} />

            {/* Growth Card Banner */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGrowthCard(true)}
                className="glass-card"
                style={{
                    padding: '1rem', borderRadius: '20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#D4AF37', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--dark)' }}>Seu crescimento</h3>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--gray)' }}>Compartilhe sua evolução e ganhe destaque</p>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                    <ArrowRight size={20} color="#D4AF37" />
                </div>
            </motion.div>

            {/* Badges */}
            <BadgesDisplay badges={badges} />

            {/* Activity: Last 7 Days */}
            <Last7DaysChart postingLog={postingLog} />

            {/* Daily Challenge */}
            <div style={{ marginBottom: '1.5rem' }}><DailyChallengeCard /></div>

            {/* AI Suggestions */}
            <div style={{ marginBottom: '1.5rem' }}>
                <AISuggestions onSuggestionClick={() => onCreateNew()} />
            </div>

            {/* Activity Heatmap */}
            <div style={{ marginBottom: '1.5rem' }}>
                <ActivityHeatmap postingLog={postingLog} />
            </div>

            {/* Posting Actions */}
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{
                    fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray)', marginBottom: '0.75rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-body)'
                }}>
                    ✨ Registrar postagem de hoje
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <motion.button
                        onClick={() => setShowNotPostedModal(true)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1, background: 'white', color: '#EF4444', border: '2px solid rgba(239, 68, 68, 0.2)',
                            padding: '1.5rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
                        }}
                    >
                        ❌ Não postei
                    </motion.button>
                    <motion.button
                        onClick={() => setShowPostedModal(true)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1, background: 'linear-gradient(135deg, #10B981, #34D399)', color: 'white',
                            border: 'none', padding: '1.5rem', borderRadius: '16px', fontSize: '1.1rem',
                            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        ✅ Postei!
                    </motion.button>
                </div>
            </div>

            {/* Secondary Actions */}
            <div>
                <h3 style={{
                    fontSize: '0.75rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', marginBottom: '0.5rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-body)'
                }}>
                    Outras ações
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <motion.button onClick={onCreateNew} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 2, background: 'var(--dark)', color: 'white', border: 'none', padding: '1rem',
                            borderRadius: '14px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        <Zap size={18} /> Criar Roteiro
                    </motion.button>
                    <motion.button onClick={onViewLibrary} whileHover={{ scale: 1.02, background: 'var(--bg-surface)' }} whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1, background: 'white', color: 'var(--dark)', border: '1.5px solid rgba(0,0,0,0.08)',
                            padding: '1rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                        }}
                    >
                        📚 Biblioteca
                    </motion.button>
                    <motion.button onClick={onViewProgress} whileHover={{ scale: 1.02, background: 'var(--bg-surface)' }} whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1, background: 'white', color: 'var(--dark)', border: '1.5px solid rgba(0,0,0,0.08)',
                            padding: '1rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                        }}
                    >
                        <BarChart3 size={16} /> Progresso
                    </motion.button>
                </div>
            </div>

            {/* Subscription Management */}
            <SubscriptionManager />

            {/* Growth Card Modal */}
            {showGrowthCard && (
                <div
                    onClick={() => setShowGrowthCard(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex',
                        justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)',
                        cursor: 'pointer', overflowY: 'auto'
                    }}
                >
                    <div onClick={(e) => e.stopPropagation()}
                        style={{ position: 'relative', width: '100%', maxWidth: '500px', cursor: 'default', margin: 'auto' }}
                    >
                        <button onClick={() => setShowGrowthCard(false)} style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                            border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 1100, color: 'white'
                        }}>
                            <X size={20} color="white" />
                        </button>
                        <GrowthCard onClose={() => setShowGrowthCard(false)} />
                    </div>
                </div>
            )}

            {/* Posting Modals */}
            <PostingModals
                showPostedModal={showPostedModal}
                showNotPostedModal={showNotPostedModal}
                onClosePosted={() => setShowPostedModal(false)}
                onCloseNotPosted={() => setShowNotPostedModal(false)}
                onPostConfirmed={refreshStats}
            />
        </motion.div>
    );
};
