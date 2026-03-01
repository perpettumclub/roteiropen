import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';

interface SignUpScreenProps {
    onSuccess: (email?: string) => void;
    redirectPath?: string; // Para onde o Google deve mandar de volta
}

export function SignUpScreen({ onSuccess, redirectPath }: SignUpScreenProps) {
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle, sendVerificationCode } = useAuth();

    // Limpeza de segurança: Garante que não tem resquício do Desafio
    useEffect(() => {
        localStorage.removeItem('hooky_redirect_to');
    }, []);

    const handleGoogleSignUp = async () => {
        setError(null);
        setLoading(true);

        // Se NÃO tem path de redirect específico (fluxo padrão), força checkout
        if (!redirectPath) {
            localStorage.setItem('hooky_pending_checkout', 'true');
        }

        // Agora passamos o redirectPath para o AuthContext
        const { error } = await signInWithGoogle(redirectPath);
        if (error) {
            setError('Erro ao conectar com Google. Tente novamente.');
            setLoading(false);
        }
    };

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
            if (error.message === 'User already registered') {
                // Se o usuário já existe, e estamos no fluxo padrão, mandamos para o login -> checkout
                if (!redirectPath) {
                    localStorage.setItem('hooky_pending_checkout', 'true');
                    window.location.href = '/login';
                    return;
                }
                setError('Este email já está cadastrado');
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            const { error: codeError } = await sendVerificationCode(email);
            if (codeError) {
                setError('Erro ao enviar código de verificação. Tente novamente.');
                setLoading(false);
                return;
            }
            onSuccess(email);
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

            {error && (
                <div style={{
                    background: '#FEE2E2',
                    color: '#DC2626',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {!showEmailForm ? (
                    <motion.div
                        key="buttons"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {/* Google Sign Up Button */}
                        <motion.button
                            onClick={handleGoogleSignUp}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '1rem 1.5rem',
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginBottom: '1.5rem',
                                color: '#1f1f1f'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Registrar com Google
                        </motion.button>

                        {/* Divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>ou</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

                        {/* Email Trigger Button */}
                        <motion.button
                            onClick={() => setShowEmailForm(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '1rem 1.5rem',
                                background: 'transparent',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                color: 'var(--dark)'
                            }}
                        >
                            <Mail size={20} />
                            Criar conta com email
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div style={{ display: 'flex', marginBottom: '1rem' }}>
                            <button
                                onClick={() => setShowEmailForm(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--gray)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    padding: 0
                                }}
                            >
                                <ArrowLeft size={16} />
                                Voltar
                            </button>
                        </div>

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

                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Crie uma senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 1.25rem',
                                        borderRadius: '12px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#9CA3AF'
                                    }}
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <input
                                type={showPassword ? 'text' : 'password'}
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
                                {loading ? 'Criando conta...' : 'Criar conta'}
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
