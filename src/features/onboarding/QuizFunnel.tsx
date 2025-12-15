import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, TrendingUp, Users, Zap, CheckCircle, Sparkles } from 'lucide-react';

interface QuizFunnelProps {
    onComplete: (profile: CreatorProfile) => void;
}

export interface CreatorProfile {
    niche: string;
    followers: string;
    challenge: string;
    frequency: string;
    experience: string;
    goal: string;
    style: string;
    platform: string;
    time: string;
    frustration: string;
    investment: string;
    commitment: string;
    creatorType: 'relampago' | 'perfeccionista' | 'estrategista' | 'viral';
}

type QuestionType = 'single' | 'binary' | 'chart' | 'growth-chart' | 'trust' | 'social-proof' | 'loading' | 'input-slider' | 'result';

interface Question {
    id: string;
    type: QuestionType;
    question: string;
    subtitle?: string;
    illustration?: string;
    options?: { value: string; label: string; icon?: string }[];
    chartData?: { label: string; value: number; color: string }[];
    testimonials?: { name: string; avatar: string; text: string; rating: number }[];
}

const QUESTIONS: Question[] = [
    // 1. Platform choice with icons
    {
        id: 'platform',
        type: 'single',
        question: 'Qual sua plataforma principal?',
        subtitle: 'Isso nos ajuda a personalizar seus roteiros',
        options: [
            { value: 'instagram', label: 'Instagram', icon: '📸' },
            { value: 'tiktok', label: 'TikTok', icon: '🎵' },
            { value: 'youtube', label: 'YouTube Shorts', icon: '▶️' },
            { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
            { value: 'todas', label: 'Todas', icon: '🌐' },
        ]
    },
    // 2. Where did you hear about us (attribution)
    {
        id: 'source',
        type: 'single',
        question: 'Como você descobriu o Hooky?',
        options: [
            { value: 'instagram', label: 'Instagram', icon: '📸' },
            { value: 'tiktok', label: 'TikTok', icon: '🎵' },
            { value: 'youtube', label: 'YouTube', icon: '▶️' },
            { value: 'google', label: 'Google', icon: '🔍' },
            { value: 'amigo', label: 'Indicação', icon: '👥' },
        ]
    },
    // 3. Binary question - Have you tried other tools?
    {
        id: 'tried_others',
        type: 'binary',
        question: 'Você já usou outras ferramentas de roteiro?',
        subtitle: 'Seja honesto, queremos entender sua jornada',
        illustration: '🛠️',
    },
    // 4. Chart showing Hooky results (social proof)
    {
        id: 'results_chart',
        type: 'chart',
        question: 'Hooky cria resultados de longo prazo',
        subtitle: '87% dos usuários mantêm a constância após 6 meses',
        chartData: [
            { label: 'Outros apps', value: 30, color: '#e0e0e0' },
            { label: 'Hooky', value: 87, color: 'var(--primary)' },
        ]
    },
    // 5. Growth Chart - Followers projection
    {
        id: 'growth_projection',
        type: 'growth-chart',
        question: 'Hooky acelera seu crescimento',
        subtitle: 'Projeção baseada em dados reais de +2.341 criadores',
    },
    // 6. Trust screen
    {
        id: 'trust_screen',
        type: 'trust',
        question: 'Obrigado por confiar no Hooky',
        subtitle: 'Sua privacidade e segurança são prioridades para nós.',
    },
    // 7. Niche selection
    {
        id: 'niche',
        type: 'single',
        question: 'Qual é o seu nicho principal?',
        subtitle: 'Isso personaliza as estruturas dos seus roteiros',
        options: [
            { value: 'fitness', label: 'Fitness & Saúde', icon: '💪' },
            { value: 'negocios', label: 'Negócios', icon: '💼' },
            { value: 'lifestyle', label: 'Lifestyle', icon: '✨' },
            { value: 'humor', label: 'Humor', icon: '😂' },
            { value: 'educacao', label: 'Educação', icon: '📚' },
            { value: 'tech', label: 'Tech', icon: '🖥️' },
        ]
    },
    // 6. Followers count (slider-like)
    {
        id: 'followers',
        type: 'single',
        question: 'Quantos seguidores você tem?',
        subtitle: 'Isso calibra seu plano personalizado',
        options: [
            { value: '0-1k', label: 'Menos de 1K', icon: '🌱' },
            { value: '1k-10k', label: '1K - 10K', icon: '🌿' },
            { value: '10k-50k', label: '10K - 50K', icon: '🌳' },
            { value: '50k-100k', label: '50K - 100K', icon: '🏔️' },
            { value: '100k+', label: '100K+', icon: '🚀' },
        ]
    },
    // 7. Goal
    {
        id: 'goal',
        type: 'single',
        question: 'Qual seu objetivo principal?',
        options: [
            { value: 'crescer', label: 'Crescer seguidores', icon: '📈' },
            { value: 'monetizar', label: 'Monetizar', icon: '💰' },
            { value: 'marca', label: 'Construir autoridade', icon: '👑' },
            { value: 'vendas', label: 'Vender produtos', icon: '🛒' },
        ]
    },
    // 8. Binary - Ready to commit?
    {
        id: 'commit',
        type: 'binary',
        question: 'Você está disposto a postar pelo menos 3x por semana?',
        subtitle: 'Constância é a chave para resultados',
        illustration: '📅',
    },
    // 9. What's stopping you (challenge)
    {
        id: 'challenge',
        type: 'single',
        question: 'O que te impede de criar mais conteúdo?',
        options: [
            { value: 'ideias', label: 'Falta de ideias', icon: '💡' },
            { value: 'tempo', label: 'Falta de tempo', icon: '⏰' },
            { value: 'estrutura', label: 'Não sei estruturar', icon: '📝' },
            { value: 'hook', label: 'Hooks fracos', icon: '🧲' },
            { value: 'constancia', label: 'Manter constância', icon: '📅' },
        ]
    },
    // 10. Social proof with testimonials
    {
        id: 'social_proof',
        type: 'social-proof',
        question: 'Hooky foi feito para pessoas como você',
        subtitle: '+2.341 criadores',
        testimonials: [
            { name: 'Marina Silva', avatar: '👩‍💼', text: 'Perdi 3h por dia criando roteiros. Agora faço em 15 segundos!', rating: 5 },
            { name: 'Carlos Mendes', avatar: '👨‍💻', text: 'Saí de 2K para 50K seguidores em 4 meses usando o Hooky.', rating: 5 },
            { name: 'Bruna Costa', avatar: '👩‍🎨', text: 'Melhor investimento que fiz para meu negócio.', rating: 5 },
        ]
    },
    // 11. Frustration level
    {
        id: 'frustration',
        type: 'single',
        question: 'O que mais te frustra na criação de conteúdo?',
        options: [
            { value: 'bloqueio', label: 'Bloqueio criativo', icon: '🧱' },
            { value: 'engajamento', label: 'Pouco engajamento', icon: '👻' },
            { value: 'tempo', label: 'Demora muito', icon: '⏳' },
            { value: 'algoritmo', label: 'Algoritmo não ajuda', icon: '🤖' },
        ]
    },
    // 12. Loading/generating plan screen
    {
        id: 'generating',
        type: 'loading',
        question: 'Gerando seu plano personalizado...',
        subtitle: 'Analisando dados de +2.341 roteiros virais',
    },
];

function determineCreatorType(answers: Record<string, string>): CreatorProfile['creatorType'] {
    if (answers.goal === 'crescer' || answers.challenge === 'hook') return 'viral';
    if (answers.goal === 'marca' || answers.goal === 'monetizar') return 'estrategista';
    if (answers.commit === 'yes' && answers.challenge === 'tempo') return 'relampago';
    return 'perfeccionista';
}

export const QuizFunnel: React.FC<QuizFunnelProps> = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestion = QUESTIONS[currentIndex];
    const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

    // Handle loading screen animation
    useEffect(() => {
        if (currentQuestion?.type === 'loading') {
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setShowResult(true), 500);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [currentQuestion?.type]);

    // Handle result screen completion
    useEffect(() => {
        if (showResult) {
            const timer = setTimeout(() => {
                const creatorType = determineCreatorType(answers);
                const profile: CreatorProfile = {
                    niche: answers.niche || '',
                    followers: answers.followers || '',
                    challenge: answers.challenge || '',
                    frequency: answers.commit === 'yes' ? '3-5x' : 'irregular',
                    experience: '1a-3a',
                    goal: answers.goal || '',
                    style: 'direto',
                    platform: answers.platform || '',
                    time: '15min',
                    frustration: answers.frustration || '',
                    investment: 'pouco',
                    commitment: answers.commit || '',
                    creatorType
                };
                onComplete(profile);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [showResult, answers, onComplete]);

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));

        // Auto-advance after selection
        setTimeout(() => {
            if (currentIndex < QUESTIONS.length - 1) {
                setCurrentIndex(prev => prev + 1);
            }
        }, 300);
    };

    const handleBinaryAnswer = (value: 'yes' | 'no') => {
        handleAnswer(value);
    };

    const handleContinue = () => {
        if (currentIndex < QUESTIONS.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Result screen
    if (showResult) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '2rem',
                    textAlign: 'center'
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--gradient-btn)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 30px rgba(255,107,107,0.3)'
                    }}
                >
                    <CheckCircle size={40} color="white" />
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.75rem',
                        color: 'var(--dark)',
                        marginBottom: '0.5rem'
                    }}
                >
                    Parabéns!
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        color: 'var(--dark)',
                        fontSize: '1.1rem',
                        marginBottom: '2rem'
                    }}
                >
                    Seu plano personalizado está pronto!
                </motion.p>

                {/* Personalized stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card"
                    style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        marginBottom: '1.5rem'
                    }}
                >
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1rem' }}>
                        Recomendação diária
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'rgba(255,107,107,0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.5rem',
                                position: 'relative'
                            }}>
                                <TrendingUp size={20} color="var(--primary)" />
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--dark)' }}>3</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Roteiros</div>
                        </div>
                        <div>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'rgba(255,230,109,0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.5rem'
                            }}>
                                <Zap size={20} color="var(--secondary)" />
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--dark)' }}>15s</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Por roteiro</div>
                        </div>
                        <div>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'rgba(16,185,129,0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.5rem'
                            }}>
                                <Users size={20} color="#10b981" />
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--dark)' }}>10K</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Meta 90 dias</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: 'var(--gray)',
                        fontSize: '0.85rem'
                    }}
                >
                    <Sparkles size={16} />
                    Carregando...
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                width: '100%',
                maxWidth: '420px',
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem'
            }}
        >
            {/* Progress Bar */}
            <div style={{ marginBottom: '3rem', position: 'relative', paddingTop: '0.5rem' }}>
                {/* Botão de voltar em posição absoluta */}
                {currentIndex > 0 && currentQuestion.type !== 'loading' && (
                    <motion.button
                        onClick={handleBack}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex'
                        }}
                    >
                        <ChevronLeft size={24} color="var(--dark)" />
                    </motion.button>
                )}
                {/* Barra de progresso centralizada */}
                <div style={{
                    maxWidth: '320px',
                    margin: '0 auto',
                    height: '6px',
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                            borderRadius: '3px'
                        }}
                    />
                </div>
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                    {/* Question Title */}
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.75rem',
                        color: 'var(--dark)',
                        marginBottom: currentQuestion.subtitle ? '0.5rem' : '2rem',
                        lineHeight: 1.2,
                        textAlign: 'center'
                    }}>
                        {currentQuestion.question}
                    </h2>

                    {currentQuestion.subtitle && (
                        <p style={{
                            color: 'var(--gray)',
                            fontSize: '0.95rem',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            {currentQuestion.subtitle}
                        </p>
                    )}

                    {/* SINGLE CHOICE */}
                    {currentQuestion.type === 'single' && currentQuestion.options && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {currentQuestion.options.map((option, index) => (
                                <motion.button
                                    key={option.value}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleAnswer(option.value)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.25rem',
                                        background: answers[currentQuestion.id] === option.value
                                            ? 'var(--dark)'
                                            : 'white',
                                        color: answers[currentQuestion.id] === option.value
                                            ? 'white'
                                            : 'var(--dark)',
                                        border: '2px solid',
                                        borderColor: answers[currentQuestion.id] === option.value
                                            ? 'var(--dark)'
                                            : 'rgba(0,0,0,0.1)',
                                        borderRadius: '16px',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    {option.icon && <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>}
                                    {option.label}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* BINARY QUESTION */}
                    {currentQuestion.type === 'binary' && (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {/* SVG Illustrations based on question */}
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                style={{
                                    width: '160px',
                                    height: '160px',
                                    background: 'white',
                                    borderRadius: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '2rem',
                                    boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)',
                                    overflow: 'hidden'
                                }}
                            >
                                {currentQuestion.id === 'tried_others' ? (
                                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                                        <g transform="translate(10, 15) scale(0.8)">
                                            {/* Barra 1 - Cinza (pequena) */}
                                            <motion.rect
                                                x="15" width="20" rx="4"
                                                fill="#d1d5db"
                                                initial={{ y: 75, height: 0 }}
                                                animate={{ y: 55, height: 20 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
                                            />
                                            {/* Barra 2 - Coral (média) */}
                                            <motion.rect
                                                x="40" width="20" rx="4"
                                                fill="#f87171"
                                                initial={{ y: 75, height: 0 }}
                                                animate={{ y: 35, height: 40 }}
                                                transition={{ delay: 0.3, duration: 0.4 }}
                                            />
                                            {/* Barra 3 - Coral (alta) */}
                                            <motion.rect
                                                x="65" width="20" rx="4"
                                                fill="#f87171"
                                                initial={{ y: 75, height: 0 }}
                                                animate={{ y: 15, height: 60 }}
                                                transition={{ delay: 0.4, duration: 0.4 }}
                                            />
                                            {/* Interrogação */}
                                            <motion.text
                                                x="50" y="28"
                                                textAnchor="middle"
                                                fontSize="28"
                                                fontWeight="bold"
                                                fill="#1f2937"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.7 }}
                                            >?</motion.text>
                                        </g>
                                    </svg>
                                ) : currentQuestion.id === 'commit' ? (
                                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                                        {/* Celular centralizado */}
                                        <motion.rect
                                            x="30" y="15" width="40" height="70" rx="6"
                                            fill="#1f2937"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.4, type: 'spring' }}
                                        />
                                        {/* Tela */}
                                        <motion.rect
                                            x="33" y="21" width="34" height="50" rx="2"
                                            fill="#f3f4f6"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3, duration: 0.3 }}
                                        />
                                        {/* Notificação 1 - metade dentro, metade fora */}
                                        <motion.rect
                                            x="50" y="28" width="28" height="8" rx="2"
                                            fill="#10b981"
                                            initial={{ x: 90, opacity: 0 }}
                                            animate={{ x: 50, opacity: 1 }}
                                            transition={{ delay: 0.5, duration: 0.4 }}
                                        />
                                        {/* Notificação 2 */}
                                        <motion.rect
                                            x="50" y="40" width="28" height="8" rx="2"
                                            fill="#f87171"
                                            initial={{ x: 90, opacity: 0 }}
                                            animate={{ x: 50, opacity: 1 }}
                                            transition={{ delay: 0.7, duration: 0.4 }}
                                        />
                                        {/* Notificação 3 */}
                                        <motion.rect
                                            x="50" y="52" width="28" height="8" rx="2"
                                            fill="#10b981"
                                            initial={{ x: 90, opacity: 0 }}
                                            animate={{ x: 50, opacity: 1 }}
                                            transition={{ delay: 0.9, duration: 0.4 }}
                                        />
                                        {/* Botão home */}
                                        <motion.circle
                                            cx="50" cy="78" r="3"
                                            fill="#374151"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                        />
                                    </svg>
                                ) : (
                                    // Fallback emoji
                                    <span style={{ fontSize: '4rem' }}>{currentQuestion.illustration || '📊'}</span>
                                )}
                            </motion.div>

                            {/* Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                width: '100%',
                                maxWidth: '320px'
                            }}>
                                <motion.button
                                    onClick={() => handleBinaryAnswer('no')}
                                    whileHover={{ scale: 1.02, boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    style={{
                                        flex: 1,
                                        padding: '1.25rem',
                                        background: 'white',
                                        border: '2px solid rgba(0,0,0,0.1)',
                                        borderRadius: '16px',
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        color: 'var(--dark)'
                                    }}
                                >
                                    Não
                                </motion.button>
                                <motion.button
                                    onClick={() => handleBinaryAnswer('yes')}
                                    whileHover={{ scale: 1.02, boxShadow: '0 5px 20px rgba(0,0,0,0.15)' }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    style={{
                                        flex: 1,
                                        padding: '1.25rem',
                                        background: 'var(--dark)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Sim
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* CHART */}
                    {currentQuestion.type === 'chart' && currentQuestion.chartData && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div className="glass-card" style={{
                                padding: '2rem',
                                borderRadius: '24px',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--gray)' }}>
                                    Consistência após 6 meses
                                </div>
                                {currentQuestion.chartData.map((data, i) => (
                                    <div key={i} style={{ marginBottom: '1rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            <span>{data.label}</span>
                                            <span style={{ fontWeight: 600 }}>{data.value}%</span>
                                        </div>
                                        <div style={{
                                            height: '12px',
                                            background: 'rgba(0,0,0,0.05)',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${data.value}%` }}
                                                transition={{ duration: 1, delay: i * 0.3 }}
                                                style={{
                                                    height: '100%',
                                                    background: data.color,
                                                    borderRadius: '6px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <motion.button
                                onClick={handleContinue}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    background: 'var(--dark)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Continuar
                            </motion.button>
                        </div>
                    )}

                    {/* GROWTH CHART - SVG animated line chart */}
                    {currentQuestion.type === 'growth-chart' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div className="glass-card" style={{
                                padding: '2rem',
                                borderRadius: '24px',
                                marginBottom: '2rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--gray)'
                                }}>
                                    <span>Seus seguidores</span>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <span style={{ color: '#e0e0e0' }}>● Sem Hooky</span>
                                        <span style={{ color: 'var(--primary)' }}>● Com Hooky</span>
                                    </div>
                                </div>

                                {/* SVG Chart */}
                                <svg width="100%" height="180" viewBox="0 0 300 150" style={{ overflow: 'visible' }}>
                                    {/* Grid lines */}
                                    {[0, 50, 100, 150].map((y, i) => (
                                        <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                                    ))}

                                    {/* Without Hooky - flat gray line */}
                                    <motion.path
                                        d="M 0 130 Q 75 120 150 110 T 300 100"
                                        fill="none"
                                        stroke="#e0e0e0"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, delay: 0.3 }}
                                    />

                                    {/* With Hooky - steep growth curve */}
                                    <motion.path
                                        d="M 0 130 Q 50 120 100 80 T 200 30 Q 250 15 300 10"
                                        fill="none"
                                        stroke="var(--primary)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, delay: 0.5 }}
                                    />

                                    {/* End point badges */}
                                    <motion.g
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 2.5 }}
                                    >
                                        <rect x="255" y="90" width="45" height="20" rx="4" fill="#f5f5f5" />
                                        <text x="277" y="104" fontSize="10" fill="#888" textAnchor="middle">+15%</text>
                                    </motion.g>

                                    <motion.g
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 2.7 }}
                                    >
                                        <rect x="250" y="0" width="50" height="20" rx="4" fill="var(--primary)" />
                                        <text x="275" y="14" fontSize="10" fill="white" textAnchor="middle">+340%</text>
                                    </motion.g>
                                </svg>

                                {/* Time labels */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--gray)'
                                }}>
                                    <span>Mês 1</span>
                                    <span>Mês 3</span>
                                    <span>Mês 6</span>
                                </div>
                            </div>

                            <p style={{
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                color: 'var(--gray)',
                                marginBottom: '2rem'
                            }}>
                                87% dos usuários Hooky mantêm crescimento constante após 6 meses
                            </p>

                            <motion.button
                                onClick={handleContinue}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    background: 'var(--dark)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Continuar
                            </motion.button>
                        </div>
                    )}

                    {/* TRUST SCREEN */}
                    {currentQuestion.type === 'trust' && (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                        }}>
                            {/* Illustration */}
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 12 }}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #fef3e2 0%, #fde7d2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '2rem',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                }}
                            >
                                <svg width="64" height="64" viewBox="0 0 64 64">
                                    <defs>
                                        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                    {/* Escudo proporcional com gradiente */}
                                    <motion.path
                                        d="M 32 8 
                                           C 22 8 12 12 12 12 
                                           L 12 32 
                                           C 12 46 22 54 32 58 
                                           C 42 54 52 46 52 32 
                                           L 52 12 
                                           C 52 12 42 8 32 8 Z"
                                        fill="url(#shieldGradient)"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    {/* Check branco */}
                                    <motion.path
                                        d="M 22 32 L 28 38 L 42 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.4 }}
                                    />
                                </svg>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card"
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    marginBottom: '2rem',
                                    maxWidth: '320px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🔒</span>
                                    <span style={{ fontWeight: 600, color: 'var(--dark)' }}>
                                        Sua privacidade importa
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray)', lineHeight: 1.5 }}>
                                    Prometemos manter seus dados pessoais privados e seguros. Sempre.
                                </p>
                            </motion.div>

                            <motion.button
                                onClick={handleContinue}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    maxWidth: '320px',
                                    padding: '1.25rem',
                                    background: 'var(--dark)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Continuar
                            </motion.button>
                        </div>
                    )}

                    {/* SOCIAL PROOF */}
                    {currentQuestion.type === 'social-proof' && currentQuestion.testimonials && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Star rating */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0.25rem',
                                marginBottom: '1.5rem'
                            }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={28} fill="#fbbf24" color="#fbbf24" />
                                ))}
                            </div>

                            {/* Testimonials */}
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}>
                                {currentQuestion.testimonials.map((t, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="glass-card"
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem' }}>{t.avatar}</div>
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
                                                <div style={{ display: 'flex', gap: '1px' }}>
                                                    {[...Array(t.rating)].map((_, j) => (
                                                        <Star key={j} size={12} fill="#fbbf24" color="#fbbf24" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--gray)',
                                                lineHeight: 1.4
                                            }}>
                                                "{t.text}"
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.button
                                onClick={handleContinue}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    background: 'var(--dark)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Continuar
                            </motion.button>
                        </div>
                    )}

                    {/* LOADING */}
                    {currentQuestion.type === 'loading' && (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                        }}>
                            {/* Animated icon */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    border: '4px solid rgba(0,0,0,0.1)',
                                    borderTopColor: 'var(--primary)',
                                    marginBottom: '2rem'
                                }}
                            />

                            {/* Progress percentage */}
                            <motion.div
                                style={{
                                    fontSize: '3rem',
                                    fontWeight: 700,
                                    color: 'var(--primary)',
                                    marginBottom: '1rem'
                                }}
                            >
                                {loadingProgress}%
                            </motion.div>

                            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
                                Finalizando resultados...
                            </p>

                            {/* Loading bar */}
                            <div style={{
                                width: '100%',
                                maxWidth: '300px',
                                height: '8px',
                                background: 'rgba(0,0,0,0.08)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <motion.div
                                    style={{
                                        width: `${loadingProgress}%`,
                                        height: '100%',
                                        background: 'var(--gradient-btn)',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            {/* Generating features list */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="glass-card"
                                style={{
                                    marginTop: '2rem',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    textAlign: 'left',
                                    width: '100%'
                                }}
                            >
                                <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '0.75rem' }}>
                                    Recomendação diária para:
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {['Hooks virais', 'Estrutura de roteiro', 'CTAs persuasivos', 'Gatilhos mentais'].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.5 + i * 0.2 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <CheckCircle size={16} color="#10b981" />
                                            {item}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};
