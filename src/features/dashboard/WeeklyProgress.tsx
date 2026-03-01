import React from 'react';
import { motion } from 'framer-motion';

interface WeeklyProgressProps {
    postingDaysThisWeek: number;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ postingDaysThisWeek }) => (
    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📅</span>
                <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Esta semana</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: postingDaysThisWeek >= 7 ? '#10B981' : 'var(--gray)' }}>
                {postingDaysThisWeek}/7 dias
            </span>
        </div>
        <div style={{ height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
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
);
