import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Users, ChevronRight, ArrowRight, Zap } from 'lucide-react';
import { useGlobalStats } from '../../shared/hooks/useGlobalStats';

interface OnboardingScreenProps {
    onComplete: () => void;
}

// Prova social - Depoimentos reais (editar com dados reais)
// =================================================================
// 📌 TESTIMONIALS_PAGE - Guardado para uso futuro com depoimentos reais
// Para reativar: descomentar e usar no step 1
// =================================================================
/*
const TESTIMONIALS = [
    {
        name: 'Juliana M.',
        avatar: '👩‍💼',
        before: '4.2K',
        after: '15.8K',
        days: 47,
        quote: 'Criei 47 roteiros e meu engajamento triplicou!'
    },
    {
        name: 'Rafael S.',
        avatar: '👨‍💻',
        before: '800',
        after: '12K',
        days: 30,
        quote: 'Saí do zero para minha primeira venda em 30 dias'
    },
    {
        name: 'Camila F.',
        avatar: '👩‍🎨',
        before: '2.1K',
        after: '8.5K',
        days: 21,
        quote: 'Finalmente entendi como criar hooks que viralizam'
    }
];
*/

// avgGrowth kept as static since it's a marketing stat
const AVG_GROWTH = '+340%';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    // const [testimonialIndex, setTestimonialIndex] = useState(0); // TESTIMONIALS_PAGE - reativar quando tiver depoimentos reais
    const [counter, setCounter] = useState(0);
    const { totalScripts, activeCreators } = useGlobalStats();

    // Animate counter
    useEffect(() => {
        const target = totalScripts;
        const duration = 2000;
        const increment = target / (duration / 50);

        const interval = setInterval(() => {
            setCounter(prev => {
                if (prev >= target) {
                    clearInterval(interval);
                    return target;
                }
                return Math.min(prev + increment, target);
            });
        }, 50);

        return () => clearInterval(interval);
    }, [totalScripts]);

    // TESTIMONIALS_PAGE - Rotate testimonials (reativar com depoimentos reais)
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setTestimonialIndex(prev => (prev + 1) % TESTIMONIALS.length);
    //     }, 4000);
    //     return () => clearInterval(interval);
    // }, []);

    const handleContinue = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            localStorage.setItem('hooky_onboarding_complete', 'true');
            onComplete();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'linear-gradient(180deg, var(--cream) 0%, #fff 100%)'
            }}
        >
            <AnimatePresence mode="wait">
                {/* Step 0: Welcome + Counter */}
                {step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ textAlign: 'center', maxWidth: '400px' }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <Sparkles size={64} color="var(--primary)" />
                        </motion.div>

                        <h1 style={{
                            fontSize: '2.5rem',
                            fontFamily: 'var(--font-display)',
                            marginBottom: '1rem',
                            color: 'var(--dark)'
                        }}>
                            Bem-vindo ao Hooky
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            color: 'var(--gray)',
                            marginBottom: '2rem',
                            lineHeight: 1.6
                        }}>
                            Transforme suas ideias em roteiros virais com IA
                        </p>

                        {/* Global Counter */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,107,107,0.05) 100%)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            border: '1px solid rgba(255,107,107,0.2)'
                        }}>
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: 800,
                                color: 'var(--primary)',
                                fontFamily: 'var(--font-display)'
                            }}>
                                {Math.floor(counter).toLocaleString()}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: 'var(--gray)',
                                fontWeight: 600
                            }}>
                                roteiros já criados por criadores como você
                            </div>
                        </div>

                        <motion.button
                            onClick={handleContinue}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '1rem 2rem',
                                background: 'var(--dark)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Continuar <ChevronRight size={20} />
                        </motion.button>
                    </motion.div>
                )}

                {/* Step 1: Como Funciona — 3 passos */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ textAlign: 'center', maxWidth: '400px' }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem', marginBottom: '1rem'
                        }}>
                            <Zap size={24} color="var(--primary)" />
                            <span style={{
                                fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)',
                                textTransform: 'uppercase', letterSpacing: '0.1em'
                            }}>
                                Como Funciona
                            </span>
                        </div>

                        <h2 style={{
                            fontSize: '1.8rem', fontFamily: 'var(--font-display)',
                            marginBottom: '0.5rem', color: 'var(--dark)'
                        }}>
                            Sua ideia vira roteiro viral em 3 passos
                        </h2>

                        <p style={{
                            fontSize: '0.95rem', color: 'var(--gray)', marginBottom: '2rem', lineHeight: 1.6
                        }}>
                            Sem horas editando. Sem bloqueio criativo.
                        </p>

                        {/* 3 Steps */}
                        {[
                            {
                                emoji: '🎙️',
                                title: 'Fale sua ideia',
                                desc: 'Grave um áudio de até 5 minutos explicando o que você quer falar'
                            },
                            {
                                emoji: '⚡',
                                title: 'A IA processa',
                                desc: 'Transcrição automática e geração de roteiro otimizado para viral'
                            },
                            {
                                emoji: '🚀',
                                title: 'Poste e cresça',
                                desc: 'Copie o roteiro pronto e publique. Consistência que vira audiência'
                            }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '1rem 1.25rem',
                                    marginBottom: '0.75rem',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{
                                    fontSize: '1.75rem',
                                    lineHeight: 1,
                                    minWidth: '40px',
                                    paddingTop: '2px'
                                }}>
                                    {s.emoji}
                                </div>
                                <div>
                                    <div style={{
                                        fontWeight: 700,
                                        color: 'var(--dark)',
                                        fontSize: '0.95rem',
                                        marginBottom: '0.2rem'
                                    }}>
                                        {i + 1}. {s.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)', lineHeight: 1.4 }}>
                                        {s.desc}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <motion.button
                            onClick={handleContinue}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '1rem 2rem',
                                background: 'var(--dark)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '1rem'
                            }}
                        >
                            Quero começar <ChevronRight size={20} />
                        </motion.button>
                    </motion.div>
                )}


                {/* Step 2: Join Community */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ textAlign: 'center', maxWidth: '400px' }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <Users size={24} color="var(--primary)" />
                            <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Desafio 100 Dias
                            </span>
                        </div>

                        <h2 style={{
                            fontSize: '1.8rem',
                            fontFamily: 'var(--font-display)',
                            marginBottom: '1rem',
                            color: 'var(--dark)'
                        }}>
                            Você está pronto para viralizar?
                        </h2>

                        <p style={{
                            fontSize: '1rem',
                            color: 'var(--gray)',
                            marginBottom: '2rem',
                            lineHeight: 1.6
                        }}>
                            Crie um roteiro por dia durante 100 dias e veja sua audiência explodir
                        </p>

                        {/* Stats Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                background: 'rgba(0,0,0,0.03)',
                                borderRadius: '16px',
                                padding: '1.25rem'
                            }}>
                                <div style={{
                                    fontSize: '1.8rem',
                                    fontWeight: 800,
                                    color: 'var(--dark)'
                                }}>
                                    {activeCreators.toLocaleString()}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--gray)'
                                }}>
                                    criadores ativos
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(0,0,0,0.03)',
                                borderRadius: '16px',
                                padding: '1.25rem'
                            }}>
                                <div style={{
                                    fontSize: '1.8rem',
                                    fontWeight: 800,
                                    color: 'var(--primary)'
                                }}>
                                    {AVG_GROWTH}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--gray)'
                                }}>
                                    crescimento médio
                                </div>
                            </div>
                        </div>

                        <motion.button
                            onClick={handleContinue}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '1.25rem 2rem',
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(255,107,107,0.3)'
                            }}
                        >
                            🚀 Começar Agora
                        </motion.button>

                        <p style={{
                            marginTop: '1rem',
                            fontSize: '0.8rem',
                            color: 'var(--gray)',
                            opacity: 0.7
                        }}>
                            100% gratuito para começar
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
