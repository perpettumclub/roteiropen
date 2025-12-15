# Hooky - PRD (Product Requirements Document)

## Visão Geral

**Hooky** é uma ferramenta de IA que transforma áudio/voz em roteiros virais estruturados para Reels, TikTok e Shorts. O usuário grava sua ideia falando naturalmente, e a IA gera um roteiro completo com hook, desenvolvimento e CTA.

## Core Features

### 1. Gravador de Voz → Roteiro
- Gravação de áudio via browser (WebRTC)
- Transcrição via OpenAI Whisper
- Geração de roteiro via GPT-4o-mini

### 2. YouTube Remix (Opcional)
- Tela separada após gravação
- Adicionar até 3 links de vídeos virais
- IA analisa padrões virais e combina com a ideia do usuário
- Skip link para pular o remix

### 3. Quiz de Onboarding
8 perguntas para criar perfil de criador:
- Nicho, seguidores, desafio, frequência, experiência, objetivo, estilo, plataforma
- Determina tipo de criador: Relâmpago, Perfeccionista, Estrategista, Viral

### 4. Gamificação
- **Streaks**: Dias consecutivos criando conteúdo
- **Badges**: 20+ conquistas (primeiro quiz, scripts, streaks, etc.)
- **Meta semanal**: Progresso visual
- **Desafios semanais**: Objetivos com recompensas

### 5. Biblioteca de Scripts
- Salvar roteiros gerados
- Favoritar scripts
- Busca e filtros
- Copiar para clipboard

### 6. Limite Freemium
- 3 scripts grátis
- Paywall para upgrade premium

## User Flow

```
Landing → Quiz (8 perguntas) → Gravador → [Remix?] → Processing → Resultado
                                              ↓
                                         Dashboard (opcional)
```

## Estrutura do Roteiro Gerado

```json
{
  "hook": "Primeiros 3 segundos - gancho viral",
  "body": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "cta": "Chamada para ação",
  "metadata": {
    "duration": "45 segundos",
    "tone": "storytelling pessoal",
    "platform": "Reels/TikTok"
  }
}
```

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Vanilla CSS + Framer Motion
- **Audio**: Web Audio API + MediaRecorder
- **AI**: OpenAI (Whisper + GPT-4o-mini)
- **State**: React Context + localStorage
- **Backend (futuro)**: Supabase
