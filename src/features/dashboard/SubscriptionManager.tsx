import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ArrowRight, XCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { MILLISECONDS_PER_DAY } from '../../shared/constants';

export const SubscriptionManager: React.FC = () => {
    const { signOut } = useAuth();
    const {
        subscription,
        daysRemaining,
        autoRenew,
        toggleAutoRenew,
        cancelSubscription
    } = useSubscription();

    const [showDetails, setShowDetails] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const subscriptionStartDate = subscription?.started_at
        ? new Date(subscription.started_at)
        : new Date();

    return (
        <>
            <motion.div
                className="glass-card"
                initial={false}
                style={{ padding: '1.25rem', borderRadius: '20px', marginTop: '0.5rem', overflow: 'hidden' }}
            >
                <div
                    onClick={() => setShowDetails(!showDetails)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Settings size={20} color="var(--gray)" />
                        <span style={{ color: 'var(--dark)', fontSize: '0.9rem', fontWeight: 500 }}>Gerenciar assinatura</span>
                    </div>
                    <motion.div animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ArrowRight size={18} color="var(--gray)" style={{ transform: 'rotate(90deg)' }} />
                    </motion.div>
                </div>

                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>Assinatura desde</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--dark)' }}>
                                    {subscriptionStartDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <div style={{
                                background: daysRemaining <= 7 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                padding: '1rem', borderRadius: '12px'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>Expira em</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: daysRemaining <= 7 ? '#EF4444' : 'var(--dark)' }}>
                                    {daysRemaining} dias
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(212, 175, 55, 0.08)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark)' }}>Renovação automática</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                                    {autoRenew ? 'Ativada - cobrança automática' : 'Desativada'}
                                </div>
                            </div>
                            <button
                                onClick={() => toggleAutoRenew()}
                                style={{
                                    width: '50px', height: '28px', borderRadius: '14px', border: 'none',
                                    background: autoRenew ? '#10B981' : 'rgba(0,0,0,0.15)',
                                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                                }}
                            >
                                <motion.div
                                    animate={{ x: autoRenew ? 22 : 2 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        position: 'absolute', top: '2px'
                                    }}
                                />
                            </button>
                        </div>

                        <button
                            onClick={() => setShowCancelModal(true)}
                            style={{
                                width: '100%', padding: '0.75rem', background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px',
                                color: '#EF4444', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <XCircle size={16} /> Cancelar plano
                        </button>

                        <button
                            onClick={signOut}
                            style={{
                                width: '100%', padding: '0.75rem', marginTop: '0.75rem',
                                background: 'transparent', border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '12px', color: 'var(--gray)', fontSize: '0.9rem',
                                fontWeight: 500, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <span style={{ transform: 'rotate(180deg)' }}>➜</span> Sair da conta
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Cancel Modal */}
            {showCancelModal && (() => {
                const isTrial = subscription?.status === 'trialing';
                const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
                const lastPaymentDate = expiresAt ? new Date(expiresAt) : null;
                if (lastPaymentDate) lastPaymentDate.setFullYear(lastPaymentDate.getFullYear() - 1);
                const daysSincePayment = lastPaymentDate
                    ? Math.floor((Date.now() - lastPaymentDate.getTime()) / MILLISECONDS_PER_DAY)
                    : 999;
                const isRefundEligible = !isTrial && daysSincePayment <= 7;

                return (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                background: 'white', borderRadius: '24px', padding: '2rem',
                                maxWidth: '400px', width: '100%', textAlign: 'center'
                            }}
                        >
                            <div style={{
                                width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 1.5rem'
                            }}>
                                <XCircle size={32} color="#EF4444" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                Cancelar assinatura?
                            </h3>

                            {isTrial ? (
                                <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Seu período de teste será encerrado imediatamente. Nenhuma cobrança foi feita.
                                </p>
                            ) : isRefundEligible ? (
                                <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Sua assinatura será cancelada e o <strong style={{ color: '#10B981' }}>reembolso será processado automaticamente</strong>. Você está dentro do prazo de 7 dias.
                                </p>
                            ) : (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                        Sua assinatura será cancelada e futuras cobranças serão interrompidas.
                                    </p>
                                    <div style={{
                                        background: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px',
                                        padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#EF4444', fontWeight: 500
                                    }}>
                                        ⚠️ O prazo de 7 dias para reembolso já expirou. Não haverá devolução do valor pago.
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    style={{
                                        flex: 1, padding: '1rem', background: '#f5f5f5', border: 'none',
                                        borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Manter plano
                                </button>
                                <button
                                    disabled={isCancelling}
                                    onClick={async () => {
                                        setIsCancelling(true);
                                        const success = await cancelSubscription();
                                        setIsCancelling(false);
                                        setShowCancelModal(false);
                                        if (success) {
                                            if (isTrial) alert('✅ Período de teste cancelado. Nenhuma cobrança foi feita.');
                                            else if (isRefundEligible) alert('✅ Assinatura cancelada e reembolso processado!');
                                            else alert('✅ Assinatura cancelada. Futuras cobranças foram interrompidas.');
                                        } else {
                                            alert('Erro ao cancelar assinatura. Entre em contato com o suporte.');
                                        }
                                    }}
                                    style={{
                                        flex: 1, padding: '1rem',
                                        background: isCancelling ? '#ccc' : '#EF4444',
                                        color: 'white', border: 'none', borderRadius: '12px',
                                        fontSize: '1rem', fontWeight: 600,
                                        cursor: isCancelling ? 'wait' : 'pointer'
                                    }}
                                >
                                    {isCancelling ? 'Cancelando...' : 'Confirmar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                );
            })()}
        </>
    );
};
