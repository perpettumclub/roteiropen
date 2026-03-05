import { getAllPosts } from '@/lib/posts'
import { ArticleCard } from '@/components/ArticleCard'
import type { Metadata } from 'next'
export default function BlogPage() {
    const posts = getAllPosts()

    return (
        <div className="container" style={{ padding: '64px 24px' }}>
            <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                <p style={{ color: '#FF6B6B', fontWeight: 600, fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Blog
                </p>
                <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.1, marginBottom: '16px' }}>
                    Aprenda a criar{' '}
                    <span className="text-gradient">roteiros virais</span>
                </h1>
                <p style={{ fontSize: '18px', color: '#636e72', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                    Estratégias, templates e os fundamentos que os maiores criadores usam para crescer consistentemente.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {posts.map(post => (
                    <ArticleCard key={post.slug} post={post} />
                ))}
            </div>

            <div className="glass-card" style={{ padding: '48px 32px', marginTop: '80px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,255,255,0.8) 100%)' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>
                    Coloque em prática <span className="text-gradient">agora</span>
                </h2>
                <p style={{ color: '#636e72', marginBottom: '28px', fontSize: '16px', lineHeight: 1.6 }}>
                    Fale sua ideia por 30 segundos. Hooky transforma em um roteiro viral estruturado, pronto para gravar.
                </p>
                <a
                    href="/"
                    style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                        color: '#fff',
                        padding: '16px 32px',
                        borderRadius: '100px',
                        fontSize: '16px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-body)',
                        boxShadow: '0 20px 40px -10px rgba(255, 107, 107, 0.3)',
                        textDecoration: 'none',
                    }}
                >
                    Criar Roteiro Grátis →
                </a>
            </div>
        </div>
    )
}
