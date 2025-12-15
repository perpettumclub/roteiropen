import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';

interface AuthScreenProps {
    onSuccess: () => void;
    onSwitchToSignUp: () => void;
    onForgotPassword: () => void;
}

export function LoginScreen({ onSuccess, onSwitchToSignUp, onForgotPassword }: AuthScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const { signIn, resendConfirmationEmail } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setEmailNotConfirmed(false);
        setResendSuccess(false);
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            // Check if it's an email not confirmed error
            const isEmailNotConfirmed = error.message.toLowerCase().includes('email not confirmed') ||
                error.message.toLowerCase().includes('email não confirmado');

            if (isEmailNotConfirmed) {
                setEmailNotConfirmed(true);
                setError('Email não confirmado. Verifique sua caixa de entrada ou reenvie o email de confirmação.');
            } else {
                setError(error.message === 'Invalid login credentials'
                    ? 'Email ou senha incorretos'
                    : error.message);
            }
            setLoading(false);
        } else {
            onSuccess();
        }
    };

    const handleResendConfirmation = async () => {
        setResending(true);
        setResendSuccess(false);
        const { error } = await resendConfirmationEmail(email);
        setResending(false);

        if (error) {
            setError(`Erro ao reenviar: ${error.message}`);
        } else {
            setResendSuccess(true);
            setError(null);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card"
            style={{
                padding: '2.5rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}
        >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>

            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--dark)',
                marginBottom: '0.5rem'
            }}>
                Bem-vindo de volta!
            </h2>

            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
                Entre para acessar seus roteiros
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                />

                <input
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />

                {resendSuccess && (
                    <div style={{
                        background: '#D1FAE5',
                        color: '#059669',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}>
                        ✅ Email de confirmação reenviado! Verifique sua caixa de entrada.
                    </div>
                )}

                {error && (
                    <div style={{
                        background: '#FEE2E2',
                        color: '#DC2626',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {emailNotConfirmed && !resendSuccess && (
                    <motion.button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resending}
                        whileHover={{ scale: resending ? 1 : 1.02 }}
                        whileTap={{ scale: resending ? 1 : 0.98 }}
                        style={{
                            background: resending ? '#9CA3AF' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: resending ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {resending ? 'Reenviando...' : '📧 Reenviar email de confirmação'}
                    </motion.button>
                )}


                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    style={{
                        background: loading ? '#9CA3AF' : 'var(--dark)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '0.5rem'
                    }}
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </motion.button>
            </form>

            <button
                onClick={onForgotPassword}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '1rem'
                }}
            >
                Esqueceu a senha?
            </button>

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb'
            }}>
                <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                    Não tem conta?{' '}
                </span>
                <button
                    onClick={onSwitchToSignUp}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Criar conta grátis
                </button>
            </div>
        </motion.div>
    );
}
