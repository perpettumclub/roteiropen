import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useUser, BADGES } from '../context/UserContext';
import confetti from 'canvas-confetti';

export const BadgeNotification: React.FC = () => {
    const { newlyEarnedBadge, clearNewBadge } = useUser();

    useEffect(() => {
        if (newlyEarnedBadge) {
            // Trigger confetti explosion
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 9999
            });

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                clearNewBadge();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [newlyEarnedBadge, clearNewBadge]);

    if (!newlyEarnedBadge) return null;

    const badge = BADGES[newlyEarnedBadge];
    if (!badge) return null;

    return (
        <AnimatePresence>
            {newlyEarnedBadge && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 50 }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        background: 'white',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                        border: '2px solid rgba(0,0,0,0.05)',
                        zIndex: 9999,
                        maxWidth: '350px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        background: `${badge.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        border: `2px solid ${badge.color}40`
                    }}>
                        {badge.emoji}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            fontWeight: 800,
                            color: badge.color,
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}>
                            <Sparkles size={12} /> Nova Conquista!
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.4rem',
                            lineHeight: '1.2',
                            color: 'var(--dark)',
                            margin: '0.2rem 0'
                        }}>
                            {badge.title}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                            {badge.description}
                        </div>
                    </div>

                    <button
                        onClick={clearNewBadge}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gray)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>

                    {/* Progress Bar Timer */}
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: '4px',
                            background: badge.color,
                            borderBottomLeftRadius: '24px',
                            borderBottomRightRadius: '24px'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
