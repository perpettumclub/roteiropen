import React from 'react';
import { TrendingUp } from 'lucide-react';
import { MILLISECONDS_PER_DAY } from '../../shared/constants';

interface Last7DaysChartProps {
    postingLog: { [date: string]: number };
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Last7DaysChart: React.FC<Last7DaysChartProps> = ({ postingLog }) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * MILLISECONDS_PER_DAY);
        const dateStr = date.toLocaleDateString('en-CA');
        const count = postingLog[dateStr] || 0;
        const dayName = DAY_NAMES[date.getDay()];
        return { date: dateStr, count, dayName };
    });

    return (
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
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
                                    ? '#10B981'
                                    : day.count >= 2
                                        ? 'rgba(16,185,129,0.6)'
                                        : 'rgba(16,185,129,0.3)',
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
    );
};
