import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, ArrowRight, Monitor, Smartphone, Check } from 'lucide-react';

interface ShareScreenProps {
    scriptContent: string;
    onShare: () => void;
    onSkip: () => void;
}

export const ShareScreen: React.FC<ShareScreenProps> = ({ scriptContent, onShare, onSkip }) => {
    const [copied, setCopied] = useState(false);
    const [showTeleprompter, setShowTeleprompter] = useState(false);

    const handleCopyClean = async () => {
        // Clean text: only the script sections, no metadata or watermarks
        const cleanContent = scriptContent
            .replace(/---[\s\S]*$/, '') // Remove footer if exists
            .replace(/✨ Criado com Hooky[\s\S]*$/, '')
            .trim();

        await navigator.clipboard.writeText(cleanContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onShare();
    };

    const handleSendToMobile = () => {
        const cleanContent = scriptContent
            .replace(/---[\s\S]*$/, '')
            .replace(/✨ Criado com Hooky[\s\S]*$/, '')
            .trim();

        const text = encodeURIComponent(`Meu Roteiro do Hooky 🚀\n\n${cleanContent}`);
        // Opening WhatsApp without a specific number allows picking 'Me' or a contact
        window.open(`https://wa.me/?text=${text}`, '_blank');
        onShare();
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: 'var(--gradient-primary)'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="glass-card"
                    style={{
                        maxWidth: '420px',
                        width: '100%',
                        padding: '2.5rem',
                        borderRadius: '32px',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    {/* Skip button */}
                    <button
                        onClick={onSkip}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            opacity: 0.5,
                            padding: '0.5rem'
                        }}
                        aria-label="Pular"
                    >
                        <X size={20} />
                    </button>

                    {/* Celebration Icon */}
                    <motion.div
                        animate={{
                            rotate: [0, -10, 10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 0.5 }}
                        style={{
                            fontSize: '4rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        🎉
                    </motion.div>

                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.8rem',
                        color: 'var(--dark)',
                        marginBottom: '0.5rem'
                    }}>
                        Roteiro pronto!
                    </h2>

                    <p style={{
                        color: 'var(--gray)',
                        fontSize: '1rem',
                        marginBottom: '2rem',
                        lineHeight: 1.6
                    }}>
                        Seu roteiro foi otimizado pela IA. Agora é só escolher como você quer gravar.
                    </p>

                    {/* Action Options */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        {/* Copy Clean Script (Primary) */}
                        <motion.button
                            onClick={handleCopyClean}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                background: copied ? 'var(--success)' : 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
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
                                gap: '0.75rem',
                                boxShadow: '0 8px 20px -5px rgba(253, 29, 29, 0.4)',
                                transition: 'background 0.3s ease'
                            }}
                        >
                            {copied ? <Check size={22} /> : <Copy size={22} />}
                            {copied ? 'Copiado!' : 'Copiar Roteiro Limpo'}
                        </motion.button>

                        {/* Teleprompter Mode */}
                        <motion.button
                            onClick={() => setShowTeleprompter(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
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
                                gap: '0.75rem',
                                boxShadow: '0 8px 20px -5px rgba(0,0,0,0.2)'
                            }}
                        >
                            <Monitor size={22} />
                            Abrir Teleprompter
                        </motion.button>

                        {/* Send to Mobile (WhatsApp) */}
                        <motion.button
                            onClick={handleSendToMobile}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                background: '#25D366',
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
                                gap: '0.75rem',
                                boxShadow: '0 8px 20px -5px rgba(37, 211, 102, 0.4)'
                            }}
                        >
                            <Smartphone size={22} />
                            Mandar para meu Celular
                        </motion.button>
                    </div>

                    {/* Incentive Text - Restored but simplified */}
                    <div style={{
                        background: 'rgba(255,107,107,0.05)',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(255,107,107,0.1)'
                    }}>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--dark)',
                            margin: 0,
                            fontWeight: 500,
                            opacity: 0.8
                        }}>
                            💡 <strong>Dica:</strong> Use o teleprompter se estiver no celular para manter o contato visual com a câmera.
                        </p>
                    </div>

                    {/* Finalize Button */}
                    <button
                        onClick={onSkip}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600
                        }}
                    >
                        Concluir e ir para o Dashboard <ArrowRight size={18} />
                    </button>
                </motion.div>
            </motion.div>

            {/* Teleprompter Overlay */}
            <AnimatePresence>
                {showTeleprompter && (
                    <TeleprompterOverlay
                        text={scriptContent}
                        onClose={() => setShowTeleprompter(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

interface TeleprompterOverlayProps {
    text: string;
    onClose: () => void;
}

const TeleprompterOverlay: React.FC<TeleprompterOverlayProps> = ({ text, onClose }) => {
    const [scrollSpeed, setScrollSpeed] = useState(2);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Filter text for teleprompter (cleaner)
    const cleanText = text
        .replace(/---[\s\S]*$/, '')
        .replace(/✨ Criado com Hooky[\s\S]*$/, '')
        .trim();

    useEffect(() => {
        let intervalId: any;
        if (isAutoScrolling) {
            intervalId = setInterval(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop += scrollSpeed;
                }
            }, 50);
        }
        return () => clearInterval(intervalId);
    }, [isAutoScrolling, scrollSpeed]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: '#0a0a0a',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                color: 'white'
            }}
        >
            {/* Header Controls */}
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#121212'
            }}>
                <button
                    onClick={onClose}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <X size={18} /> Sair
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Velocidade:</span>
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                onClick={() => setScrollSpeed(s)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                                    background: scrollSpeed === s ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: 'white', cursor: 'pointer', fontSize: '0.8rem'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                        style={{
                            background: isAutoScrolling ? '#FF6B6B' : 'var(--primary)',
                            border: 'none', color: 'white', padding: '0.5rem 1.5rem',
                            borderRadius: '10px', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        {isAutoScrolling ? 'Pausar' : 'Iniciar Scroll'}
                    </button>
                </div>
            </div>

            {/* Script Text Container */}
            <div
                ref={scrollContainerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10vh 2rem 50vh 2rem',
                    textAlign: 'center',
                    scrollBehavior: 'smooth'
                }}
            >
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    fontSize: '3.5rem',
                    lineHeight: 1.4,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                    {cleanText.split('\n').map((line, i) => (
                        <p key={i} style={{ marginBottom: '2rem', opacity: line.trim() ? 1 : 0 }}>
                            {line}
                        </p>
                    ))}
                </div>
            </div>

        </motion.div>
    );
};
