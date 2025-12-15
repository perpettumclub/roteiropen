import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Trash2, Copy, Check, ChevronLeft } from 'lucide-react';
import { useUser } from '../../shared/context/UserContext';
import { ReferralCard } from '../share/ReferralCard';
import type { SavedScript } from '../../types';

interface ScriptLibraryProps {
    onBack: () => void;
}

export const ScriptLibrary: React.FC<ScriptLibraryProps> = ({ onBack }) => {
    const { scripts, toggleFavorite, deleteScript } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'favorites'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredScripts = scripts.filter(s => {
        const hookText = s.script.hooks?.[s.script.selectedHookIndex || 0]?.text || '';
        const matchesSearch = hookText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.script.conflito.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.script.solucao.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || s.isFavorite;
        return matchesSearch && matchesFilter;
    });

    const handleCopy = (script: SavedScript) => {
        const selectedHook = script.script.hooks?.[script.script.selectedHookIndex || 0];
        const hookEmoji = selectedHook?.emoji || '🎯';
        const hookType = selectedHook?.type || 'Hook';
        const hookText = selectedHook?.text || '';

        const text = `${hookEmoji} HOOK (${hookType}):
${hookText}

📖 CONFLITO:
${script.script.conflito}

💥 CLÍMAX:
${script.script.climax}

💡 SOLUÇÃO:
${script.script.solucao}

🎬 CTA:
${script.script.cta}`;

        navigator.clipboard.writeText(text);
        setCopiedId(script.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{
                width: '100%',
                maxWidth: '650px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ChevronLeft size={24} />
                </motion.button>
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.8rem',
                        color: 'var(--dark)',
                        margin: 0
                    }}>
                        📚 Biblioteca
                    </h1>
                    <p style={{ color: 'var(--gray)', fontSize: '0.9rem', margin: 0 }}>
                        {scripts.length} roteiros salvos
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'white',
                    border: '2px solid rgba(0,0,0,0.05)',
                    borderRadius: '14px',
                    padding: '0.75rem 1rem'
                }}>
                    <Search size={18} color="var(--gray)" />
                    <input
                        type="text"
                        placeholder="Buscar roteiros..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            fontFamily: 'var(--font-body)',
                            background: 'transparent'
                        }}
                    />
                </div>

                <motion.button
                    onClick={() => setFilter(filter === 'all' ? 'favorites' : 'all')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '14px',
                        background: filter === 'favorites' ? 'rgba(255,107,107,0.1)' : 'white',
                        border: filter === 'favorites' ? '2px solid var(--primary)' : '2px solid rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: filter === 'favorites' ? 'var(--primary)' : 'var(--dark)'
                    }}
                >
                    <Heart size={18} fill={filter === 'favorites' ? 'var(--primary)' : 'none'} />
                </motion.button>
            </div>

            {/* Scripts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                    {filteredScripts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: 'var(--gray)'
                            }}
                        >
                            {scripts.length === 0
                                ? '🎤 Nenhum roteiro ainda. Crie o primeiro!'
                                : '🔍 Nenhum roteiro encontrado'
                            }
                        </motion.div>
                    ) : (
                        filteredScripts.map((saved, index) => (
                            <motion.div
                                key={saved.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '20px'
                                }}
                            >
                                {/* Script Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--gray)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {formatDate(saved.createdAt)} • {saved.script.metadata.platform}
                                        </div>
                                        <div style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            color: 'var(--dark)',
                                            lineHeight: 1.3
                                        }}>
                                            {saved.script.hooks?.[saved.script.selectedHookIndex || 0]?.emoji || '🎯'} {(saved.script.hooks?.[saved.script.selectedHookIndex || 0]?.text || '').substring(0, 60)}...
                                        </div>
                                    </div>

                                    {/* Favorite Button */}
                                    <motion.button
                                        onClick={() => toggleFavorite(saved.id)}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.8 }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0.25rem'
                                        }}
                                    >
                                        <Heart
                                            size={22}
                                            color={saved.isFavorite ? '#FF6B6B' : '#ccc'}
                                            fill={saved.isFavorite ? '#FF6B6B' : 'none'}
                                        />
                                    </motion.button>
                                </div>

                                {/* Preview */}
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--gray)',
                                    marginBottom: '1rem',
                                    lineHeight: 1.5
                                }}>
                                    {saved.script.conflito?.substring(0, 100)}...
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <motion.button
                                        onClick={() => handleCopy(saved)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            background: copiedId === saved.id ? '#10B981' : 'var(--dark)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        {copiedId === saved.id ? (
                                            <><Check size={16} /> Copiado!</>
                                        ) : (
                                            <><Copy size={16} /> Copiar</>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        onClick={() => deleteScript(saved.id)}
                                        whileHover={{ scale: 1.05, background: 'rgba(239, 68, 68, 0.1)' }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            background: 'transparent',
                                            color: '#EF4444',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Referral Card */}
            <div style={{ marginTop: '1.5rem' }}>
                <ReferralCard />
            </div>
        </motion.div>
    );
};
