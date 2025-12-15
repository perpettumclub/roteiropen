import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface AISuggestionsProps {
    onSuggestionClick?: (suggestion: string) => void;
}

interface Suggestion {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: string;
    color: string;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ onSuggestionClick }) => {
    const {
        creatorProfile,
        currentStreak,
        scriptsThisWeek,
        weeklyGoal,
        totalScriptsCreated
    } = useUser();

    // Generate dynamic suggestions based on user data
    const generateSuggestions = (): Suggestion[] => {
        const suggestions: Suggestion[] = [];
        const now = new Date();
        const hour = now.getHours();

        // Time-based suggestions
        if (hour >= 6 && hour < 12) {
            suggestions.push({
                id: 'morning',
                icon: <Sparkles size={20} />,
                title: 'Bom dia, criador! ☀️',
                description: 'Manhã é o melhor horário para engajamento. Crie um roteiro agora!',
                action: 'Criar roteiro matinal',
                color: '#F59E0B'
            });
        }

        // Streak-based suggestions
        if (currentStreak === 0) {
            suggestions.push({
                id: 'start_streak',
                icon: <TrendingUp size={20} />,
                title: 'Comece sua sequência! 🔥',
                description: 'Crie hoje e inicie um streak de consistência.',
                color: '#EF4444'
            });
        } else if (currentStreak > 0 && currentStreak < 7) {
            suggestions.push({
                id: 'keep_streak',
                icon: <TrendingUp size={20} />,
                title: `Mantenha o fogo! ${currentStreak} dias 🔥`,
                description: `Faltam ${7 - currentStreak} dias para o badge "Consistente"!`,
                color: '#EF4444'
            });
        }

        // Weekly goal suggestions
        const remaining = weeklyGoal - scriptsThisWeek;
        if (remaining > 0 && remaining <= 3) {
            suggestions.push({
                id: 'weekly_close',
                icon: <Clock size={20} />,
                title: `Quase lá! 🎯`,
                description: `Faltam apenas ${remaining} roteiros para bater sua meta semanal.`,
                color: '#10B981'
            });
        }

        // Niche-based suggestions
        if (creatorProfile?.niche) {
            const nicheIdeas: { [key: string]: string[] } = {
                fitness: [
                    'Erro #1 que te impede de perder gordura',
                    'O exercício que ninguém faz (mas deveria)',
                    'Minha rotina de 5min que mudou tudo'
                ],
                negocios: [
                    'Como fechei R$10k em 1 call',
                    'O erro que quebra 90% dos negócios',
                    'Lição de R$50 mil que aprendi de graça'
                ],
                lifestyle: [
                    'O hábito que mudou minha manhã',
                    'Por que parei de usar isso',
                    'Coisas que fiz errado por anos'
                ],
                humor: [
                    'POV: [situação relatable]',
                    'Coisas que só quem [X] entende',
                    'Quando você percebe que...'
                ],
                tech: [
                    'A ferramenta que ninguém conhece',
                    'Por que você está usando [X] errado',
                    'O futuro de [tendência] é assustador'
                ]
            };

            const ideas = nicheIdeas[creatorProfile.niche] || nicheIdeas.lifestyle;
            const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];

            suggestions.push({
                id: 'niche_idea',
                icon: <Lightbulb size={20} />,
                title: 'Ideia para seu nicho 💡',
                description: `"${randomIdea}"`,
                action: 'Usar essa ideia',
                color: '#8B5CF6'
            });
        }

        // Volume-based suggestions
        if (totalScriptsCreated === 0) {
            suggestions.push({
                id: 'first_script',
                icon: <Sparkles size={20} />,
                title: 'Crie seu primeiro roteiro!',
                description: 'Grave qualquer ideia - a mágica acontece depois.',
                color: '#6366F1'
            });
        } else if (totalScriptsCreated >= 10 && totalScriptsCreated < 50) {
            suggestions.push({
                id: 'volume_tip',
                icon: <TrendingUp size={20} />,
                title: 'Você está evoluindo! 📈',
                description: `${totalScriptsCreated} roteiros criados. Os melhores criadores fazem 50+ por mês.`,
                color: '#3B82F6'
            });
        }

        // Return max 3 suggestions
        return suggestions.slice(0, 3);
    };

    const suggestions = generateSuggestions();

    if (suggestions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem'
            }}>
                <Lightbulb size={18} color="#8B5CF6" />
                <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--dark)'
                }}>
                    Sugestões para você
                </span>
            </div>

            {suggestions.map((suggestion, index) => (
                <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => suggestion.action && onSuggestionClick?.(suggestion.action)}
                    style={{
                        padding: '1rem',
                        background: `${suggestion.color}10`,
                        border: `1px solid ${suggestion.color}25`,
                        borderRadius: '16px',
                        cursor: suggestion.action ? 'pointer' : 'default',
                        transition: 'all 0.2s'
                    }}
                    whileHover={suggestion.action ? {
                        scale: 1.02,
                        background: `${suggestion.color}20`
                    } : undefined}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: `${suggestion.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: suggestion.color,
                            flexShrink: 0
                        }}>
                            {suggestion.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: 'var(--dark)',
                                marginBottom: '0.25rem'
                            }}>
                                {suggestion.title}
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                color: 'var(--gray)',
                                lineHeight: 1.4
                            }}>
                                {suggestion.description}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};
