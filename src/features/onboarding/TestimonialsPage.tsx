import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronRight, ArrowRight } from 'lucide-react';

/**
 * ========================================================
 * 📌 TESTIMONIALS_PAGE
 * ========================================================
 * Página de depoimentos/resultados - guardada para uso futuro.
 * Quando tiver depoimentos reais, basta:
 * 1. Importar este componente
 * 2. Colocar no step 1 do OnboardingScreen
 * 
 * Uso: <TestimonialsPage onContinue={() => setStep(step + 1)} />
 * ========================================================
 */

// Prova social - Depoimentos (editar com dados reais quando tiver)
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

interface TestimonialsPageProps {
    onContinue: () => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ onContinue }) => {
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    // Rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialIndex(prev => (prev + 1) % TESTIMONIALS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            key="testimonials"
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
                onClick={onContinue}
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
    );
};
