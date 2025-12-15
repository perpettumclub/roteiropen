import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Instagram, MessageCircle, X, ArrowRight } from 'lucide-react';

interface ShareScreenProps {
    scriptContent: string;
    onShare: () => void;
    onSkip: () => void;
}

export const ShareScreen: React.FC<ShareScreenProps> = ({ scriptContent, onShare, onSkip }) => {
    const handleShare = async () => {
        const text = scriptContent.substring(0, 500) + (scriptContent.length > 500 ? '...' : '');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Meu Roteiro Viral',
                    text: text,
                });
                onShare();
            } catch {
                // User cancelled
            }
        } else {
            // Fallback - copy to clipboard
            await navigator.clipboard.writeText(text);
            onShare();
        }
    };

    const handleInstagram = () => {
        // Copy text and open Instagram
        navigator.clipboard.writeText(scriptContent);
        window.open('https://instagram.com', '_blank');
        onShare();
    };

    return (
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
                    Roteiro criado com sucesso!
                </h2>

                <p style={{
                    color: 'var(--gray)',
                    fontSize: '1rem',
                    marginBottom: '2rem',
                    lineHeight: 1.6
                }}>
                    Que tal compartilhar com seus seguidores e mostrar que você está criando conteúdo profissional?
                </p>

                {/* Share Options */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                }}>
                    {/* Instagram */}
                    <motion.button
                        onClick={handleInstagram}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
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
                            boxShadow: '0 8px 20px -5px rgba(131, 58, 180, 0.4)'
                        }}
                    >
                        <Instagram size={22} />
                        Compartilhar no Instagram
                    </motion.button>

                    {/* WhatsApp */}
                    <motion.button
                        onClick={() => {
                            const text = encodeURIComponent(`Olha o roteiro que eu criei usando Hooky! 🚀\n\n${scriptContent.substring(0, 300)}...`);
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                            onShare();
                        }}
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
                        <MessageCircle size={22} />
                        Enviar no WhatsApp
                    </motion.button>

                    {/* Generic Share */}
                    <motion.button
                        onClick={handleShare}
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
                            gap: '0.75rem'
                        }}
                    >
                        <Share2 size={22} />
                        Outras opções
                    </motion.button>
                </div>

                {/* Incentive Text */}
                <div style={{
                    background: 'rgba(255,215,0,0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--dark)',
                        margin: 0,
                        fontWeight: 500
                    }}>
                        🎁 Marque <strong>@hooky</strong> nos stories para ganhar dicas exclusivas!
                    </p>
                </div>

                {/* Skip Link */}
                <button
                    onClick={onSkip}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gray)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: 0.8
                    }}
                >
                    Pular por agora <ArrowRight size={16} />
                </button>
            </motion.div>
        </motion.div>
    );
};
