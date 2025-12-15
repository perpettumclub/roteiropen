import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';

interface SignUpScreenProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}

export function SignUpScreen({ onSuccess, onSwitchToLogin }: SignUpScreenProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        const { error } = await signUp(email, password, name);

        if (error) {
            setError(error.message === 'User already registered'
                ? 'Este email já está cadastrado'
                : error.message);
            setLoading(false);
        } else {
            onSuccess();
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>

            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--dark)',
                marginBottom: '0.5rem'
            }}>
                Crie sua conta
            </h2>

            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
                Comece a criar roteiros virais hoje
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />

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

                <input
                    type="password"
                    placeholder="Crie uma senha"
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

                <input
                    type="password"
                    placeholder="Confirme a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '0.5rem'
                    }}
                >
                    {loading ? 'Criando conta...' : 'Criar conta grátis'}
                </motion.button>
            </form>

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb'
            }}>
                <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                    Já tem conta?{' '}
                </span>
                <button
                    onClick={onSwitchToLogin}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Entrar
                </button>
            </div>
        </motion.div>
    );
}
