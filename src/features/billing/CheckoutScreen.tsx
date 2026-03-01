/**
 * Checkout Screen - Checkout Externo com OAuth (Mercado Pago)
 * 
 * Fluxo: 
 * 1. Verifica login
 * 2. Mostra resumo do plano
 * 3. Botão "Ir para Pagamento" -> Chama Edge Function -> Redireciona para MP
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CreditCard, AlertCircle, Check, Zap, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CheckoutScreenProps {
    onSuccess: () => void;
    onError?: (error: string) => void;
    planPrice?: number;
    planName?: string;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
    planPrice = 49.90,
    planName = 'Anual'
}) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string>('');

    // Verificar login
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
            }
        };
        checkUser();
    }, []);

    const handleExternalPayment = async () => {
        setLoading(true);
        setError('');

        try {
            if (!user) {
                setError('Usuário não identificado. Faça login novamente.');
                return;
            }

            // 1. Chama a Edge Function para criar o link
            const { data, error: funcError } = await supabase.functions.invoke('create-checkout', {
                body: {
                    user_id: user.id,
                    email: user.email,
                    price: planPrice,
                    title: `Hooky AI - Plano ${planName}`
                }
            });

            if (funcError) throw funcError;

            if (data?.init_point) {
                // 2. Redireciona para o Mercado Pago
                window.location.href = data.init_point;
            } else {
                throw new Error('Não foi possível gerar o link de pagamento.');
            }

        } catch (err: any) { // any: payment gateway errors not typed as Error
            console.error('Checkout error:', err);
            setError(err.message || 'Erro ao iniciar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                minHeight: '100vh',
                background: 'var(--gradient-primary)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* Header Visual */}
            <div style={{
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
                marginBottom: '2rem'
            }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        width: '80px',
                        height: '80px',
                        background: 'white',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    <img src="/favicon.png" alt="Logo" style={{ width: '48px', height: '48px' }} />
                </motion.div>

                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    color: 'var(--dark)',
                    marginBottom: '0.5rem'
                }}>
                    Resumo do Pedido
                </h1>
                <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>
                    Você está a um passo de viralizar.
                </p>
            </div>

            {/* Card Principal */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    maxWidth: '420px',
                    width: '100%',
                    background: 'white',
                    borderRadius: '32px',
                    padding: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}
            >
                {/* User Info */}
                {user && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '16px',
                        marginBottom: '1.5rem',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}>
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray)', fontWeight: 600 }}>CONTA VINCULADA</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <Check size={16} color="#10b981" />
                        </div>
                    </div>
                )}

                {/* Plan Details */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px dashed #e2e8f0'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)' }}>
                                Plano {planName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                                Acesso ilimitado + IA
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                                R$ {planPrice.toFixed(2).replace('.', ',')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                                / ano
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--gray)' }}>
                        <Zap size={14} fill="currentColor" color="#fbbf24" />
                        <span>3 dias grátis · Cancele quando quiser</span>
                    </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CTA Button */}
                <motion.button
                    onClick={handleExternalPayment}
                    disabled={loading || !user}
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,158,227, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        border: 'none',
                        background: '#009EE3', // Mercado Pago Blue
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: loading ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        opacity: loading || !user ? 0.7 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    {loading ? (
                        <>Carregando...</>
                    ) : (
                        <>
                            Começar 3 Dias Grátis
                            <ExternalLink size={20} />
                        </>
                    )}
                </motion.button>

                <p style={{
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--gray)',
                    marginTop: '0.75rem',
                    opacity: 0.8
                }}>
                    Grátis por 3 dias. Depois R$ {planPrice.toFixed(2).replace('.', ',')}/ano.
                </p>

                {/* Security Badges */}
                <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    color: 'var(--gray)',
                    opacity: 0.7
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                        <Shield size={14} /> Pagamento Seguro
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                        <CreditCard size={14} /> PIX ou Cartão
                    </div>
                </div>

            </motion.div>

            {/* Pix Badge Footer */}
            <div style={{
                marginTop: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                color: 'var(--dark)',
                fontSize: '0.85rem',
                fontWeight: 600
            }}>
                <img src="https://logospng.org/download/pix/logo-pix-icone-512.png" alt="Pix" style={{ width: '16px', height: '16px' }} />
                Aceitamos PIX com aprovação na hora
            </div>
        </motion.div>
    );
};
