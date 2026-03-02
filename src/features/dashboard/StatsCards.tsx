import React, { useState, useEffect } from 'react';

interface StatsCardsProps {
    totalScriptsCreated: number;
    totalPostingDays: number;
    daysToGoal60: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    totalScriptsCreated,
    totalPostingDays,
    daysToGoal60,
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const containerStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? '0.5rem' : '1rem',
        width: '100%',
        padding: isMobile ? '0 0.25rem' : '0'
    };

    const cardStyle: React.CSSProperties = {
        padding: isMobile ? '1rem 0.25rem' : '1.5rem',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '0' : '0.15rem',
        textAlign: 'center',
        minHeight: isMobile ? '110px' : '100px',
        boxSizing: 'border-box'
    };

    const topBlockStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '5px' : '0.25rem',
    };

    const emojiStyle: React.CSSProperties = {
        fontSize: isMobile ? '1.8rem' : '2.0rem',
        lineHeight: 1
    };

    const numberStyle = (color: string): React.CSSProperties => ({
        fontSize: isMobile ? '1.4rem' : '2rem',
        fontWeight: 700,
        color: color,
        lineHeight: 1
    });

    const labelStyle: React.CSSProperties = {
        fontSize: isMobile ? '0.65rem' : '0.8rem',
        color: '#94A3B8',
        fontWeight: 500,
        marginTop: isMobile ? '5px' : '2px'
    };

    return (
        <div style={containerStyle}>
            {/* Card 1: Roteiros */}
            <div className="glass-card" style={cardStyle}>
                <div style={topBlockStyle}>
                    {isMobile && <div style={emojiStyle}>✍️</div>}
                    <div style={numberStyle('#FF6B6B')}>{totalScriptsCreated}</div>
                </div>
                <div style={labelStyle}>Roteiros</div>
            </div>

            {/* Card 2: Dias postando */}
            <div className="glass-card" style={cardStyle}>
                <div style={topBlockStyle}>
                    <div style={emojiStyle}>🔥</div>
                    <div style={numberStyle('#FF6B6B')}>{totalPostingDays}</div>
                </div>
                <div style={labelStyle}>Dias postando</div>
            </div>

            {/* Card 3: Meta 60 */}
            <div className="glass-card" style={cardStyle}>
                <div style={topBlockStyle}>
                    <div style={emojiStyle}>{daysToGoal60 <= 0 ? '🏆' : '🎯'}</div>
                    <div style={numberStyle('#10B981')}>
                        {daysToGoal60 <= 0 ? '60+' : daysToGoal60}
                    </div>
                </div>
                <div style={labelStyle}>
                    {daysToGoal60 <= 0 ? 'Meta atingida!' : 'Pra meta 60'}
                </div>
            </div>
        </div>
    );
};
