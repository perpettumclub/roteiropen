import React, { useState } from 'react';

// Página de admin local — só aparece em modo DEV
// Acessível em: http://localhost:5555/admin
const AdminInvitePage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; magicLink?: string; error?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('http://localhost:3001/api/admin/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ error: 'Erro ao conectar com o backend' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9f9f9',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: 48,
                width: 420,
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                border: '1px solid #eee',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                    <span style={{ fontSize: 28 }}>🔑</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111' }}>Admin — Magic Link</h1>
                </div>

                <p style={{ color: '#666', fontSize: 14, marginBottom: 28 }}>
                    Gera um magic link e envia um email de acesso. Só funciona localmente.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                            Nome (opcional)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Felipe Vidal"
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 10,
                                border: '1.5px solid #e0e0e0', fontSize: 15, boxSizing: 'border-box',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                            required
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 10,
                                border: '1.5px solid #e0e0e0', fontSize: 15, boxSizing: 'border-box',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 12,
                            background: loading ? '#ccc' : '#FF6B6B',
                            color: '#fff', fontWeight: 700, fontSize: 16,
                            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Gerando...' : 'Gerar Magic Link e Enviar Email'}
                    </button>
                </form>

                {result && (
                    <div style={{
                        marginTop: 24, padding: 16, borderRadius: 12,
                        background: result.success ? '#f0fdf4' : '#fff1f2',
                        border: `1px solid ${result.success ? '#bbf7d0' : '#fecdd3'}`,
                    }}>
                        {result.success ? (
                            <>
                                <p style={{ color: '#16a34a', fontWeight: 600, margin: '0 0 8px' }}>✅ Email enviado!</p>
                                <p style={{ fontSize: 12, color: '#555', margin: '0 0 8px' }}>Magic link (expira em 1h):</p>
                                <a
                                    href={result.magicLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        fontSize: 11, color: '#FF6B6B', wordBreak: 'break-all',
                                        display: 'block', textDecoration: 'underline',
                                    }}
                                >
                                    {result.magicLink}
                                </a>
                            </>
                        ) : (
                            <p style={{ color: '#dc2626', fontWeight: 600, margin: 0 }}>❌ {result.error}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInvitePage;
