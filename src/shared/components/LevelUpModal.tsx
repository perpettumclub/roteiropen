import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFollowers: number;
    nextGoal: number;
    onAcceptChallenge: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
    isOpen,
    onClose,
    currentFollowers,
    nextGoal,
    onAcceptChallenge
}) => {

    useEffect(() => {
        if (isOpen) {
            // FIRE CONFETTI! 🎉
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#F59E0B', '#EF4444', '#10B981']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#F59E0B', '#EF4444', '#10B981']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 200, // Higher than other modals
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        style={{
                            background: 'white',
                            width: '100%',
                            maxWidth: '400px',
                            borderRadius: '32px',
                            padding: '2rem',
                            textAlign: 'center',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.4)',
                            border: '4px solid #FCD34D'
                        }}
                    >
                        {/* Trophy Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            style={{
                                width: '100px',
                                height: '100px',
                                background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '-4rem auto 1.5rem',
                                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.5)',
                                border: '6px solid white'
                            }}
                        >
                            <Trophy size={48} color="white" fill="white" />
                        </motion.div>

                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: 'var(--dark)',
                            marginBottom: '0.5rem',
                            lineHeight: 1.1
                        }}>
                            META BATIDA!
                        </h2>
                        <p style={{
                            fontSize: '1rem',
                            color: 'var(--gray)',
                            marginBottom: '2rem'
                        }}>
                            Você atingiu <strong>{currentFollowers.toLocaleString('pt-BR')}</strong> seguidores.<br />
                            Isso é incrível! 🚀
                        </p>

                        <div style={{
                            background: '#FFFBEB',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            border: '2px dashed #FCD34D'
                        }}>
                            <p style={{ fontSize: '0.9rem', color: '#B45309', marginBottom: '0.5rem', fontWeight: 600 }}>
                                PRÓXIMO NÍVEL
                            </p>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#D97706' }}>
                                {nextGoal.toLocaleString('pt-BR')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#B45309', opacity: 0.8 }}>
                                seguidores
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <motion.button
                            onClick={onAcceptChallenge}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '16px',
                                background: 'linear-gradient(to right, #F59E0B, #D97706)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)'
                            }}
                        >
                            Aceitar Desafio <ArrowRight size={20} />
                        </motion.button>

                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                marginTop: '1rem',
                                color: 'var(--gray)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Agora não
                        </button>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
