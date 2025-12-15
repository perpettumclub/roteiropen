import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Users, ChevronRight, ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
    onComplete: () => void;
}

// Prova social - Depoimentos reais (editar com dados reais)
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

// Contador global simulado (substituir por API real depois)
const GLOBAL_STATS = {
    totalScripts: 12847,
    activeUsers: 2341,
    avgGrowth: '+340%'
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [counter, setCounter] = useState(0);

    // Animate counter
    useEffect(() => {
        const target = GLOBAL_STATS.totalScripts;
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
    }, []);

    // Rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialIndex(prev => (prev + 1) % TESTIMONIALS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

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

                {/* Step 1: Social Proof / Testimonials */}
                {step === 1 && (
                    <motion.div
                        key="step1"
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
                            <TrendingUp size={24} color="var(--primary)" />
                            <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Resultados Reais
                            </span>
                        </div>

                        <h2 style={{
                            fontSize: '1.8rem',
                            fontFamily: 'var(--font-display)',
                            marginBottom: '2rem',
                            color: 'var(--dark)'
                        }}>
                            Veja o que os criadores estão conseguindo
                        </h2>

                        {/* Testimonial Card */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={testimonialIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    padding: '2rem',
                                    marginBottom: '2rem',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '1rem'
                                }}>
                                    {TESTIMONIALS[testimonialIndex].avatar}
                                </div>

                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    marginBottom: '0.5rem',
                                    color: 'var(--dark)'
                                }}>
                                    {TESTIMONIALS[testimonialIndex].name}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '1rem',
                                    fontSize: '1.2rem'
                                }}>
                                    <span style={{ color: 'var(--gray)' }}>
                                        {TESTIMONIALS[testimonialIndex].before}
                                    </span>
                                    <ArrowRight size={20} color="var(--primary)" />
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                        {TESTIMONIALS[testimonialIndex].after}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                                        seguidores
                                    </span>
                                </div>

                                <p style={{
                                    fontSize: '1rem',
                                    color: 'var(--gray)',
                                    fontStyle: 'italic',
                                    lineHeight: 1.5
                                }}>
                                    "{TESTIMONIALS[testimonialIndex].quote}"
                                </p>

                                <div style={{
                                    marginTop: '1rem',
                                    fontSize: '0.8rem',
                                    color: 'var(--gray)',
                                    opacity: 0.7
                                }}>
                                    Dia {TESTIMONIALS[testimonialIndex].days} do desafio
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Dots */}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                            {TESTIMONIALS.map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: i === testimonialIndex ? 'var(--primary)' : 'rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
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
                                    {GLOBAL_STATS.activeUsers.toLocaleString()}
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
                                    {GLOBAL_STATS.avgGrowth}
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
