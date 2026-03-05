import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

const GA_ID = 'G-NEEY5J0LGF'

export const metadata: Metadata = {
  title: 'Hooky AI — Roteiros Virais com IA para TikTok e Reels',
  description: 'Hooky transforma suas ideias bagunçadas em roteiros virais estruturados em segundos. Grave 30 segundos de voz e nossa IA entrega um roteiro pronto para TikTok, Reels e Shorts. Usado por +500 criadores.',
  keywords: 'roteiro viral, IA para criadores, roteiro para reels, roteiro para tiktok, roteiro para shorts, inteligência artificial criadores de conteúdo, hooky ai',
  authors: [{ name: 'Hooky AI' }],
  robots: 'index, follow',
  metadataBase: new URL('https://hookyai.com.br'),
  alternates: {
    canonical: 'https://hookyai.com.br',
    languages: { 'pt-BR': 'https://hookyai.com.br' },
  },
  icons: {
    icon: '/hooky-ai.png',
    apple: '/hooky-ai.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Hooky AI',
    title: 'Hooky AI — Roteiros Virais com IA para TikTok e Reels',
    description: 'Grave uma ideia bagunçada por 30 segundos. A Hooky transforma em um roteiro viral estruturado para TikTok, Reels e Shorts. Experimente agora.',
    url: 'https://hookyai.com.br',
    images: [{
      url: 'https://hookyai.com.br/miniatura_hooky.png',
      width: 1200,
      height: 630,
      alt: 'Hooky AI — Transforme ideias em roteiros virais em segundos',
    }],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hookyai',
    title: 'Hooky AI — Roteiros Virais com IA',
    description: 'Grave 30 segundos de voz. Receba um roteiro viral pronto para TikTok, Reels e Shorts. Usado por +500 criadores.',
    images: [{
      url: 'https://hookyai.com.br/miniatura_hooky.png',
      alt: 'Hooky AI — Transforme ideias em roteiros virais',
    }],
  },
  other: {
    'theme-color': '#FF6B6B',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Hooky AI',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Hooky AI',
  url: 'https://hookyai.com.br',
  logo: 'https://hookyai.com.br/favicon.png',
  image: 'https://hookyai.com.br/miniatura_hooky.png',
  description: 'Hooky transforma ideias bagunçadas em roteiros virais estruturados em segundos usando inteligência artificial. Para criadores de conteúdo no TikTok, Reels e YouTube Shorts.',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web, iOS, Android',
  inLanguage: 'pt-BR',
  offers: {
    '@type': 'Offer',
    price: '67.00',
    priceCurrency: 'BRL',
    priceValidUntil: '2026-12-31',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '500',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Hooky AI',
    url: 'https://hookyai.com.br',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        {children}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
