import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { generateDailyChallenge, type DailyChallengePrompt } from '../services';

export const DailyChallengeCard: React.FC = () => {
    const { activityLog, creatorProfile } = useUser();
    const [challenge, setChallenge] = useState<DailyChallengePrompt | null>(null);

    // Load or generate challenge for the day
    useEffect(() => {
        const loadChallenge = async () => {
            const today = new Date().toDateString();
            const storageKey = `hooky_daily_challenge_${today}`;

            // 1. Try to get from local storage (cache)
            const cached = localStorage.getItem(storageKey);
            if (cached) {
                setChallenge(JSON.parse(cached));
                return;
            }

            // 2. If not found, generate new one via AI
            // We use a fallback niche if profile is not yet set
            const niche = creatorProfile?.niche || 'Geral';

            try {
                const newChallenge = await generateDailyChallenge(niche);
                localStorage.setItem(storageKey, JSON.stringify(newChallenge));
                setChallenge(newChallenge);
            } catch (error) {
                console.error('Failed to generate challenge:', error);
                // Fallback hardcoded
                setChallenge({
                    title: "Desafio Criativo",
                    description: "Crie um vídeo rápido testando um novo ângulo.",
                    difficulty: "Fácil"
                });
            }
        };

        loadChallenge();
    }, [creatorProfile]);

    // Check if user has created a script today
    const today = new Date().toDateString();
    const hasCreatedToday = (activityLog && activityLog[today] > 0);

    const [isCompleted, setIsCompleted] = useState(hasCreatedToday);

    useEffect(() => {
        if (hasCreatedToday) {
            setIsCompleted(true);
        }
    }, [hasCreatedToday]);

    if (!challenge) return null; // Or a loading skeleton

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
                width: '100%',
                borderRadius: '24px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? '#10B981' : '#6366F1'
                }}>
                    {isCompleted ? <CheckCircle2 size={24} /> : <Target size={24} />}
                </div>
                <div>
                    <div style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--gray)',
                        marginBottom: '0.2rem',
                        fontWeight: 600
                    }}>
                        Desafio do Dia {challenge.difficulty && `• ${challenge.difficulty}`}
                    </div>
                    <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--dark)'
                    }}>
                        {challenge.title}
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--gray)',
                        marginTop: '0.2rem'
                    }}>
                        {challenge.description}
                    </div>
                </div>
            </div>

            {isCompleted && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#10B981',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                    }}
                >
                    Completado!
                </motion.div>
            )}
        </motion.div>
    );
};
