import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';

interface ForgotPasswordScreenProps {
    onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    padding: '2.5rem',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>

                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    color: 'var(--dark)',
                    marginBottom: '0.5rem'
                }}>
                    Email enviado!
                </h2>

                <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>

                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        background: 'var(--dark)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Voltar para login
                </motion.button>
            </motion.div>
        );
    }

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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>

            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--dark)',
                marginBottom: '0.5rem'
            }}>
                Esqueceu a senha?
            </h2>

            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
                Digite seu email e enviaremos um link para redefinir sua senha.
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
                        outline: 'none'
                    }}
                />

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

                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    style={{
                        background: loading ? '#9CA3AF' : 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </motion.button>
            </form>

            <button
                onClick={onBack}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '1.5rem'
                }}
            >
                ← Voltar para login
            </button>
        </motion.div>
    );
}
