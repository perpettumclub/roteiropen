import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ActivityHeatmap: React.FC = () => {
    const { activityLog } = useUser();

    // Generate dates for the last 3 months (~90 days)
    const today = new Date();
    const startDate = subDays(today, 89); // 90 days roughly

    // Generate all days in the interval
    const days = eachDayOfInterval({
        start: startDate,
        end: today
    });

    // Determine intensity level (0-4)
    const getIntensity = (count: number) => {
        if (!count) return 0;
        if (count === 1) return 1;
        if (count === 2) return 2;
        if (count === 3) return 3;
        return 4; // 4+ is max intensity
    };

    const getIntensityColor = (level: number) => {
        switch (level) {
            case 0: return 'var(--gray-100)'; // Empty
            case 1: return '#BAE6FD'; // Light blue
            case 2: return '#60A5FA'; // Medium blue
            case 3: return '#2563EB'; // Strong blue
            case 4: return '#1E40AF'; // Intense blue
            default: return 'var(--gray-100)';
        }
    };

    return (
        <div className="glass-card" style={{
            padding: '1.5rem',
            borderRadius: '24px',
            width: '100%',
            overflowX: 'auto'
        }}>
            <div style={{
                marginBottom: '1rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span role="img" aria-label="chart">📊</span> Sua Frequência Criativa
            </div>

            <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                maxWidth: '100%',
                justifyContent: 'flex-start'
            }}>
                {days.map((day, index) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const count = activityLog && activityLog[dateStr] ? activityLog[dateStr] : 0;
                    const intensity = getIntensity(count);

                    return (
                        <motion.div
                            key={dateStr}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.005 }} // Staggered animation
                            whileHover={{ scale: 1.4, zIndex: 10 }}
                            title={`${format(day, 'dd/MM/yyyy', { locale: ptBR })}: ${count} roteiros`}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '3px',
                                backgroundColor: getIntensityColor(intensity),
                                cursor: 'default'
                            }}
                        />
                    );
                })}
            </div>

            <div style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--gray)',
                justifyContent: 'flex-end'
            }}>
                <span>Menos</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '2px',
                                backgroundColor: getIntensityColor(level)
                            }}
                        />
                    ))}
                </div>
                <span>Mais</span>
            </div>
        </div>
    );
};
