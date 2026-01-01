import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, BarChart3, Bell, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from '../../shared/context/UserContext';
import { AISuggestions } from '../../shared/components/AISuggestions';
import { ActivityHeatmap } from '../../shared/components/ActivityHeatmap';
import { DailyChallengeCard } from '../../shared/components/DailyChallengeCard';


import { useReminders } from '../../hooks/useReminders';
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
        currentStreak
    } = useUser();

    // Notifications logic
    const { permission, requestPermission } = useReminders();

    // Growth Card Modal State
    const [showGrowthCard, setShowGrowthCard] = React.useState(false);

    // Ref to track if confetti has been fired for this session/value to avoid double firing on re-renders
    const hasFiredConfetti = useRef(false);

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

    // Generate last 7 days for mini heatmap
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 86400000);
        const dateStr = date.toDateString();
        const count = activityLog[dateStr] || 0;
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3);
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

                {/* Current Streak */}
                <div className="glass-card" style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF6B6B' }}>
                        🔥 {currentStreak}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        Dias seguidos
                    </div>
                </div>

                {/* Weekly Target */}
                <div className="glass-card" style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>
                        🎯 {weeklyGoal}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        Meta/semana
                    </div>
                </div>
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

            {/* Weekly Goal Progress */}
            <div className="glass-card" style={{
                padding: '1.5rem',
                borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Meta Semanal</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                        {scriptsThisWeek}/{weeklyGoal} roteiros
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
                        animate={{ width: `${weeklyProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: weeklyProgress >= 100
                                ? 'linear-gradient(90deg, #10B981, #34D399)'
                                : 'var(--gradient-btn)',
                            borderRadius: '6px'
                        }}
                    />
                </div>

                {weeklyProgress >= 100 && (
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
                        🎉 Meta batida! Você é incrível!
                    </div>
                )}
            </div>

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
                                        ? 'var(--primary)'
                                        : day.count >= 2
                                            ? 'rgba(255,107,107,0.6)'
                                            : 'rgba(255,107,107,0.3)',
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
                        console.log('Suggestion clicked:', suggestion);
                        onCreateNew();
                    }}
                />
            </div>

            {/* Activity Heatmap - Visual Consistency */}
            <div style={{ marginBottom: '1.5rem' }}>
                <ActivityHeatmap />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <motion.button
                    onClick={onCreateNew}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        flex: 2,
                        background: 'var(--dark)',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    <Zap size={20} />
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
                        border: '2px solid rgba(0,0,0,0.08)',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
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
                        border: '2px solid rgba(0,0,0,0.08)',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <BarChart3 size={18} />
                    Progresso
                </motion.button>
            </div>
            {/* Growth Card Modal */}
            {showGrowthCard && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                        <button
                            onClick={() => setShowGrowthCard(false)}
                            style={{
                                position: 'absolute',
                                top: '-3rem',
                                right: 0,
                                background: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.25rem'
                            }}
                        >
                            <X size={24} color="var(--dark)" />
                        </button>
                        <GrowthCard onClose={() => setShowGrowthCard(false)} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};
