import { getAllPosts, getPostBySlug } from '@/lib/posts'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import './article.css'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return getAllPosts().map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = getAllPosts().find(p => p.slug === slug)
    if (!post) return {}

    return {
        title: post.title,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            url: `https://hookyai.com.br/blog/${slug}`,
            images: [{ url: 'https://hookyai.com.br/miniatura_hooky.png', width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: ['https://hookyai.com.br/miniatura_hooky.png'],
        },
    }
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params

    const posts = getAllPosts()
    const exists = posts.find(p => p.slug === slug)
    if (!exists) notFound()

    const post = await getPostBySlug(slug)

    return (
        <div className="container" style={{ padding: '64px 24px' }}>
            <a href="/blog" style={{ color: 'var(--gray)', fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '40px', textDecoration: 'none' }}>
                ← Voltar ao blog
            </a>

            <header style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: 500 }}>{post.date}</span>
                    <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>· {post.readingTime} de leitura</span>
                </div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.2, marginBottom: '16px' }}>{post.title}</h1>
                <p style={{ fontSize: '20px', color: '#636e72', lineHeight: 1.6 }}>{post.description}</p>
            </header>

            <article
                className="article-content"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            <div className="glass-card" style={{ padding: '40px 32px', marginTop: '64px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,255,255,0.8) 100%)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>
                    Coloque em prática <span className="text-gradient">agora</span>
                </h2>
                <p style={{ color: '#636e72', marginBottom: '24px', lineHeight: 1.6 }}>
                    Grave sua ideia por 30 segundos. Hooky transforma em um roteiro viral pronto para gravar.
                </p>
                <a
                    href="https://hookyai.com.br"
                    style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                        color: '#fff',
                        padding: '14px 28px',
                        borderRadius: '100px',
                        fontSize: '15px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-body)',
                        boxShadow: 'var(--shadow-colored)',
                        textDecoration: 'none',
                    }}
                >
                    Criar Roteiro Grátis →
                </a>
            </div>
        </div>
    )
}
