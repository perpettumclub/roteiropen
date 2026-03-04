import React, { useState, useEffect } from 'react';

const API = 'http://localhost:3002/api/affiliates';

interface Affiliate {
    id: string;
    name: string;
    email: string;
    code: string;
    commission_percent: number;
    is_active: boolean;
    created_at: string;
}

const AdminAffiliatesPage: React.FC = () => {
    const [tab, setTab] = useState<'create' | 'list'>('create');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [commission, setCommission] = useState(20);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; affiliate?: Affiliate & { link: string }; error?: string } | null>(null);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCommission, setEditCommission] = useState(0);

    const loadAffiliates = async () => {
        setListLoading(true);
        try {
            const res = await fetch(`${API}/affiliates`);
            const data = await res.json();
            setAffiliates(data.affiliates || []);
        } catch {
            setAffiliates([]);
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => { if (tab === 'list') loadAffiliates(); }, [tab]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${API}/affiliate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, commission_percent: commission }),
            });
            const data = await res.json();
            setResult(data);
            if (data.success) { setName(''); setEmail(''); setCommission(20); }
        } catch {
            setResult({ error: 'Erro ao conectar com o backend' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditCommission = async (id: string) => {
        try {
            await fetch(`${API}/affiliate/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commission_percent: editCommission }),
            });
            setEditingId(null);
            loadAffiliates();
        } catch { /* noop */ }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        try {
            await fetch(`${API}/affiliate/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !current }),
            });
            loadAffiliates();
        } catch { /* noop */ }
    };

    const s = { // styles
        page: { minHeight: '100vh', background: '#f9f9f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '32px 16px' } as React.CSSProperties,
        card: { maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #eee' } as React.CSSProperties,
        header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 } as React.CSSProperties,
        tabs: { display: 'flex', gap: 8, marginBottom: 28 } as React.CSSProperties,
        tab: (active: boolean) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: active ? '#FF6B6B' : '#f0f0f0', color: active ? '#fff' : '#555' } as React.CSSProperties),
        label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 } as React.CSSProperties,
        input: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 15, boxSizing: 'border-box' as const, marginBottom: 16 },
        row: { display: 'flex', gap: 12 } as React.CSSProperties,
        btn: (color = '#FF6B6B') => ({ width: '100%', padding: 14, borderRadius: 12, background: color, color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 8 } as React.CSSProperties),
        success: { marginTop: 20, padding: 16, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' } as React.CSSProperties,
        error: { marginTop: 20, padding: 16, borderRadius: 12, background: '#fff1f2', border: '1px solid #fecdd3' } as React.CSSProperties,
        affRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #f0f0f0' } as React.CSSProperties,
    };

    return (
        <div style={s.page}>
            <div style={s.card}>
                <div style={s.header}>
                    <span style={{ fontSize: 28 }}>🤝</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111' }}>Admin — Afiliados</h1>
                </div>

                <div style={s.tabs}>
                    <button style={s.tab(tab === 'create')} onClick={() => setTab('create')}>+ Criar Afiliado</button>
                    <button style={s.tab(tab === 'list')} onClick={() => setTab('list')}>Lista de Afiliados</button>
                </div>

                {tab === 'create' && (
                    <form onSubmit={handleCreate}>
                        <label style={s.label}>Nome</label>
                        <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Felipe Vidal" required />

                        <label style={s.label}>Email</label>
                        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="afiliado@email.com" required />

                        <label style={s.label}>Comissão (%)</label>
                        <div style={{ ...s.row, alignItems: 'center', marginBottom: 16 }}>
                            <input
                                style={{ ...s.input, marginBottom: 0, flex: 1 }}
                                type="number" min={1} max={80} step={1}
                                value={commission}
                                onChange={e => setCommission(Number(e.target.value))}
                            />
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#FF6B6B', whiteSpace: 'nowrap' }}>{commission}% de comissão</span>
                        </div>

                        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                            Link gerado: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>hookyai.com.br/?ref=CODIGO</code>
                        </p>

                        <button type="submit" disabled={loading} style={s.btn(loading ? '#ccc' : '#FF6B6B')}>
                            {loading ? 'Gerando...' : 'Criar Afiliado e Gerar Link'}
                        </button>
                    </form>
                )}

                {tab === 'create' && result && (
                    <div style={result.success ? s.success : s.error}>
                        {result.success && result.affiliate ? (
                            <>
                                <p style={{ color: '#16a34a', fontWeight: 700, margin: '0 0 12px' }}>✅ Afiliado criado!</p>
                                <div style={{ fontSize: 14, color: '#333' }}>
                                    <p style={{ margin: '0 0 6px' }}><b>Código:</b> <code style={{ background: '#e8f5e9', padding: '2px 8px', borderRadius: 6 }}>{result.affiliate.code}</code></p>
                                    <p style={{ margin: '0 0 6px' }}><b>Comissão:</b> {result.affiliate.commission_percent}%</p>
                                    <p style={{ margin: '0 0 6px' }}><b>Link de afiliado:</b></p>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <code style={{ background: '#f5f5f7', padding: '8px 12px', borderRadius: 8, fontSize: 12, flex: 1, wordBreak: 'break-all' }}>
                                            {result.affiliate.link}
                                        </code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(result.affiliate!.link)}
                                            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#FF6B6B', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                        >Copiar</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#dc2626', fontWeight: 600, margin: 0 }}>❌ {result.error}</p>
                        )}
                    </div>
                )}

                {tab === 'list' && (
                    <div>
                        {listLoading ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Carregando...</p>
                        ) : affiliates.length === 0 ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Nenhum afiliado ainda.</p>
                        ) : affiliates.map(a => (
                            <div key={a.id} style={s.affRow}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#111', fontSize: 15 }}>{a.name}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>{a.email}</div>
                                    <div style={{ fontSize: 12, marginTop: 4 }}>
                                        <code style={{ background: '#f5f5f7', padding: '2px 6px', borderRadius: 4 }}>
                                            hookyai.com.br/?ref={a.code}
                                        </code>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: 120 }}>
                                    {editingId === a.id ? (
                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                            <input
                                                type="number" min={1} max={80}
                                                value={editCommission}
                                                onChange={e => setEditCommission(Number(e.target.value))}
                                                style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
                                            />
                                            <span style={{ fontSize: 12 }}>%</span>
                                            <button onClick={() => handleEditCommission(a.id)} style={{ padding: '4px 8px', borderRadius: 6, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✓</button>
                                            <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', borderRadius: 6, background: '#eee', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: '#FF6B6B' }}>{a.commission_percent}%</span>
                                            <button onClick={() => { setEditingId(a.id); setEditCommission(a.commission_percent); }} style={{ padding: '4px 10px', borderRadius: 6, background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                                            <button
                                                onClick={() => handleToggleActive(a.id, a.is_active)}
                                                style={{ padding: '4px 10px', borderRadius: 6, background: a.is_active ? '#f0fdf4' : '#fff1f2', border: 'none', cursor: 'pointer', fontSize: 12, color: a.is_active ? '#16a34a' : '#dc2626' }}
                                            >{a.is_active ? 'Ativo' : 'Inativo'}</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAffiliatesPage;
