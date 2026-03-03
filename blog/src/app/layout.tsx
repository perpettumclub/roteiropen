import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Blog — Hooky AI | Roteiros Virais com IA',
    template: '%s | Blog Hooky AI',
  },
  description: 'Aprenda a criar roteiros virais para TikTok, Reels e Shorts. Estratégias, templates e dicas de criadores que faturam com conteúdo.',
  metadataBase: new URL('https://hookyai.com.br'),
  icons: {
    icon: '/blog/favicon.png',
    apple: '/blog/favicon.png',
  },
  openGraph: {
    siteName: 'Hooky AI Blog',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header style={{
          borderBottom: '1px solid rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
            <a href="https://hookyai.com.br" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--primary)', lineHeight: 1 }}>Hooky</span>
              <span style={{ fontSize: '13px', color: 'var(--gray)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Blog</span>
            </a>
            <a
              href="https://hookyai.com.br"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                boxShadow: 'var(--shadow-colored)',
              }}
            >
              Criar Roteiro Grátis →
            </a>
          </div>
        </header>
        <main>{children}</main>
        <footer style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
          <p>© 2026 Hooky AI · <a href="https://hookyai.com.br">hookyai.com.br</a></p>
        </footer>
      </body>
    </html>
  )
}
