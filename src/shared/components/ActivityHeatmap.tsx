import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { format, subWeeks, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityHeatmapProps {
    postingLog?: { [date: string]: number };
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ postingLog }) => {
    const { activityLog } = useUser();
    const dataSource = postingLog || activityLog;

    // Responsive: calculate weeks based on screen width
    const [numWeeks, setNumWeeks] = useState(32);

    useEffect(() => {
        const calculateWeeks = () => {
            const width = window.innerWidth;
            // Cell = 12px + 3px gap = 15px per column, plus ~40px for day labels
            // Mobile: fewer weeks to avoid scrollbar
            if (width < 400) {
                setNumWeeks(16); // ~4 months
            } else if (width < 500) {
                setNumWeeks(20); // ~5 months
            } else if (width < 600) {
                setNumWeeks(24); // ~6 months
            } else {
                setNumWeeks(32); // ~7 months (desktop)
            }
        };

        calculateWeeks();
        window.addEventListener('resize', calculateWeeks);
        return () => window.removeEventListener('resize', calculateWeeks);
    }, []);

    // GitHub-style sliding window
    const today = new Date();
    const startDate = startOfWeek(subWeeks(today, numWeeks - 1), { weekStartsOn: 0 });

    // Generate all days from startDate to today
    const allDays: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
        allDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Organize days into weeks (columns)
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    allDays.forEach((day) => {
        const dayOfWeek = getDay(day); // 0 = Sunday

        // Start new week on Sunday (or first day)
        if (dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        currentWeek.push(day);
    });

    // Don't forget the last incomplete week
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    // Day labels (show only Seg, Qua, Sex for compactness)
    const dayLabels = ['', 'Seg', '', 'Qua', '', 'Sex', ''];

    // Check if a week should show a month label
    const getMonthLabel = (week: Date[], weekIndex: number, allWeeks: Date[][]): string | null => {
        if (week.length === 0) return null;

        const firstDayOfWeek = week[0];
        const month = firstDayOfWeek.getMonth();

        // Show label if it's the first week OR if month changed from previous week
        if (weekIndex === 0) {
            return format(firstDayOfWeek, 'MMM', { locale: ptBR });
        }

        const prevWeek = allWeeks[weekIndex - 1];
        if (prevWeek && prevWeek.length > 0) {
            const prevMonth = prevWeek[0].getMonth();
            if (month !== prevMonth) {
                return format(firstDayOfWeek, 'MMM', { locale: ptBR });
            }
        }

        return null;
    };

    // Intensity colors (GitHub green style)
    const getIntensityColor = (count: number) => {
        if (!count) return 'rgba(0,0,0,0.05)';
        if (count === 1) return 'rgba(16,185,129,0.3)';
        if (count === 2) return 'rgba(16,185,129,0.5)';
        if (count === 3) return 'rgba(16,185,129,0.7)';
        return '#10B981';
    };

    const isPostingData = !!postingLog;
    const label = isPostingData ? 'Sua Frequência de Posts' : 'Sua Frequência Criativa';
    const tooltipSuffix = isPostingData ? 'posts' : 'roteiros';

    const cellSize = 12;
    const cellGap = 3;

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
                <span role="img" aria-label="chart">📊</span> {label}
            </div>

            {/* GitHub-style grid container */}
            <div style={{ display: 'flex', width: '100%' }}>
                {/* Day labels column */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${cellGap}px`,
                    marginRight: '8px',
                    paddingTop: '20px'
                }}>
                    {dayLabels.map((day, i) => (
                        <div key={i} style={{
                            height: `${cellSize}px`,
                            fontSize: '10px',
                            color: 'var(--gray)',
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: '24px'
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Weeks grid */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: '3px',
                    flex: 1
                }}>
                    {weeks.map((week, weekIndex) => {
                        const monthLabel = getMonthLabel(week, weekIndex, weeks);
                        // For incomplete first week, we need to add empty cells at the top
                        const startDayOfWeek = weekIndex === 0 ? getDay(week[0]) : 0;

                        return (
                            <div key={weekIndex} style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {/* Month label */}
                                <div style={{
                                    height: '16px',
                                    marginBottom: '4px',
                                    fontSize: '10px',
                                    color: 'var(--gray)',
                                    textTransform: 'capitalize'
                                }}>
                                    {monthLabel || ''}
                                </div>

                                {/* Days column */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: `${cellGap}px`
                                }}>
                                    {/* Empty cells for incomplete first week */}
                                    {weekIndex === 0 && Array.from({ length: startDayOfWeek }).map((_, i) => (
                                        <div key={`empty-${i}`} style={{
                                            width: `${cellSize}px`,
                                            height: `${cellSize}px`,
                                            borderRadius: '2px',
                                            backgroundColor: 'transparent'
                                        }} />
                                    ))}

                                    {/* Actual day cells */}
                                    {week.map((day, dayIndex) => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const count = dataSource?.[dateStr] || 0;

                                        return (
                                            <motion.div
                                                key={dateStr}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                                                whileHover={{ scale: 1.4, zIndex: 10 }}
                                                title={`${format(day, 'dd/MM/yyyy', { locale: ptBR })}: ${count} ${tooltipSuffix}`}
                                                style={{
                                                    width: `${cellSize}px`,
                                                    height: `${cellSize}px`,
                                                    borderRadius: '2px',
                                                    backgroundColor: getIntensityColor(count),
                                                    cursor: 'default'
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
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
