import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Clock, Bell, CreditCard } from 'lucide-react';

interface PaywallProps {
    onUpgrade: () => void;
    onClose?: () => void;
    isRequired?: boolean; // If true, cannot be dismissed
}

type Tab = 'hook' | 'trial' | 'promo';

export const Paywall: React.FC<PaywallProps> = ({ onUpgrade, onClose, isRequired = true }) => {
    const [currentTab, setCurrentTab] = useState<Tab>('hook');

    // Pricing with anchor
    const ORIGINAL_PRICE = 119.99; // R$9.99/month * 12
    const ANNUAL_PRICE = 49.99;
    const MONTHLY_EQUIVALENT = (ANNUAL_PRICE / 12).toFixed(2);
    const DISCOUNT_PERCENT = Math.round((1 - ANNUAL_PRICE / ORIGINAL_PRICE) * 100);

    // Exit promo
    const PROMO_PRICE = 29.99;

    const handleClose = () => {
        if (isRequired) {
            // Can't close, show exit promo instead
            if (currentTab !== 'promo') {
                setCurrentTab('promo');
            }
            return;
        }
        onClose?.();
    };

    const handleNext = () => {
        if (currentTab === 'hook') {
            setCurrentTab('trial');
        } else if (currentTab === 'trial') {
            onUpgrade();
        } else {
            onUpgrade();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: currentTab === 'promo'
                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)'
                    : 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                zIndex: 1000
            }}
        >
            <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card"
                style={{
                    maxWidth: '420px',
                    width: '100%',
                    padding: '2rem',
                    borderRadius: '32px',
                    textAlign: 'center',
                    position: 'relative',
                    background: 'white'
                }}
            >
                {/* Close button - only if not required or showing promo */}
                {(!isRequired || currentTab === 'promo') && (
                    <button
                        onClick={currentTab === 'promo' ? onClose : handleClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--gray)'
                        }}
                    >
                        <X size={16} />
                    </button>
                )}

                <AnimatePresence mode="wait">
                    {/* TAB 1: FREE HOOK */}
                    {currentTab === 'hook' && (
                        <motion.div
                            key="hook"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'white',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                }}>
                                <motion.img
                                    src="/favicon.png"
                                    alt="Hooky"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: 0.2,
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15
                                    }}
                                    style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                                />
                            </motion.div>

                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.6rem',
                                color: 'var(--dark)',
                                marginBottom: '0.5rem'
                            }}>
                                Queremos que você teste o Hooky grátis.
                            </h2>

                            <p style={{
                                color: 'var(--gray)',
                                fontSize: '0.95rem',
                                marginBottom: '2rem',
                                lineHeight: 1.6
                            }}>
                                Ganhe 3 dias de acesso completo para criar quantos roteiros quiser.
                            </p>

                            {/* Price Anchor */}
                            <div style={{
                                background: 'rgba(0,0,0,0.03)',
                                padding: '1.5rem',
                                borderRadius: '20px',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        color: 'var(--gray)',
                                        textDecoration: 'line-through',
                                        opacity: 0.6
                                    }}>
                                        R$ {ORIGINAL_PRICE.toFixed(2)}/ano
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 700,
                                    color: 'var(--primary)'
                                }}>
                                    R$ {ANNUAL_PRICE}/ano
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--gray)'
                                }}>
                                    = R$ {MONTHLY_EQUIVALENT}/mês • {DISCOUNT_PERCENT}% OFF
                                </div>
                            </div>

                            {/* No Payment Badge */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(16,185,129,0.1)',
                                color: '#10b981',
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                marginBottom: '1.5rem'
                            }}>
                                <Check size={16} />
                                Sem cobrança agora
                            </div>

                            {/* CTA */}
                            <motion.button
                                onClick={handleNext}
                                whileHover={{ scale: 1.02, boxShadow: '0 15px 40px rgba(255,107,107,0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    background: 'var(--dark)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1.25rem',
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
                                Testar por R$ 0,00
                                <ArrowRight size={20} />
                            </motion.button>

                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray)',
                                marginTop: '1rem',
                                opacity: 0.7
                            }}>
                                Após 3 dias: R$ {ANNUAL_PRICE}/ano
                            </p>
                        </motion.div>
                    )}

                    {/* TAB 2: TRIAL EXPLAINER */}
                    {currentTab === 'trial' && (
                        <motion.div
                            key="trial"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                color: 'var(--dark)',
                                marginBottom: '0.5rem'
                            }}>
                                Inicie seu trial GRÁTIS de 3 dias para continuar.
                            </h2>

                            <p style={{
                                color: 'var(--gray)',
                                fontSize: '0.9rem',
                                marginBottom: '2rem'
                            }}>
                                Veja como funciona:
                            </p>

                            {/* Timeline */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.25rem',
                                marginBottom: '2rem',
                                textAlign: 'left'
                            }}>
                                {/* Today */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(16,185,129,0.1)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Check size={20} color="#10b981" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: '0.25rem' }}>
                                            Hoje
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                                            Acesso total. Comece a criar roteiros virais.
                                        </div>
                                    </div>
                                </div>

                                {/* Day 2 */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255,193,7,0.1)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Bell size={20} color="#f59e0b" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: '0.25rem' }}>
                                            Em 2 dias - Lembrete
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                                            Te avisaremos antes de cobrar.
                                        </div>
                                    </div>
                                </div>

                                {/* Day 3 */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255,107,107,0.1)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <CreditCard size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: '0.25rem' }}>
                                            Em 3 dias - Cobrança
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                                            Cancele a qualquer momento antes.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    padding: '1rem',
                                    border: '2px solid rgba(0,0,0,0.1)',
                                    borderRadius: '16px',
                                    opacity: 0.5
                                }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Mensal</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--dark)' }}>
                                        R$ 9,99<span style={{ fontSize: '0.8rem' }}>/mês</span>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '1rem',
                                    border: '2px solid var(--primary)',
                                    borderRadius: '16px',
                                    background: 'rgba(255,107,107,0.05)',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '10px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '6px'
                                    }}>
                                        MELHOR
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Anual</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        R$ {ANNUAL_PRICE}<span style={{ fontSize: '0.8rem' }}>/ano</span>
                                    </div>
                                </div>
                            </div>

                            {/* No Payment Badge */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(16,185,129,0.1)',
                                color: '#10b981',
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                marginBottom: '1.5rem'
                            }}>
                                <Clock size={16} />
                                Sem cobrança agora
                            </div>

                            {/* CTA */}
                            <motion.button
                                onClick={handleNext}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    background: 'var(--dark)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Iniciar meu Trial Grátis de 3 Dias
                            </motion.button>

                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray)',
                                marginTop: '1rem',
                                opacity: 0.7
                            }}>
                                3 dias free, depois R$ {ANNUAL_PRICE}/ano
                            </p>
                        </motion.div>
                    )}

                    {/* TAB 3: EXIT PROMO */}
                    {currentTab === 'promo' && (
                        <motion.div
                            key="promo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Urgent Badge */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{
                                    background: 'var(--gradient-btn)',
                                    color: 'white',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '50px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    display: 'inline-block',
                                    marginBottom: '1.5rem'
                                }}
                            >
                                🔥 OFERTA ÚNICA
                            </motion.div>

                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.8rem',
                                color: 'var(--dark)',
                                marginBottom: '0.5rem'
                            }}>
                                Uma Oferta Imperdível
                            </h2>

                            <p style={{
                                color: 'var(--gray)',
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem'
                            }}>
                                Você não verá essa oferta novamente.
                            </p>

                            {/* Discount Box */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,193,7,0.1) 100%)',
                                padding: '1.5rem',
                                borderRadius: '20px',
                                marginBottom: '1.5rem',
                                border: '2px dashed var(--primary)'
                            }}>
                                <div style={{
                                    background: 'var(--secondary)',
                                    color: 'var(--dark)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'inline-block',
                                    marginBottom: '0.75rem'
                                }}>
                                    75% OFF
                                </div>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 700,
                                    color: 'var(--primary)'
                                }}>
                                    Apenas R$ {PROMO_PRICE} / ano
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--gray)',
                                    marginTop: '0.5rem'
                                }}>
                                    Menor preço já oferecido
                                </div>
                            </div>

                            {/* CTA */}
                            <motion.button
                                onClick={onUpgrade}
                                whileHover={{ scale: 1.02, boxShadow: '0 15px 40px rgba(255,107,107,0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    background: 'var(--gradient-btn)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-colored)'
                                }}
                            >
                                Garantir minha oferta agora!
                            </motion.button>

                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gray)',
                                    fontSize: '0.85rem',
                                    marginTop: '1rem',
                                    cursor: 'pointer',
                                    opacity: 0.6
                                }}
                            >
                                Não, prefiro pagar mais depois
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tab Indicators */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem'
                }}>
                    {(['hook', 'trial', 'promo'] as Tab[]).map((tab) => (
                        <div
                            key={tab}
                            style={{
                                width: currentTab === tab ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: currentTab === tab ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};
