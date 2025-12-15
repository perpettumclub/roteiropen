import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Gift, X } from 'lucide-react';

interface ShareUnlockProps {
    reward: string;
    onShare: () => void;
    onClose: () => void;
}

export const ShareUnlock: React.FC<ShareUnlockProps> = ({ reward, onShare, onClose }) => {
    const handleShare = async () => {
        const shareText = `🔥 Acabei de criar um roteiro viral em 15 segundos com Hooky!\n\nÉ tipo ter um ghostwriter de Reels no bolso. Experimenta:\n\nhooky.app`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Hooky - Roteiros Virais com IA',
                    text: shareText,
                    url: 'https://hookr.ai'
                });
                onShare();
            } catch (err) {
                // User cancelled
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(shareText + '\n\nhttps://hookr.ai');
            onShare();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                zIndex: 1000
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
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
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.5,
                        padding: '0.5rem'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Gift Animation */}
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, -5, 5, 0]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #FFD93D, #FF6B6B)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 20px 40px -15px rgba(255,107,107,0.4)'
                    }}
                >
                    <Gift size={48} color="white" />
                </motion.div>

                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    color: 'var(--dark)',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3
                }}>
                    🎁 Desbloqueie {reward}!
                </h2>

                <p style={{
                    color: 'var(--gray)',
                    marginBottom: '2rem',
                    fontSize: '1rem',
                    lineHeight: 1.5
                }}>
                    Compartilhe o Hooky com seus amigos e ganhe <strong>+5 roteiros grátis</strong> + acesso a hooks premium!
                </p>

                <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        width: '100%',
                        background: 'var(--gradient-btn)',
                        color: 'white',
                        border: 'none',
                        padding: '1.2rem',
                        borderRadius: '16px',
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--shadow-colored)'
                    }}
                >
                    <Share2 size={20} />
                    Compartilhar e Desbloquear
                </motion.button>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--gray)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Talvez depois
                </button>
            </motion.div>
        </motion.div>
    );
};
