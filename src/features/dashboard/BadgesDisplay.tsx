import React from 'react';
import { motion } from 'framer-motion';
import { BADGES } from '../../shared/context/UserContext';

interface BadgesDisplayProps {
    badges: string[];
}

export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ badges }) => {
    if (!badges || badges.length === 0) return null;

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '1rem 1.25rem', borderRadius: '20px' }}
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
    );
};
