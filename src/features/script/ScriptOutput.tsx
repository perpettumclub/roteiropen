import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, RefreshCw, Share2, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ViralScript } from '../../types';

interface ScriptOutputProps {
    script: ViralScript;
    onReset: () => void;
    onViewDashboard?: () => void;
}

// CTA objective types
const CTA_OBJECTIVES = [
    { id: 'comment', emoji: '💬', label: 'Comentário', template: (keyword: string) => `Comenta '${keyword}' que eu te mando o conteúdo completo!` },
    { id: 'follow', emoji: '👤', label: 'Seguir', template: (keyword: string) => `Segue o perfil pra mais conteúdo sobre ${keyword}!` },
    { id: 'dm', emoji: '📩', label: 'DM', template: (keyword: string) => `Me manda '${keyword}' no direct que eu te respondo!` },
    { id: 'sales', emoji: '🛒', label: 'Vendas', template: (keyword: string) => `Link na bio pra você garantir ${keyword} agora!` },
];

export const ScriptOutput: React.FC<ScriptOutputProps> = ({ script, onReset, onViewDashboard }) => {
    const [copied, setCopied] = useState(false);
    const [selectedHook, setSelectedHook] = useState(0);

    // CTA editing states
    const [selectedCTA, setSelectedCTA] = useState(0);
    const [ctaKeyword, setCtaKeyword] = useState('EU QUERO');

    const currentHook = script.hooks?.[selectedHook] || { type: 'Hook', text: '', emoji: '🎯' };
    const currentCTA = CTA_OBJECTIVES[selectedCTA];

    const getFullText = () => {
        const ctaText = currentCTA.template(ctaKeyword);
        return `${currentHook.emoji} HOOK (${currentHook.type}):
${currentHook.text}

📖 CONFLITO:
${script.conflito}

💥 CLÍMAX:
${script.climax}

💡 SOLUÇÃO:
${script.solucao}

🎬 CTA:
${ctaText}

---
✨ Criado com Hooky
hookr.ai`.trim();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getFullText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const text = getFullText();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Meu Roteiro Viral',
                    text: text,
                });
            } catch (err) {
                // User cancelled or share failed, fallback to copy
                handleCopy();
            }
        } else {
            // Fallback for browsers without Web Share API
            handleCopy();
        }
    };

    const handleDownload = () => {
        const text = getFullText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roteiro-viral.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const nextHook = () => {
        if (script.hooks && selectedHook < script.hooks.length - 1) {
            setSelectedHook(selectedHook + 1);
        }
    };

    const prevHook = () => {
        if (selectedHook > 0) {
            setSelectedHook(selectedHook - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="script-output"
            style={{
                width: '100%',
                maxWidth: '650px',
                textAlign: 'left'
            }}
        >
            <div className="glass-card" style={{
                borderRadius: '32px',
                padding: '2.5rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease',
            }}>
                {/* Header Metadata */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                    fontSize: '0.85rem',
                    color: 'var(--gray)',
                    fontFamily: 'var(--font-mono)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    paddingBottom: '1rem'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>⏱ {script.metadata.duration}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🎭 {script.metadata.tone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📱 {script.metadata.platform}</span>
                </div>

                {/* HOOK Section - Swipeable */}
                <div style={{ marginBottom: '2rem', position: 'relative' }}>
                    <div style={{
                        position: 'absolute', left: '-2.5rem', top: '0.5rem', width: '4px', height: '80%',
                        background: 'var(--primary)', borderRadius: '0 4px 4px 0'
                    }} />

                    {/* Hook Header with Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{
                            fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)',
                            textTransform: 'uppercase', letterSpacing: '0.1em'
                        }}>
                            {currentHook.emoji} Hook ({currentHook.type})
                        </label>

                        {script.hooks && script.hooks.length > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <motion.button
                                    onClick={prevHook}
                                    disabled={selectedHook === 0}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: selectedHook === 0 ? '#eee' : 'var(--primary)',
                                        border: 'none', cursor: selectedHook === 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: selectedHook === 0 ? '#999' : 'white'
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                </motion.button>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray)', minWidth: '40px', textAlign: 'center' }}>
                                    {selectedHook + 1}/{script.hooks.length}
                                </span>
                                <motion.button
                                    onClick={nextHook}
                                    disabled={selectedHook === script.hooks.length - 1}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: selectedHook === script.hooks.length - 1 ? '#eee' : 'var(--primary)',
                                        border: 'none', cursor: selectedHook === script.hooks.length - 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: selectedHook === script.hooks.length - 1 ? '#999' : 'white'
                                    }}
                                >
                                    <ChevronRight size={16} />
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* Hook Text with Animation */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedHook}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                fontSize: '1.4rem',
                                fontFamily: 'var(--font-display)',
                                lineHeight: 1.3,
                                color: 'var(--dark)'
                            }}
                        >
                            {currentHook.text}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* CONFLITO Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#e67e22',
                        marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em'
                    }}>
                        📖 Conflito
                    </label>
                    <div style={{
                        fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--dark)', opacity: 0.9,
                        paddingLeft: '1rem', borderLeft: '2px solid #e67e22'
                    }}>
                        {script.conflito}
                    </div>
                </div>

                {/* CLIMAX Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#9b59b6',
                        marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em'
                    }}>
                        💥 Clímax
                    </label>
                    <div style={{
                        fontSize: '1.2rem', lineHeight: 1.5, color: 'var(--dark)', fontWeight: 500,
                        paddingLeft: '1rem', borderLeft: '2px solid #9b59b6'
                    }}>
                        {script.climax}
                    </div>
                </div>

                {/* SOLUÇÃO Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#27ae60',
                        marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em'
                    }}>
                        💡 Solução
                    </label>
                    <div style={{
                        fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--dark)', opacity: 0.9,
                        paddingLeft: '1rem', borderLeft: '2px solid #27ae60'
                    }}>
                        {script.solucao}
                    </div>
                </div>

                {/* CTA Section - Editable */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)',
                    padding: '1.5rem',
                    borderRadius: '20px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    {/* CTA Header with Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <label style={{
                            fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark)',
                            textTransform: 'uppercase', letterSpacing: '0.1em'
                        }}>
                            {currentCTA.emoji} CTA ({currentCTA.label})
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <motion.button
                                onClick={() => setSelectedCTA(Math.max(0, selectedCTA - 1))}
                                disabled={selectedCTA === 0}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: selectedCTA === 0 ? '#eee' : 'var(--dark)',
                                    border: 'none', cursor: selectedCTA === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedCTA === 0 ? '#999' : 'white'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </motion.button>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray)', minWidth: '30px', textAlign: 'center' }}>
                                {selectedCTA + 1}/{CTA_OBJECTIVES.length}
                            </span>
                            <motion.button
                                onClick={() => setSelectedCTA(Math.min(CTA_OBJECTIVES.length - 1, selectedCTA + 1))}
                                disabled={selectedCTA === CTA_OBJECTIVES.length - 1}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: selectedCTA === CTA_OBJECTIVES.length - 1 ? '#eee' : 'var(--dark)',
                                    border: 'none', cursor: selectedCTA === CTA_OBJECTIVES.length - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedCTA === CTA_OBJECTIVES.length - 1 ? '#999' : 'white'
                                }}
                            >
                                <ChevronRight size={16} />
                            </motion.button>
                        </div>
                    </div>

                    {/* CTA Content with Animation */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCTA}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--dark)', lineHeight: 1.5 }}
                        >
                            👉 {currentCTA.template(ctaKeyword)}
                        </motion.div>
                    </AnimatePresence>

                    {/* Editable Keyword */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Palavra-chave:</span>
                        <input
                            type="text"
                            value={ctaKeyword}
                            onChange={(e) => setCtaKeyword(e.target.value.toUpperCase())}
                            style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '8px',
                                border: '2px dashed var(--primary)',
                                background: 'rgba(255,107,107,0.1)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                textAlign: 'center',
                                outline: 'none',
                                width: '120px'
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <motion.button
                        onClick={handleCopy}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            background: copied ? 'var(--success)' : 'var(--dark)',
                            color: 'white',
                            border: 'none',
                            padding: '1.2rem',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            transition: 'background 0.3s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Copiado!' : 'Copiar Roteiro'}
                    </motion.button>

                    <motion.button
                        onClick={handleShare}
                        whileHover={{ scale: 1.05, background: 'var(--primary)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '56px',
                            background: 'rgba(255,107,107,0.1)',
                            border: '1px solid var(--primary)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            transition: 'all 0.2s'
                        }}
                        title="Compartilhar"
                    >
                        <Share2 size={24} />
                    </motion.button>

                    <motion.button
                        onClick={handleDownload}
                        whileHover={{ scale: 1.05, background: 'var(--bg-surface)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '56px',
                            background: 'rgba(255,255,255,0.5)',
                            border: '1px solid var(--gray)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--dark)'
                        }}
                        title="Baixar"
                    >
                        <Download size={24} />
                    </motion.button>
                </div>

                {/* Watermark/Branding */}
                <div style={{
                    textAlign: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    fontSize: '0.8rem',
                    color: 'var(--gray)',
                    opacity: 0.7
                }}>
                    ✨ Criado com <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>Hooky</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <button
                    onClick={onReset}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--dark)',
                        opacity: 0.6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem'
                    }}
                >
                    <RefreshCw size={16} /> Criar Novo Roteiro
                </button>

                {onViewDashboard && (
                    <motion.button
                        onClick={onViewDashboard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: 'var(--shadow-colored)'
                        }}
                    >
                        <LayoutDashboard size={18} /> Ver Meu Dashboard
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};
