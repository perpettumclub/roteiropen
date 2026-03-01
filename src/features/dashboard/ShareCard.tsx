import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, X, Trophy, TrendingUp, Target, Sparkles } from 'lucide-react';

interface ShareCardProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        username?: string;
        currentFollowers: number;
        initialFollowers?: number;
        goalAchieved?: boolean;
        goalTarget?: number;
        daysTracking?: number;
        badgesCount?: number;
    };
}

export const ShareCard: React.FC<ShareCardProps> = ({ isOpen, onClose, data }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);

    const growth = data.initialFollowers
        ? data.currentFollowers - data.initialFollowers
        : 0;

    const growthPercent = data.initialFollowers && data.initialFollowers > 0
        ? ((growth / data.initialFollowers) * 100).toFixed(1)
        : 0;

    // Generate image from card
    const generateImage = async () => {
        if (!cardRef.current) return;

        setIsGenerating(true);

        try {
            // Dynamic import of html-to-image (if available)
            const { toPng } = await import('html-to-image');

            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#1a1a2e'
            });

            setShareUrl(dataUrl);
        } catch (error) {
            console.error('Error generating image:', error);
            // Fallback: just show the card
            alert('Erro ao gerar imagem. Tire um print da tela!');
        } finally {
            setIsGenerating(false);
        }
    };

    // Download image
    const downloadImage = () => {
        if (!shareUrl) return;

        const link = document.createElement('a');
        link.download = `hooky-crescimento-${Date.now()}.png`;
        link.href = shareUrl;
        link.click();
    };

    // Share via Web Share API
    const shareToSocial = async () => {
        if (!shareUrl) {
            await generateImage();
        }

        if (navigator.share && shareUrl) {
            try {
                // Convert data URL to Blob
                const response = await fetch(shareUrl);
                const blob = await response.blob();
                const file = new File([blob], 'hooky-crescimento.png', { type: 'image/png' });

                await navigator.share({
                    title: 'Meu crescimento no Hooky! 🚀',
                    text: `Alcancei ${data.currentFollowers.toLocaleString()} seguidores! ${data.goalAchieved ? '🏆 Meta batida!' : ''}`,
                    files: [file]
                });
            } catch (error) {


            }
        } else {
            // Fallback to download
            downloadImage();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                alignSelf: 'flex-end',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            <X size={24} />
                        </button>

                        {/* The Card - Spotify Wrapped Style */}
                        <div
                            ref={cardRef}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                                borderRadius: '24px',
                                padding: '2rem',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Background Decorations */}
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '200px',
                                height: '200px',
                                background: 'radial-gradient(circle, rgba(255,107,107,0.3) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '-30px',
                                width: '150px',
                                height: '150px',
                                background: 'radial-gradient(circle, rgba(255,230,109,0.2) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />

                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1.5rem',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Sparkles size={24} color="#FFE66D" />
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    opacity: 0.9
                                }}>
                                    Hooky • Meu Crescimento
                                </span>
                            </div>

                            {/* Main Number */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <div style={{
                                    fontSize: '3.5rem',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    lineHeight: 1.1
                                }}>
                                    {data.currentFollowers.toLocaleString()}
                                </div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    opacity: 0.8,
                                    marginTop: '0.25rem'
                                }}>
                                    seguidores
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1.5rem',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {/* Growth */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    textAlign: 'center'
                                }}>
                                    <TrendingUp size={20} color="#4ADE80" style={{ marginBottom: '0.25rem' }} />
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: '#4ADE80'
                                    }}>
                                        +{growth.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        novos ({growthPercent}%)
                                    </div>
                                </div>

                                {/* Days Tracking */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    textAlign: 'center'
                                }}>
                                    <Target size={20} color="#60A5FA" style={{ marginBottom: '0.25rem' }} />
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: '#60A5FA'
                                    }}>
                                        {data.daysTracking || 0}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        dias rastreando
                                    </div>
                                </div>
                            </div>

                            {/* Goal Achievement */}
                            {data.goalAchieved && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,107,107,0.2) 100%)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Trophy size={20} color="#FFD700" />
                                    <span style={{ fontWeight: 600 }}>
                                        Meta de {data.goalTarget?.toLocaleString()} batida! 🎉
                                    </span>
                                </div>
                            )}

                            {/* Badges Count */}
                            {data.badgesCount && data.badgesCount > 0 && (
                                <div style={{
                                    marginTop: '1rem',
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    opacity: 0.7,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    🏅 {data.badgesCount} conquistas desbloqueadas
                                </div>
                            )}

                            {/* Watermark */}
                            <div style={{
                                marginTop: '1.5rem',
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                opacity: 0.5,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                Feito com ❤️ no Hooky • hooky.app
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <motion.button
                                onClick={generateImage}
                                disabled={isGenerating}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    flex: 1,
                                    background: 'white',
                                    color: '#1a1a2e',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    cursor: isGenerating ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Download size={18} />
                                {isGenerating ? 'Gerando...' : 'Baixar'}
                            </motion.button>

                            <motion.button
                                onClick={shareToSocial}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                                    color: '#1a1a2e',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Share2 size={18} />
                                Compartilhar
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
