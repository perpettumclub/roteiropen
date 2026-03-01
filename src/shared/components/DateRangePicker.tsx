import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onChange: (start: Date, end: Date) => void;
}

type ViewMode = 'month' | 'year' | 'decade';

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Internal state for calendar navigation (separate from selected dates)
    const [currentDate, setCurrentDate] = useState(new Date(endDate)); // Start viewing from end date
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    // Selection state during picking
    const [selectingStart, setSelectingStart] = useState<Date | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    // Quick ranges
    const setRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        onChange(start, end);
        setIsOpen(false);
    };

    // Calendar Navigation Helpers
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const changeDate = (offset: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + offset);
        else if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + offset);
        else if (viewMode === 'decade') newDate.setFullYear(newDate.getFullYear() + (offset * 10));
        setCurrentDate(newDate);
    };

    const handleHeaderClick = () => {
        if (viewMode === 'month') setViewMode('year');
        else if (viewMode === 'year') setViewMode('decade');
    };

    const handleSelectMonth = (monthIndex: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(monthIndex);
        setCurrentDate(newDate);
        setViewMode('month');
    };

    const handleSelectYear = (year: number) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(year);
        setCurrentDate(newDate);
        setViewMode('year');
    };

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        if (!selectingStart) {
            // First click: Start a new range selection
            setSelectingStart(clickedDate);
            // Optionally clear end date visually or keep it until second click?
            // Let's just set start and wait for end.
        } else {
            // Second click: Complete selection
            let start = selectingStart;
            let end = clickedDate;

            if (end < start) {
                [start, end] = [end, start];
            }

            onChange(start, end);
            setSelectingStart(null);
            setIsOpen(false);
        }
    };





    // Render Calendar Content
    const renderCalendarContent = () => {
        if (viewMode === 'month') {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
            const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            const padding = Array.from({ length: firstDay }, () => null);

            return (
                <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                            <div key={d} style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                        {padding.map((_, i) => <div key={`pad-${i}`}></div>)}
                        {days.map(day => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const check = date.setHours(0, 0, 0, 0);
                            const isStart = selectingStart && selectingStart.setHours(0, 0, 0, 0) === check;
                            const isRange = !selectingStart && check >= startDate.setHours(0, 0, 0, 0) && check <= endDate.setHours(0, 0, 0, 0);
                            const isToday = check === new Date().setHours(0, 0, 0, 0);

                            return (
                                <div
                                    key={day}
                                    onClick={(e) => { e.stopPropagation(); handleDayClick(day); }}
                                    style={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        background: isStart || isRange ? 'var(--dark)' : (isToday ? '#eee' : 'transparent'),
                                        color: isStart || isRange ? 'white' : 'var(--dark)',
                                        fontWeight: isStart || isRange ? 700 : 400,
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (viewMode === 'year') {
            return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '1rem' }}>
                    {monthNames.map((m, idx) => (
                        <button
                            key={m}
                            onClick={(e) => { e.stopPropagation(); handleSelectMonth(idx); }}
                            style={{
                                background: idx === currentDate.getMonth() ? 'var(--dark)' : 'transparent',
                                border: 'none',
                                color: idx === currentDate.getMonth() ? 'white' : 'var(--gray)',
                                borderRadius: '8px',
                                padding: '1rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: idx === currentDate.getMonth() ? 600 : 400
                            }}
                        >
                            {m.substring(0, 3)}
                        </button>
                    ))}
                </div>
            );
        }

        if (viewMode === 'decade') {
            const startYear = Math.floor(currentDate.getFullYear() / 10) * 10;
            const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

            return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '1rem' }}>
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={(e) => { e.stopPropagation(); handleSelectYear(year); }}
                            style={{
                                background: year === currentDate.getFullYear() ? 'var(--dark)' : 'transparent',
                                border: 'none',
                                color: year === currentDate.getFullYear() ? 'white' : 'var(--gray)',
                                borderRadius: '8px',
                                padding: '1rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                opacity: (year >= startYear && year <= startYear + 9) ? 1 : 0.4
                            }}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            );
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', zIndex: 50 }}>
            {/* Display / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                }}
            >
                <CalendarIcon size={16} color="var(--gray)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--dark)', fontWeight: 500 }}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                </span>
            </div>

            {/* Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            top: '110%',
                            right: 0,
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            width: '320px',
                            overflow: 'hidden',
                            border: '1px solid rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8f8f8'
                        }}>
                            <h3
                                onClick={(e) => { e.stopPropagation(); handleHeaderClick(); }}
                                style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    color: 'var(--dark)',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                }}
                            >
                                {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                                {viewMode === 'year' && currentDate.getFullYear()}
                                {viewMode === 'decade' && `${Math.floor(currentDate.getFullYear() / 10) * 10} - ${Math.floor(currentDate.getFullYear() / 10) * 10 + 9}`}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={(e) => { e.stopPropagation(); changeDate(-1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                    <ChevronLeft size={18} color="var(--gray)" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); changeDate(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                    <ChevronRight size={18} color="var(--gray)" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        {renderCalendarContent()}

                        {/* Quick Select Footer */}
                        <div style={{
                            padding: '0.75rem',
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'center',
                            background: '#f8f8f8'
                        }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setRange(7); }}
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                            >
                                Últimos 7 dias
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setRange(30); }}
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                            >
                                Últimos 30 dias
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
