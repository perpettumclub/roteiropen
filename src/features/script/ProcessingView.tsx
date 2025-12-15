import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';

const MESSAGES = [
    "Ouvindo sua ideia...",
    "Identificando o hook perfeito...",
    "Estruturando a narrativa...",
    "Adicionando tempero viral...",
    "Polindo o texto...",
    "Quase lá..."
];

// Dicas para aprendizado passivo durante o loading - Desafio 100 Dias
const MINO_TIPS = [
    // Hooks e Retenção
    { emoji: "🎯", tip: "O jogo é vencido nos primeiros 3 segundos. 27% a mais de retenção = 54x mais views." },
    { emoji: "📊", tip: "Use números específicos. '3 erros que te fazem perder dinheiro' é melhor que 'alguns erros'." },
    { emoji: "🗣️", tip: "Fale 'VOCÊ' direto pra pessoa. O hook precisa ser uma conversa, não um monólogo." },
    { emoji: "⏱️", tip: "Seu hook deve durar no máximo 1.5 segundos de leitura." },
    { emoji: "🎪", tip: "Efeito Vaca Roxa: seja tão específico que pareça impossível ignorar." },
    { emoji: "💥", tip: "Um hook que funciona: afirmação audaciosa + curiosidade + promessa de valor." },
    { emoji: "🔥", tip: "A diferença entre 100K e 1M de views pode ser literalmente UMA palavra no hook." },
    { emoji: "📝", tip: "Leia seu hook em voz alta 5 vezes. Se não fluir, reescreva." },
    { emoji: "🎬", tip: "Mudar título e thumbnail pode gerar 9 milhões a mais de views." },

    // Estrutura e Roteiro
    { emoji: "📖", tip: "Todo vídeo viral conta uma história. Mesmo os de 15 segundos." },
    { emoji: "🎭", tip: "Use a estrutura de Hollywood: passado doloroso → ruptura → resolução." },
    { emoji: "😢", tip: "Vulnerabilidade é superpoder. Compartilhar vergonha cria conexão instantânea." },
    { emoji: "🎯", tip: "Ataque a dor ESPECÍFICA. Mergulhe no trauma exato do seu público." },
    { emoji: "😂", tip: "Use humor seco ou piadas auto-depreciativas para quebrar o tom de guru." },
    { emoji: "🧲", tip: "Prova social na primeira frase: 'Eu consegui X e aqui está como'." },

    // Edição e Produção
    { emoji: "✂️", tip: "Corte fino: elimine TODO o dead space entre frases e palavras." },
    { emoji: "🎞️", tip: "B-roll a cada 3-5 segundos mantém a atenção presa." },
    { emoji: "📺", tip: "Nos primeiros 3-4 segundos, use B-rolls de menos de 1 segundo (hyper-cutting)." },
    { emoji: "💬", tip: "Legendas: curtas (máx 3 palavras), grandes (fácil de ler), claras (branco com sombra)." },
    { emoji: "📱", tip: "Você não está no negócio de fazer arte. Está no negócio de vencer a distração." },

    // Mindset e Execução
    { emoji: "🧠", tip: "A perfeição é a desculpa mais elegante para a covardia." },
    { emoji: "💪", tip: "É cringe até que você comece a ganhar dinheiro." },
    { emoji: "🎯", tip: "Seu objetivo inicial não é viralizar, é perder sua aura social. Poste 100x." },
    { emoji: "⚡", tip: "Informação sem ação não vale nada. Pare de inventar desculpas." },
    { emoji: "🎬", tip: "Grave o vídeo que você já roteirizou. A ação mais simples é abrir a câmera." },
    { emoji: "📅", tip: "A consistência cria padrão neural em 66 dias. Não há atalhos." },
    { emoji: "🏆", tip: "Foco na ação, não nos resultados. Parabenize-se apenas por aparecer." },
    { emoji: "🌅", tip: "Blindagem matinal: não abra o celular na primeira hora." },
    { emoji: "🗣️", tip: "Leia seus objetivos em voz alta toda manhã. Repetição é atalho para nova identidade." },
    { emoji: "🎭", tip: "O maior obstáculo é o primeiro passo. Comece ridiculamente pequeno." },

    // Autenticidade
    { emoji: "🎤", tip: "Você não precisa ser expert. Só precisa estar um passo à frente do seu público." },
    { emoji: "💔", tip: "Ninguém respeita perfeição. Pessoas respeitam trauma exposto." },
    { emoji: "🤝", tip: "Pessoas compram o coach, não o coaching." },
    { emoji: "🪞", tip: "Sua falta de experiência é sua maior arma. Use a proximidade." },
    { emoji: "😬", tip: "Poste coisas embaraçosas. A vulnerabilidade como alavanca funciona." },

    // Negócios e Vendas
    { emoji: "💰", tip: "Você não está vendendo informação. Está vendendo implementação." },
    { emoji: "📈", tip: "O mercado não paga pelo que você quer ensinar. Paga pelo problema que resolve." },
    { emoji: "🎯", tip: "As riquezas estão nos nichos. A especificidade vende, a generalidade é ignorada." },
    { emoji: "🆓", tip: "Dê seu melhor de graça. A conversão se torna inevitável." },
    { emoji: "⏰", tip: "Regra 7-11: O público precisa de 7 horas de conteúdo em 11 pontos de contato." },
    { emoji: "📞", tip: "Se sua chamada de vendas dura mais de 20 min, seu funil está quebrado." },
    { emoji: "💸", tip: "Leads pré-vendidos: a chamada deve ser onboarding, não persuasão." },
    { emoji: "🎁", tip: "Funil ninja: leve de R$0 a R$5K grátis. De R$5K a R$30K, eles pagam." },

    // IA e Ferramentas
    { emoji: "🤖", tip: "Se você não está usando IA, vai perder para alguém que está." },
    { emoji: "🧪", tip: "A IA pode sintetizar em minutos o que levaria 10 anos de pesquisa." },
    { emoji: "🔧", tip: "Use IA para gerar 5-10 variações de hooks. Escolha o mais emocional." },
    { emoji: "⚙️", tip: "Não é humano vs. IA, mas humano vs. humano que sabe usar a IA." },

    // Frases de Impacto
    { emoji: "💎", tip: "Conteúdo que não vende é entretenimento para pessoas que nunca vão te pagar." },
    { emoji: "🚀", tip: "O que te trouxe até aqui, vai te enterrar. Evolua sempre." },
    { emoji: "🏗️", tip: "Você é um empresário. Seu negócio é construir sistemas, não ser o sistema." },
    { emoji: "🧨", tip: "Às vezes você tem que dizer 'foda-se' e ter fé na sua capacidade." },
    { emoji: "🎯", tip: "Ninguém se importa com sua paixão. Importam-se com seus problemas resolvidos." },
    { emoji: "⭐", tip: "Não seja o cara que ensina muito. Seja o cara que entrega resultados." },

    // Método CUM
    { emoji: "📋", tip: "Método CUM: Copie hooks que funcionam, Entenda o porquê, Maximize e melhore." },
    { emoji: "🔍", tip: "Se você apenas copiar hooks sem entender, não vai viralizar." },

    // Nicho
    { emoji: "🎯", tip: "Desça 3 níveis de especificidade. Ex: Saúde → Fitness → Perda de peso pós-parto." },
    { emoji: "👥", tip: "Você não precisa de milhões de seguidores. Precisa de mil fãs verdadeiros." },
    { emoji: "📊", tip: "Um criador fez R$152K/mês com 30K seguidores = R$25 por seguidor." },
];

export const ProcessingView: React.FC = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);

    // Shuffle tips on mount so each session feels fresh
    const shuffledTips = useMemo(() => {
        return [...MINO_TIPS].sort(() => Math.random() - 0.5);
    }, []);

    useEffect(() => {
        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1; // 100 * 50ms = 5000ms = 5s total
            });
        }, 50);

        // Rotate messages
        const msgInterval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % MESSAGES.length);
        }, 1200);

        // Rotate tips every 3 seconds
        const tipInterval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % shuffledTips.length);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(msgInterval);
            clearInterval(tipInterval);
        };
    }, [shuffledTips.length]);

    return (
        <div className="processing-view glass-card" style={{
            textAlign: 'center',
            width: '100%',
            maxWidth: '500px',
            padding: '4rem 2rem',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(255, 107, 107, 0.15)'
        }}>
            {/* Ambient Background Glow */}
            <motion.div
                style={{
                    position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                    background: 'radial-gradient(circle, rgba(255,107,107,0.08) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }}
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: 'var(--accent)',
                        top: '40%', left: '50%',
                    }}
                    animate={{
                        x: Math.cos(i * 60) * 100 + (Math.random() * 20),
                        y: Math.sin(i * 60) * 100 + (Math.random() * 20),
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut"
                    }}
                />
            ))}

            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ marginBottom: '2.5rem', display: 'inline-block', position: 'relative' }}
            >
                <div style={{
                    position: 'absolute', inset: 0,
                    filter: 'blur(20px)', background: 'var(--accent)', opacity: 0.4
                }} />
                <Sparkles size={72} color="var(--accent)" fill="var(--accent)" style={{ position: 'relative' }} />
            </motion.div>

            <div style={{ minHeight: '5rem', marginBottom: '1.5rem', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={msgIndex}
                        initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                        transition={{ duration: 0.5, ease: "backOut" }}
                    >
                        <h2 style={{
                            fontSize: '2rem',
                            color: 'var(--dark)',
                            margin: '0 0 0.5rem 0',
                            fontFamily: 'var(--font-display)',
                            lineHeight: 1.2
                        }}>
                            {MESSAGES[msgIndex]}
                        </h2>
                        <p style={{
                            fontSize: '1rem',
                            color: 'var(--gray)',
                            opacity: 0.8
                        }}>
                            A mágica está acontecendo...
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Bar Container */}
            <div style={{
                background: 'rgba(0,0,0,0.03)',
                height: '12px',
                borderRadius: '6px',
                overflow: 'hidden',
                marginTop: '1rem',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                {/* Visual Bar */}
                <motion.div
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        borderRadius: '6px',
                        boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)'
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                />

                {/* Moving Shine */}
                <motion.div
                    style={{
                        position: 'absolute', top: 0, left: 0, height: '100%', width: '50%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                        transform: 'skewX(-20deg)',
                        mixBlendMode: 'overlay'
                    }}
                    animate={{ x: ['-150%', '350%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <div style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                color: 'var(--gray)',
                fontWeight: 500
            }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>PROCESSO IA</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
            </div>

            {/* Mino Tip Section */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.03) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(255,215,0,0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#B8860B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    <Lightbulb size={12} />
                    Dica do Hooky
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tipIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--dark)',
                            lineHeight: 1.5,
                            fontWeight: 500
                        }}
                    >
                        {shuffledTips[tipIndex]?.emoji} {shuffledTips[tipIndex]?.tip}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
