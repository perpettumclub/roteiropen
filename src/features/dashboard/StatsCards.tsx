import React from 'react';

interface StatsCardsProps {
    totalScriptsCreated: number;
    totalPostingDays: number;
    daysToGoal60: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    totalScriptsCreated,
    totalPostingDays,
    daysToGoal60,
}) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                {totalScriptsCreated}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Roteiros</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF6B6B' }}>
                🔥 {totalPostingDays}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Dias postando</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>
                🎯 {daysToGoal60 <= 0 ? '🏆' : daysToGoal60}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                {daysToGoal60 <= 0 ? 'Meta 60 atingida!' : 'Pra meta 60'}
            </div>
        </div>
    </div>
);
