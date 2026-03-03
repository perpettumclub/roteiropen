'use client'

import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'

interface Props {
    post: PostMeta
}

export function ArticleCard({ post }: Props) {
    return (
        <Link href={`/${post.slug}`} style={{ textDecoration: 'none' }}>
            <article
                className="glass-card"
                style={{ padding: '32px', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                        ; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px -10px rgba(255, 107, 107, 0.3)'
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                        ; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#B2BEC3', fontWeight: 500 }}>{post.date}</span>
                    <span style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: 600 }}>· {post.readingTime} de leitura</span>
                </div>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#2D3436', lineHeight: 1.3, fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>{post.title}</h2>
                <p style={{ color: '#636e72', lineHeight: 1.6, fontSize: '16px', marginBottom: '20px' }}>{post.description}</p>
                <span style={{ color: '#FF6B6B', fontWeight: 600, fontSize: '14px' }}>Ler artigo →</span>
            </article>
        </Link>
    )
}
