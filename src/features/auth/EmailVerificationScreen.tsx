import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EmailVerificationScreenProps {
    email: string;
    onVerified: () => void;
    onResendCode: () => Promise<{ error: Error | null }>;
    onVerifyCode: (code: string) => Promise<{ error: Error | null }>;
    onBack: () => void;
}

export function EmailVerificationScreen({
    email,
    onVerified,
    onResendCode,
    onVerifyCode,
    onBack
}: EmailVerificationScreenProps) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCooldown]);

    const handleInputChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError(null);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are filled
        if (newCode.every(digit => digit !== '') && value) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newCode = pastedData.split('');
            setCode(newCode);
            handleVerify(pastedData);
        }
    };

    const handleVerify = async (fullCode: string) => {
        setLoading(true);
        setError(null);

        const { error } = await onVerifyCode(fullCode);

        if (error) {
            setError(error.message);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } else {
            onVerified();
        }

        setLoading(false);
    };

    const handleResend = async () => {
        if (!canResend) return;

        setCanResend(false);
        setResendCooldown(60);
        setError(null);

        const { error } = await onResendCode();
        if (error) {
            setError('Erro ao reenviar código. Tente novamente.');
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>

            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--dark)',
                marginBottom: '0.5rem'
            }}>
                Verifique seu email
            </h2>

            <p style={{ color: 'var(--gray)', marginBottom: '0.5rem' }}>
                Enviamos um código de 6 dígitos para
            </p>
            <p style={{ color: 'var(--dark)', fontWeight: 600, marginBottom: '2rem' }}>
                {email}
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

            {/* Code Input */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '1.5rem'
            }}>
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={loading}
                        style={{
                            width: '48px',
                            height: '56px',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                ))}
            </div>

            {/* Verify Button */}
            <motion.button
                onClick={() => handleVerify(code.join(''))}
                disabled={loading || code.some(d => d === '')}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                    width: '100%',
                    background: loading || code.some(d => d === '') ? '#9CA3AF' : 'var(--dark)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem'
                }}
            >
                {loading ? 'Verificando...' : 'Verificar código'}
            </motion.button>

            {/* Resend */}
            <div style={{ marginBottom: '1rem' }}>
                {canResend ? (
                    <button
                        onClick={handleResend}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Reenviar código
                    </button>
                ) : (
                    <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                        Reenviar código em {resendCooldown}s
                    </span>
                )}
            </div>

            {/* Back */}
            <button
                onClick={onBack}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                }}
            >
                ← Voltar
            </button>
        </motion.div>
    );
}
