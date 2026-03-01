import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, Bell, X, Save, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { DateRangePicker } from './DateRangePicker'; // We might only need a single date picker, but using standard inputs for now

interface GoalSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFollowers?: number;
}

export const GoalSettingModal: React.FC<GoalSettingModalProps> = ({ isOpen, onClose, currentFollowers = 0 }) => {
    const { fetchGoal, saveGoal } = useUser() as any;

    const [targetFollowers, setTargetFollowers] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [notifyWeekly, setNotifyWeekly] = useState(true);
    const [notifyMonthly, setNotifyMonthly] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadGoal();
        }
    }, [isOpen]);

    const loadGoal = async () => {
        setLoading(true);
        const goal = await fetchGoal();
        if (goal) {
            setTargetFollowers(goal.target_followers?.toString() || '');
            setTargetDate(goal.target_date || '');
            setNotifyWeekly(goal.notification_weekly ?? true);
            setNotifyMonthly(goal.notification_monthly ?? true);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!targetFollowers || !targetDate) return;

        setLoading(true);
        try {
            await saveGoal({
                target_followers: parseInt(targetFollowers),
                target_date: targetDate,
                notification_weekly: notifyWeekly,
                notification_monthly: notifyMonthly
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)'
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            background: 'white',
                            width: '100%',
                            maxWidth: '450px',
                            borderRadius: '24px',
                            padding: '1.5rem',
                            position: 'relative',
                            zIndex: 101,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    borderRadius: '12px',
                                    color: '#f59e0b'
                                }}>
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--dark)' }}>
                                        Definir Meta
                                    </h2>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--gray)', margin: 0 }}>
                                        Onde você quer chegar?
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={20} color="var(--gray)" />
                            </button>
                        </div>

                        {/* Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Target Followers */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                                    Meta de Seguidores
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={targetFollowers}
                                        onChange={(e) => setTargetFollowers(e.target.value)}
                                        placeholder="Ex: 10000"
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem 0.85rem 2.5rem',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            fontFamily: 'var(--font-body)',
                                            outline: 'none',
                                            background: '#f8f9fa'
                                        }}
                                    />
                                    <Target size={18} color="var(--gray)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                                {currentFollowers > 0 && targetFollowers && parseInt(targetFollowers) <= currentFollowers && (
                                    <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                        A meta deve ser maior que seus seguidores atuais ({currentFollowers}).
                                    </p>
                                )}
                            </div>

                            {/* Target Date */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                                    Prazo
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem 0.85rem 2.5rem',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            fontFamily: 'var(--font-body)',
                                            outline: 'none',
                                            background: '#f8f9fa'
                                        }}
                                    />
                                    <Calendar size={18} color="var(--gray)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                            </div>

                            {/* Notifications */}
                            <div style={{ padding: '1rem', background: '#F0F9FF', borderRadius: '16px', border: '1px solid #BAE6FD' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Bell size={18} color="#0284C7" />
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0369A1' }}>Lembretes Especiais</h4>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                        <div style={{ position: 'relative', width: '40px', height: '24px' }}>
                                            <input
                                                type="checkbox"
                                                checked={notifyWeekly}
                                                onChange={(e) => setNotifyWeekly(e.target.checked)}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                background: notifyWeekly ? 'var(--primary)' : '#ccc',
                                                borderRadius: '24px',
                                                transition: '0.2s'
                                            }} />
                                            <div style={{
                                                position: 'absolute', top: '2px', left: notifyWeekly ? '18px' : '2px',
                                                width: '20px', height: '20px', background: 'white',
                                                borderRadius: '50%', transition: '0.2s',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>Lembrete Semanal (Enviar Print)</span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                        <div style={{ position: 'relative', width: '40px', height: '24px' }}>
                                            <input
                                                type="checkbox"
                                                checked={notifyMonthly}
                                                onChange={(e) => setNotifyMonthly(e.target.checked)}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                background: notifyMonthly ? 'var(--primary)' : '#ccc',
                                                borderRadius: '24px',
                                                transition: '0.2s'
                                            }} />
                                            <div style={{
                                                position: 'absolute', top: '2px', left: notifyMonthly ? '18px' : '2px',
                                                width: '20px', height: '20px', background: 'white',
                                                borderRadius: '50%', transition: '0.2s',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>Relatório Mensal de Crescimento</span>
                                    </label>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: '2rem' }}>
                            <motion.button
                                onClick={handleSave}
                                disabled={loading || !targetFollowers || !targetDate}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    background: success ? '#10B981' : 'var(--dark)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: (!targetFollowers || !targetDate) ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    'Salvando...'
                                ) : success ? (
                                    <> <Check size={20} /> Meta Definida! </>
                                ) : (
                                    <> <Save size={20} /> Salvar Meta </>
                                )}
                            </motion.button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
