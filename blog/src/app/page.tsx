'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Sparkles, Share2, TrendingUp, Zap, Brain, Users, LogIn } from 'lucide-react'
import { useGlobalStats } from '@/hooks/useGlobalStats'

const useAnimatedCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(startValue + (target - startValue) * easeOutQuart))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return count
}

export default function LandingPage() {
  const { totalScripts, activeCreators } = useGlobalStats()
  const scriptsCount = useAnimatedCounter(totalScripts, 2000)
  const creatorsCount = useAnimatedCounter(activeCreators, 1800)

  const handleStart = () => {
    const onboardingComplete = localStorage.getItem('hooky_onboarding_complete')

    if (!onboardingComplete) {
      window.location.href = '/onboarding'
    } else {
      const hasCompletedQuiz = localStorage.getItem('hooky_quiz_complete')
      if (!hasCompletedQuiz) {
        window.location.href = '/quiz'
      } else if (localStorage.getItem('hooky_pending_checkout') === 'true') {
        window.location.href = '/checkout'
      } else {
        window.location.href = '/app/gravar'
      }
    }
  }

  const handleLogin = () => {
    window.location.href = '/login'
  }

  const features = [
    {
      icon: <Mic size={32} color="var(--primary)" />,
      title: "1. Grave Bagunçado",
      desc: "Fale qualquer ideia por 30s. Sem estrutura, sem roteiro, apenas seus pensamentos puros."
    },
    {
      icon: <Sparkles size={32} color="var(--secondary)" />,
      title: "2. IA Estrutura",
      desc: "Nossa IA identifica o ouro, cria um hook matador e estrutura o storytelling em 15 segundos."
    },
    {
      icon: <TrendingUp size={32} color="var(--accent)" />,
      title: "3. Roteiro Viral",
      desc: "Receba em segundos um roteiro pronto para Reels/TikTok com alto potencial de retenção."
    }
  ]

  return (
    <div className="landing-view" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>

      {/* LOGIN BUTTON - Top Right */}
      <motion.button
        onClick={handleLogin}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '50px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.1)',
          color: 'var(--dark)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          zIndex: 100
        }}
      >
        <LogIn size={18} />
        Entrar
      </motion.button>

      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: '6rem', paddingTop: '4rem' }}
      >
        {/* Social Proof Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,230,109,0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,107,107,0.2)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--dark)'
          }}
        >
          <span style={{
            background: 'var(--primary)',
            color: 'white',
            padding: '0.2rem 0.5rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            🔥 AO VIVO
          </span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
            {scriptsCount.toLocaleString('pt-BR')}+
          </span>
          <span>roteiros criados</span>
        </motion.div>

        <h1 style={{
          fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
          marginBottom: '1.5rem',
          lineHeight: 1.2,
          fontFamily: 'var(--font-display)',
          color: 'var(--primary)',
          textShadow: '0 10px 30px rgba(0,0,0,0.05)',
          paddingBottom: '0.1em'
        }}
        >
          <span className="text-gradient">Hooky</span>
        </h1>

        <p style={{
          fontSize: '1.4rem',
          color: 'var(--dark)',
          opacity: 0.8,
          marginBottom: '3rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6
        }}>
          Transforme ideias bagunçadas em <strong>roteiros virais</strong> estruturados em segundos.
          <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.1rem', opacity: 0.7 }}>
            Fale como pensa. Grave como um profissional.
          </span>
        </p>

        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(255, 107, 107, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '1.5rem 3.5rem',
            borderRadius: '4rem',
            fontSize: '1.4rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-colored)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          Gravar Ideia Agora 🎤
        </motion.button>

        {/* Social Proof - Active Creators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '4rem'
          }}
        >
          {/* Avatar Stack */}
          <div style={{ display: 'flex', marginRight: '0.25rem' }}>
            {[
              '/images/avatars/avatar_1.png',
              '/images/avatars/avatar_4.png',
              '/images/avatars/avatar_2.png',
              '/images/avatars/avatar_3.png',
              '/images/avatars/avatar_5.png'
            ].map((photoUrl, i) => (
              <div
                key={i}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid white',
                  marginLeft: i > 0 ? '-8px' : '0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  background: '#f0f0f0'
                }}
              >
                <img
                  src={photoUrl}
                  alt={`Creator ${i + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Users size={14} />
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {creatorsCount.toLocaleString('pt-BR')}+
              </span>
              criadores
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
              já usam o Hooky
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* HOW IT WORKS */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '6rem' }}
      >
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '3rem',
          fontFamily: 'var(--font-display)'
        }}>Como a mágica acontece</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          padding: '0 1rem'
        }}>
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="glass-card"
              style={{
                padding: '2.5rem',
                borderRadius: '24px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.5rem'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>{feature.title}</h3>
              <p style={{ color: 'var(--dark)', opacity: 0.7, lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* WHY US */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          background: 'var(--dark)',
          color: 'white',
          padding: '4rem 2rem',
          borderRadius: '32px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '2rem', color: '#fff' }}>
          Por que usar o Hooky?
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
          <div style={{ maxWidth: '250px' }}>
            <Zap size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>Velocidade</h4>
            <p style={{ opacity: 0.7 }}>De ideia a roteiro em 15 segundos.</p>
          </div>
          <div style={{ maxWidth: '250px' }}>
            <Brain size={40} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>Sem Bloqueios</h4>
            <p style={{ opacity: 0.7 }}>Nunca mais encare uma página em branco.</p>
          </div>
          <div style={{ maxWidth: '250px' }}>
            <Share2 size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>Viralidade</h4>
            <p style={{ opacity: 0.7 }}>Estruturas comprovadas que prendem a atenção.</p>
          </div>
        </div>
      </motion.div>

      {/* FOOTER */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          marginTop: '3rem',
          textAlign: 'center',
          padding: '2rem',
          opacity: 0.8
        }}
      >
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          marginBottom: '1rem',
          color: 'var(--primary)'
        }}>
          Hooky
        </h3>

        <p style={{
          color: 'var(--dark)',
          opacity: 0.7,
          maxWidth: '400px',
          margin: '0 auto 1.5rem auto',
          lineHeight: 1.6
        }}>
          A ferramenta secreta dos criadores que valorizam seu tempo e amam viralizar.
        </p>

        <div style={{
          fontSize: '0.9rem',
          color: 'var(--gray)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          paddingTop: '1.5rem',
          maxWidth: '200px',
          margin: '0 auto'
        }}>
          Feito com 🧡 para creators
        </div>
      </motion.div>

      <div style={{ height: '2rem' }} />
    </div>
  )
}
