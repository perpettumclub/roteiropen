import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, BarChart3, Plus, Flame, Target, ArrowLeft, Upload, X } from 'lucide-react';

interface MetricEntry {
    date: string;
    followers: number;
    avgLikes: number;
    avgComments: number;
}

interface Screenshot {
    id: string;
    type: 'profile' | 'insights';
    imageData: string;
    date: string;
}

interface ProgressScreenProps {
    onBack: () => void;
}

const STORAGE_KEY = 'hooky_progress_data';
const SCREENSHOTS_KEY = 'hooky_screenshots';

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ onBack }) => {
    const [metrics, setMetrics] = useState<MetricEntry[]>([]);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newFollowers, setNewFollowers] = useState('');
    const [newLikes, setNewLikes] = useState('');
    const [newComments, setNewComments] = useState('');
    const profileInputRef = useRef<HTMLInputElement>(null);
    const insightsInputRef = useRef<HTMLInputElement>(null);

    // Load data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setMetrics(JSON.parse(saved));
        }

        const savedScreenshots = localStorage.getItem(SCREENSHOTS_KEY);
        if (savedScreenshots) {
            setScreenshots(JSON.parse(savedScreenshots));
        }
    }, []);

    // Save screenshots
    const saveScreenshot = (newScreenshot: Screenshot) => {
        const updated = [newScreenshot, ...screenshots];
        localStorage.setItem(SCREENSHOTS_KEY, JSON.stringify(updated));
        setScreenshots(updated);
    };

    const deleteScreenshot = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = screenshots.filter(s => s.id !== id);
        localStorage.setItem(SCREENSHOTS_KEY, JSON.stringify(updated));
        setScreenshots(updated);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'insights') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const newScreenshot: Screenshot = {
                id: Date.now().toString(),
                type,
                imageData: base64String,
                date: new Date().toISOString()
            };
            saveScreenshot(newScreenshot);
            setShowUploadModal(false);
        };
        reader.readAsDataURL(file);
    };

    // Save to localStorage
    const saveMetrics = (data: MetricEntry[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setMetrics(data);
    };

    const handleAddEntry = () => {
        if (!newFollowers) return;

        const entry: MetricEntry = {
            date: new Date().toISOString().split('T')[0],
            followers: parseInt(newFollowers) || 0,
            avgLikes: parseInt(newLikes) || 0,
            avgComments: parseInt(newComments) || 0
        };

        const updated = [...metrics, entry].slice(-30); // Keep last 30 entries
        saveMetrics(updated);
        setShowAddModal(false);
        setNewFollowers('');
        setNewLikes('');
        setNewComments('');
    };

    // Calculate stats
    const latestEntry = metrics[metrics.length - 1];
    const previousEntry = metrics[metrics.length - 2];

    const followerGrowth = latestEntry && previousEntry
        ? latestEntry.followers - previousEntry.followers
        : 0;

    const engagementRate = latestEntry && latestEntry.followers > 0
        ? ((latestEntry.avgLikes + latestEntry.avgComments) / latestEntry.followers * 100).toFixed(2)
        : '0';

    // Calculate streak (consecutive days with entries)
    const streak = metrics.length;

    // Chart data - last 7 entries
    const chartData = metrics.slice(-7);
    const maxFollowers = Math.max(...chartData.map(m => m.followers), 1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                width: '100%',
                maxWidth: '600px',
                padding: '1rem'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        background: 'rgba(255,255,255,0.5)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    color: 'var(--dark)',
                    margin: 0
                }}>
                    Progresso
                </h1>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {/* Followers Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Seguidores</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {latestEntry?.followers.toLocaleString('pt-BR') || '—'}
                    </div>
                    {followerGrowth !== 0 && (
                        <div style={{
                            fontSize: '0.8rem',
                            color: followerGrowth > 0 ? '#10b981' : '#ef4444',
                            fontWeight: 600
                        }}>
                            {followerGrowth > 0 ? '+' : ''}{followerGrowth.toLocaleString('pt-BR')}
                        </div>
                    )}
                </motion.div>

                {/* Streak Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Flame size={18} color="var(--secondary)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Streak</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {streak} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>dias</span>
                    </div>
                </motion.div>

                {/* Engagement Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Heart size={18} color="#ec4899" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Engajamento</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {engagementRate}%
                    </div>
                </motion.div>

                {/* Goal Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Target size={18} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Meta</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        10K
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--gray)'
                    }}>
                        {latestEntry ? Math.round((latestEntry.followers / 10000) * 100) : 0}% concluído
                    </div>
                </motion.div>
            </div>

            {/* Chart Section */}
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    marginBottom: '1.5rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Crescimento</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Últimos 7 registros</span>
                </div>

                {chartData.length > 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '0.5rem',
                        height: '120px',
                        paddingTop: '1rem'
                    }}>
                        {chartData.map((entry, i) => {
                            const height = (entry.followers / maxFollowers) * 100;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                                    style={{
                                        flex: 1,
                                        background: i === chartData.length - 1
                                            ? 'var(--gradient-btn)'
                                            : 'linear-gradient(to top, rgba(255,107,107,0.3), rgba(255,107,107,0.1))',
                                        borderRadius: '8px 8px 0 0',
                                        minHeight: '10px'
                                    }}
                                    title={`${entry.date}: ${entry.followers.toLocaleString('pt-BR')}`}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'var(--gray)',
                        fontSize: '0.9rem'
                    }}>
                        Adicione seu primeiro registro para ver o gráfico
                    </div>
                )}

                {/* Motivational message */}
                {chartData.length > 0 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        color: '#10b981',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        🎉 Ótimo trabalho! Consistência é a chave do sucesso!
                    </div>
                )}
            </motion.div>

            {/* Screenshots Gallery */}
            {screenshots.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--dark)' }}>Histórico Visual</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem'
                    }}>
                        {screenshots.map(screenshot => (
                            <motion.div
                                key={screenshot.id}
                                layoutId={screenshot.id}
                                className="glass-card"
                                style={{
                                    position: 'relative',
                                    aspectRatio: '9/16',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                            >
                                <img
                                    src={screenshot.imageData}
                                    alt={screenshot.type}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '0.5rem',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                    color: 'white',
                                    fontSize: '0.7rem'
                                }}>
                                    {new Date(screenshot.date).toLocaleDateString('pt-BR')}
                                </div>
                                <button
                                    onClick={(e) => deleteScreenshot(screenshot.id, e)}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden File Inputs */}
            <input
                type="file"
                ref={profileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'profile')}
            />
            <input
                type="file"
                ref={insightsInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'insights')}
            />

            {/* Buttons Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Upload Screenshots Button (Black) */}
                <motion.button
                    onClick={() => setShowUploadModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        background: 'var(--dark)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <Upload size={20} />
                    Upload Prints do Crescimento
                </motion.button>

                {/* Add Entry Button */}
                <motion.button
                    onClick={() => setShowAddModal(true)}
                    whileHover={{ scale: 1.02, boxShadow: '0 15px 30px -10px rgba(255,107,107,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        background: 'var(--gradient-btn)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--shadow-colored)'
                    }}
                >
                    <Plus size={20} />
                    Registrar Métricas de Hoje
                </motion.button>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUploadModal(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                width: '100%',
                                maxWidth: '360px',
                                padding: '2rem',
                                borderRadius: '24px'
                            }}
                        >
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                color: 'var(--dark)',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                📸 Histórico Visual
                            </h2>
                            <p style={{
                                textAlign: 'center',
                                color: 'var(--gray)',
                                fontSize: '0.9rem',
                                marginBottom: '2rem'
                            }}>
                                Registre prints do seu perfil e insights para acompanhar visualmente sua evolução.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <motion.button
                                    onClick={() => profileInputRef.current?.click()}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'white',
                                        border: '2px solid rgba(0,0,0,0.05)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        padding: '0.75rem',
                                        background: '#fff0e5',
                                        borderRadius: '12px',
                                        color: '#ff8e53'
                                    }}>
                                        <Users size={24} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--dark)' }}>Print do Perfil</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Número de seguidores</div>
                                    </div>
                                </motion.button>

                                <motion.button
                                    onClick={() => insightsInputRef.current?.click()}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'white',
                                        border: '2px solid rgba(0,0,0,0.05)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        padding: '0.75rem',
                                        background: '#e5f9f0',
                                        borderRadius: '12px',
                                        color: '#10b981'
                                    }}>
                                        <BarChart3 size={24} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--dark)' }}>Print dos Insights</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Alcance e engajamento</div>
                                    </div>
                                </motion.button>
                            </div>

                            <button
                                onClick={() => setShowUploadModal(false)}
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    padding: '0.75rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gray)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                padding: '2rem',
                                borderRadius: '24px'
                            }}
                        >
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                color: 'var(--dark)',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                                📊 Registrar Métricas
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--gray)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Seguidores atuais *
                                    </label>
                                    <input
                                        type="number"
                                        value={newFollowers}
                                        onChange={e => setNewFollowers(e.target.value)}
                                        placeholder="Ex: 1500"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--gray)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Média de likes por post
                                    </label>
                                    <input
                                        type="number"
                                        value={newLikes}
                                        onChange={e => setNewLikes(e.target.value)}
                                        placeholder="Ex: 150"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--gray)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Média de comentários por post
                                    </label>
                                    <input
                                        type="number"
                                        value={newComments}
                                        onChange={e => setNewComments(e.target.value)}
                                        placeholder="Ex: 20"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(0,0,0,0.1)',
                                        background: 'white',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <motion.button
                                    onClick={handleAddEntry}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'var(--gradient-btn)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Salvar
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
