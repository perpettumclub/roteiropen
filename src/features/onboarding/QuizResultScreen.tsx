/**
 * Quiz Result Screen
 * 
 * Displays the final result after completing the quiz.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Zap, Users, Sparkles } from 'lucide-react';

export const QuizResultScreen: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2rem',
                textAlign: 'center'
            }}
        >
            {/* Success icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--gradient-btn)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 10px 30px rgba(255,107,107,0.3)'
                }}
            >
                <CheckCircle size={40} color="white" />
            </motion.div>

            {/* Title */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    color: 'var(--dark)',
                    marginBottom: '0.5rem'
                }}
            >
                Parabéns!
            </motion.h2>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                    color: 'var(--dark)',
                    fontSize: '1.1rem',
                    marginBottom: '2rem'
                }}
            >
                Seu plano personalizado está pronto!
            </motion.p>

            {/* Stats card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card"
                style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    marginBottom: '1.5rem'
                }}
            >
                <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1rem' }}>
                    Recomendação diária
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    textAlign: 'center'
                }}>
                    <StatItem
                        icon={<TrendingUp size={20} color="var(--primary)" />}
                        value="3"
                        label="Roteiros"
                        bgColor="rgba(255,107,107,0.1)"
                    />
                    <StatItem
                        icon={<Zap size={20} color="var(--secondary)" />}
                        value="15s"
                        label="Por roteiro"
                        bgColor="rgba(255,230,109,0.2)"
                    />
                    <StatItem
                        icon={<Users size={20} color="#10b981" />}
                        value="10K"
                        label="Meta 90 dias"
                        bgColor="rgba(16,185,129,0.1)"
                    />
                </div>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'var(--gray)',
                    fontSize: '0.85rem'
                }}
            >
                <Sparkles size={16} />
                Carregando...
            </motion.div>
        </motion.div>
    );
};

// =============================================================================
// STAT ITEM COMPONENT
// =============================================================================

interface StatItemProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    bgColor: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, bgColor }) => (
    <div>
        <div style={{
            width: '50px',
            height: '50px',
            background: bgColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.5rem'
        }}>
            {icon}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--dark)' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{label}</div>
    </div>
);
