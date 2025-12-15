/**
 * Quiz Questions Data
 * 
 * Separated from QuizFunnel.tsx to improve maintainability.
 * Each question follows the Question interface and supports multiple types.
 */

// =============================================================================
// TYPES
// =============================================================================

export type QuestionType =
    | 'single'
    | 'binary'
    | 'chart'
    | 'growth-chart'
    | 'trust'
    | 'social-proof'
    | 'loading'
    | 'input-slider'
    | 'result';

export interface QuestionOption {
    value: string;
    label: string;
    icon?: string;
}

export interface ChartDataItem {
    label: string;
    value: number;
    color: string;
}

export interface Testimonial {
    name: string;
    avatar: string;
    text: string;
    rating: number;
}

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    subtitle?: string;
    illustration?: string;
    options?: QuestionOption[];
    chartData?: ChartDataItem[];
    testimonials?: Testimonial[];
}

// =============================================================================
// QUESTIONS DATA
// =============================================================================

export const QUIZ_QUESTIONS: Question[] = [
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
    // 8. Followers count
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
    // 9. Goal
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
    // 10. Binary - Ready to commit?
    {
        id: 'commit',
        type: 'binary',
        question: 'Você está disposto a postar pelo menos 3x por semana?',
        subtitle: 'Constância é a chave para resultados',
        illustration: '📅',
    },
    // 11. What's stopping you (challenge)
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
    // 12. Social proof with testimonials
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
    // 13. Frustration level
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
    // 14. Loading/generating plan screen
    {
        id: 'generating',
        type: 'loading',
        question: 'Gerando seu plano personalizado...',
        subtitle: 'Analisando dados de +2.341 roteiros virais',
    },
];

// =============================================================================
// CREATOR TYPE LOGIC
// =============================================================================

export type CreatorType = 'relampago' | 'perfeccionista' | 'estrategista' | 'viral';

export function determineCreatorType(answers: Record<string, string>): CreatorType {
    if (answers.goal === 'crescer' || answers.challenge === 'hook') return 'viral';
    if (answers.goal === 'marca' || answers.goal === 'monetizar') return 'estrategista';
    if (answers.commit === 'yes' && answers.challenge === 'tempo') return 'relampago';
    return 'perfeccionista';
}
