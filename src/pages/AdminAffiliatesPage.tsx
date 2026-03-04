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

const CopyField: React.FC<{ value: string }> = ({ value }) => {
    const [copied, setCopied] = useState(false);
    const handle = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div
            onClick={handle}
            title="Clique para copiar"
            style={{
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: copied ? '#e8f5e9' : '#f5f5f7', borderRadius: 8,
                padding: '6px 10px', marginTop: 4, transition: 'background 0.2s',
            }}
        >
            <code style={{ fontSize: 12, color: '#444', flex: 1, wordBreak: 'break-all' }}>{value}</code>
            <span style={{ fontSize: 11, color: copied ? '#16a34a' : '#aaa', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {copied ? '✓ Copiado!' : '📋 Copiar'}
            </span>
        </div>
    );
};

const AdminAffiliatesPage: React.FC = () => {
    const [tab, setTab] = useState<'create' | 'list'>('create');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [commission, setCommission] = useState(20);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; affiliate?: Affiliate & { link: string }; error?: string } | null>(null);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [listLoading, setListLoading] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCommission, setEditCommission] = useState(0);
    const [editCode, setEditCode] = useState('');

    const loadAffiliates = async () => {
        setListLoading(true);
        try {
            const res = await fetch(API);
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
            const res = await fetch(API, {
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

    const startEdit = (a: Affiliate) => {
        setEditingId(a.id);
        setEditCommission(a.commission_percent);
        setEditCode(a.code);
    };

    const saveEdit = async (id: string) => {
        try {
            await fetch(`${API}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commission_percent: editCommission, code: editCode }),
            });
            setEditingId(null);
            loadAffiliates();
        } catch { /* noop */ }
    };

    const toggleActive = async (id: string, current: boolean) => {
        try {
            await fetch(`${API}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !current }),
            });
            loadAffiliates();
        } catch { /* noop */ }
    };

    const inp = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 15, boxSizing: 'border-box' as const, marginBottom: 16 };
    const tab_ = (active: boolean) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: active ? '#FF6B6B' : '#f0f0f0', color: active ? '#fff' : '#555' } as React.CSSProperties);

    return (
        <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '32px 16px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                    <span style={{ fontSize: 28 }}>🤝</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111' }}>Admin — Afiliados</h1>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    <button style={tab_(tab === 'create')} onClick={() => setTab('create')}>+ Criar Afiliado</button>
                    <button style={tab_(tab === 'list')} onClick={() => setTab('list')}>Lista de Afiliados</button>
                </div>

                {/* ── CRIAR ── */}
                {tab === 'create' && (
                    <form onSubmit={handleCreate}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>Nome</label>
                        <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Felipe Vidal" required />

                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>Email</label>
                        <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="afiliado@email.com" required />

                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>Comissão (%)</label>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                            <input style={{ ...inp, marginBottom: 0, flex: 1 }} type="number" min={1} max={80} step={1} value={commission} onChange={e => setCommission(Number(e.target.value))} />
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#FF6B6B', whiteSpace: 'nowrap' }}>{commission}% comissão</span>
                        </div>

                        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                            Link: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>hookyai.com.br/?ref=CODIGO</code>
                        </p>

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 12, background: loading ? '#ccc' : '#FF6B6B', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>
                            {loading ? 'Gerando...' : 'Criar Afiliado e Gerar Link'}
                        </button>
                    </form>
                )}

                {tab === 'create' && result && (
                    <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: result.success ? '#f0fdf4' : '#fff1f2', border: `1px solid ${result.success ? '#bbf7d0' : '#fecdd3'}` }}>
                        {result.success && result.affiliate ? (
                            <>
                                <p style={{ color: '#16a34a', fontWeight: 700, margin: '0 0 12px' }}>✅ Afiliado criado!</p>
                                <p style={{ margin: '0 0 6px', fontSize: 14 }}><b>Código:</b> <code style={{ background: '#e8f5e9', padding: '2px 8px', borderRadius: 6 }}>{result.affiliate.code}</code></p>
                                <p style={{ margin: '0 0 6px', fontSize: 14 }}><b>Comissão:</b> {result.affiliate.commission_percent}%</p>
                                <p style={{ margin: '0 0 4px', fontSize: 14 }}><b>Link (clique para copiar):</b></p>
                                <CopyField value={result.affiliate.link} />
                            </>
                        ) : (
                            <p style={{ color: '#dc2626', fontWeight: 600, margin: 0 }}>❌ {result.error}</p>
                        )}
                    </div>
                )}

                {/* ── LISTA ── */}
                {tab === 'list' && (
                    <div>
                        <button onClick={loadAffiliates} style={{ marginBottom: 16, padding: '6px 14px', borderRadius: 8, border: '1px solid #eee', background: '#f5f5f7', cursor: 'pointer', fontSize: 13 }}>🔄 Atualizar</button>
                        {listLoading ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Carregando...</p>
                        ) : affiliates.length === 0 ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Nenhum afiliado ainda.</p>
                        ) : affiliates.map(a => (
                            <div key={a.id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                                {editingId === a.id ? (
                                    // ── MODO EDIÇÃO ──
                                    <div>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Código</label>
                                                <input value={editCode} onChange={e => setEditCode(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #FF6B6B', fontSize: 14, boxSizing: 'border-box' as const }} />
                                            </div>
                                            <div style={{ width: 90 }}>
                                                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Comissão %</label>
                                                <input type="number" min={1} max={80} value={editCommission} onChange={e => setEditCommission(Number(e.target.value))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #FF6B6B', fontSize: 14, boxSizing: 'border-box' as const }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => saveEdit(a.id)} style={{ padding: '6px 18px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✓ Salvar</button>
                                            <button onClick={() => setEditingId(null)} style={{ padding: '6px 14px', borderRadius: 8, background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    // ── MODO VISUALIZAÇÃO ──
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: '#111', fontSize: 15 }}>{a.name}</div>
                                            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{a.email}</div>
                                            <CopyField value={`https://hookyai.com.br/?ref=${a.code}`} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', minWidth: 100 }}>
                                            <span style={{ fontSize: 16, fontWeight: 700, color: '#FF6B6B' }}>{a.commission_percent}%</span>
                                            <button onClick={() => startEdit(a)} style={{ padding: '4px 10px', borderRadius: 6, background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️ Editar</button>
                                            <button
                                                onClick={() => toggleActive(a.id, a.is_active)}
                                                style={{ padding: '4px 10px', borderRadius: 6, background: a.is_active ? '#f0fdf4' : '#fff1f2', border: 'none', cursor: 'pointer', fontSize: 12, color: a.is_active ? '#16a34a' : '#dc2626' }}
                                            >{a.is_active ? '● Ativo' : '○ Inativo'}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAffiliatesPage;
