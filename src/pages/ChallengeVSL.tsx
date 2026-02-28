
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Play, Zap, BrainCircuit } from 'lucide-react';

export const ChallengeVSL: React.FC = () => {
    // STATE: Controls when the offer/button appears
    // Set to 600000 for 10 minutes
    const DELAY_MS = 600000;
    const [showOffer, setShowOffer] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowOffer(true);
        }, DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    const handleCheckout = () => {
        window.location.href = '/checkout-desafio';
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            overflowY: 'auto',
            background: '#050505',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 1rem',
            fontFamily: "'Inter', sans-serif",
            overflowX: 'hidden'
        }}>

            {/* HEADLINE SECTION - SURVIVAL THESIS */}
            <div style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '2rem', marginTop: '1rem', flex: '0 0 auto' }}>
                <span style={{
                    background: 'rgba(255, 107, 107, 0.15)',
                    color: '#FF6B6B',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    marginBottom: '1.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    letterSpacing: '0.05em'
                }}>
                    ⚠️ O Fim da Era dos Invisíveis
                </span>
                <h1 style={{
                    fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
                    fontWeight: 800,
                    lineHeight: 1.15,
                    marginBottom: '1.2rem',
                    letterSpacing: '-0.03em'
                }}>
                    Até 2025, criar conteúdo era <span style={{
                        background: 'linear-gradient(135deg, #FFEFBA 0%, #FFE66D 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline'
                    }}>escolha.</span>
                    <br />
                    A partir de agora, é <span style={{ color: '#FF6B6B' }}>sobrevivência.</span>
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#aaa',
                    maxWidth: '520px',
                    margin: '0 auto',
                    lineHeight: 1.7
                }}>
                    <strong style={{ color: '#fff' }}>Você não tem bloqueio criativo. Você tem medo de ser visto.</strong> Timidez virou um luxo que vai custar sua vida financeira.
                </p>
                <p style={{
                    fontSize: '0.95rem',
                    color: '#666',
                    maxWidth: '480px',
                    margin: '1.5rem auto 0',
                    lineHeight: 1.5,
                    fontStyle: 'italic'
                }}>
                    Assiste esse vídeo. Se nos primeiros 3 minutos você não sentir aquele aperto — tipo "caraca, é comigo" — pode fechar. Você já escolheu a mediocridade.
                </p>
            </div>

            {/* VERTICAL VIDEO PLAYER */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '9/16',
                height: 'auto',
                background: '#111',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                marginBottom: '4rem',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 0 auto'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, #1a1a1a 0%, #000 100%)',
                    zIndex: 1
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        opacity: 0.5
                    }} />

                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: '#222',
                        border: '2px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BrainCircuit size={60} color="#333" />
                    </div>
                </div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        background: 'linear-gradient(135deg, #FFEFBA 0%, #FFE66D 100%)',
                        width: '160px',
                        height: '160px',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 50px rgba(255, 230, 109, 0.3)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <div style={{
                        background: '#2D3436',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '10px'
                    }}>
                        <Play size={30} fill="#FFE66D" color="#FFE66D" style={{ marginLeft: '4px' }} />
                    </div>
                    <span style={{
                        color: '#2D3436',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Clique para ouvir
                    </span>
                </motion.div>

                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    width: '80%',
                    textAlign: 'center',
                    zIndex: 5
                }}>
                    <p style={{
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic'
                    }}>
                        "Eu sempre quis criar conteúdo..."
                    </p>
                </div>
            </div>

            {/* DELAYED OFFER SECTION */}
            <AnimatePresence>
                {showOffer && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            width: '100%',
                            maxWidth: '600px',
                            textAlign: 'center',
                            paddingBottom: '4rem'
                        }}
                    >
                        {/* URGENCY MESSAGE */}
                        <div style={{
                            background: 'rgba(255, 107, 107, 0.1)',
                            border: '1px solid rgba(255, 107, 107, 0.3)',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <p style={{ color: '#FF6B6B', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                A janela está aberta de novo.
                            </p>
                            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                Aquela oportunidade que os espertos aproveitaram em 2018... está reabrindo. Só que dessa vez, com IA você não tem mais desculpa.
                            </p>
                        </div>

                        <motion.button
                            onClick={handleCheckout}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(to right, #FFEFBA, #FFE66D)',
                                color: '#2D3436',
                                border: 'none',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 10px 40px rgba(255, 230, 109, 0.3)',
                                marginBottom: '1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            <Zap fill="#2D3436" size={20} /> EU QUERO COMEÇAR AGORA
                        </motion.button>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: '#666', fontSize: '0.85rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} /> Acesso Imediato
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} /> 7 Dias de Garantia
                            </span>
                        </div>

                        <div style={{
                            background: '#0f0f0f',
                            border: '1px solid #222',
                            borderRadius: '24px',
                            padding: '2.5rem 2rem',
                            textAlign: 'left',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                background: 'linear-gradient(90deg, #FFEFBA, #FFE66D)'
                            }} />

                            <h3 style={{ textAlign: 'center', color: 'white', marginBottom: '2rem', fontSize: '1.4rem' }}>
                                O Que Você Recebe:
                            </h3>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {[
                                    { text: "O Framework de 6 Atos (Roteiros que Seguram Atenção)", bold: true },
                                    { text: "BÔNUS: Ferramenta de IA que cria roteiros em segundos", bold: false },
                                    { text: "BÔNUS: Biblioteca de Hooks que funcionam", bold: false },
                                    { text: "BÔNUS: Comunidade de criadores virais", bold: false }
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '1.05rem', color: item.bold ? 'white' : '#ccc' }}>
                                        <div style={{ background: 'rgba(255, 230, 109, 0.2)', padding: '4px', borderRadius: '50%', marginTop: '2px' }}>
                                            <Check size={14} color="#FFE66D" strokeWidth={3} />
                                        </div>
                                        <span style={{ fontWeight: item.bold ? 700 : 400 }}>{item.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #333', textAlign: 'center' }}>
                                <p style={{ color: '#666', textDecoration: 'line-through', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Valor Total: R$ 497,00</p>
                                <p style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px' }}>
                                    R$ 297,00
                                </p>
                                <p style={{ color: '#FFE66D', fontSize: '0.9rem', fontWeight: 600 }}>à vista</p>
                            </div>
                        </div>

                    </motion.div>
                )}


                <div style={{ marginTop: 'auto', paddingTop: '4rem', paddingBottom: '2rem', color: '#444', fontSize: '0.75rem', lineHeight: 1.6, textAlign: 'center', flex: '0 0 auto' }}>
                    <p>Hooky AI © 2024. Tecnologia Proprietária.</p>
                    <p style={{ maxWidth: '400px', margin: '0.5rem auto' }}>
                        Este site não faz parte do site do Facebook ou Facebook Inc. Além disso, este site NÃO é endossado pelo Facebook de forma alguma.
                    </p>
                </div>
            </AnimatePresence>
        </div >
    );
};
