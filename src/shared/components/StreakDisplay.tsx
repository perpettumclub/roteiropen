import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';

interface StreakDisplayProps {
    currentStreak: number;
    scriptsRemaining?: number;
    isPremium?: boolean;
    subscriptionStatus?: string; // 'trialing' | 'active' | etc
    trialDaysLeft?: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
    currentStreak,
    scriptsRemaining,
    isPremium,
    subscriptionStatus,
    trialDaysLeft
}) => {
    const isTrial = subscriptionStatus === 'trialing';

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                gap: '0.75rem',
                zIndex: 100
            }}
        >
            {/* Free Scripts Remaining */}
            {!isPremium && scriptsRemaining !== undefined && (
                <div style={{
                    background: scriptsRemaining > 0
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,107,107,0.1)',
                    border: scriptsRemaining > 0
                        ? '1px solid rgba(0,0,0,0.08)'
                        : '1px solid var(--primary)',
                    color: scriptsRemaining > 0 ? 'var(--dark)' : 'var(--primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)'
                }}>
                    <Zap size={16} />
                    {scriptsRemaining > 0
                        ? `${scriptsRemaining}/3 grátis`
                        : 'Limite atingido'
                    }
                </div>
            )}

            {/* Trial Badge — dias restantes do teste */}
            {isPremium && isTrial && (
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px -5px rgba(255,107,107,0.5)'
                    }}
                >
                    <Flame size={18} />
                    {trialDaysLeft !== undefined ? `${trialDaysLeft}d restante${trialDaysLeft !== 1 ? 's' : ''}` : '3d'}
                </motion.div>
            )}

            {/* Premium Badge — só depois do pagamento */}
            {isPremium && !isTrial && (
                <div style={{
                    background: 'linear-gradient(135deg, #FFD93D, #FF6B6B)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}>
                    👑 Premium
                </div>
            )}
        </motion.div>
    );
};
