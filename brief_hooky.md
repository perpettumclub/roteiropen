# Hooky AI - Complete Project Brief

## 1. Product Overview
**Hooky** is an AI-powered audio copilot that transforms unstructured voice notes into viral, high-retention video scripts (for TikTok, Reels, Shorts) in seconds. It uses a proprietary "Anti-Guru" framework to structure content, ensuring it hooks the audience immediately.

**One-Liner:** "A pocket viral strategist that turns 'rambling' into military-grade retention scripts."

## 2. Core Value Proposition
*   **Problem:** The "Expert Mute Syndrome". Experts and founders have valuable knowledge but struggle to package it for social media algorithms. They face "Writer's Block" and find scripting tedious.
*   **Solution:** Speak naturally (ramble), and Hooky structures it into a scientifically proven viral format. It's not just a transcriber; it's a **structural editor**.

## 3. Target Audience
*   Creators, Coaches, Consultants, and Founders.
*   People who have knowledge but lack the time or skill to write engaging scripts.
*   Users who want to build a personal brand but get stuck on "what to say" or "how to say it".

## 4. The "Magic" (Secret Sauce)
Hooky uses a proprietary **6-Act "Mino Lee Method"** to restructure content:
1.  **Act I: Invasion Hook (0-3s):** Cuts through noise with specific, often polarizing statements.
2.  **Act II: Identification (4-12s):** "I was just like you" connection.
3.  **Act III: Anchoring (13-25s):** Introduces authority or external concept.
4.  **Act IV: The Rupture (26-35s):** The "Aha!" moment / cynical logic flip.
5.  **Act V: Action Plan (36-45s):** Rapid, actionable steps.
6.  **Act VI: Challenge CTA (46-60s):** Engagement bait (e.g., "Comment DONE if...").

**Tone:** "Drunken Honest Friend" – vulnerable, direct, anti-generic. It actively penalizes "LinkedIn Coach" speak.

## 5. Core Features
### A. Voice-to-Script Engine
*   **Input:** WebRTC audio recording or file upload.
*   **Process:** Transcribed via OpenAI Whisper -> Processed via GPT-4o-mini with custom system prompts -> Output structured script.

### B. YouTube Remix (The "Brain")
*   Users can paste links to viral videos (e.g., Hormozi, MrBeast).
*   AI analyzes the *structure* and *pacing* of the reference.
*   Merges the user's raw idea with the reference's viral structure.

### C. Gamification & Retention
*   **Streaks:** Tracks consecutive days creating.
*   **Badges:** XP and achievements to trigger "Loss Aversion".
*   **Profile Assessment:** 8-question onboarding quiz to classify creator type (Lightning, Perfectionist, Strategist, Viral) and tailor scripts.

### D. Hard Paywall ("Degustação Bloqueada")
*   **Flow:** User records -> Sees separate "Blurred Preview" (Title + Hook visible, rest blurred) -> Must pay to unlock.
*   **Why:** Proven to convert better (8-12%) than standard free trials because value is created *before* the paywall.

## 6. Technical Stack
*   **Frontend:** React + Vite + TypeScript
*   **Styling:** Vanilla CSS + Framer Motion (Glassmorphism, Premium "Aura" aesthetic)
*   **Audio:** Web Audio API + MediaRecorder
*   **AI:** OpenAI API (Whisper + GPT-4o-mini)
*   **Backend:** Supabase (Auth, Database, Edge Functions)
*   **Payments:**
    *   **Brazil:** Mercado Pago (Pix/Card)
    *   **Global:** Stripe
*   **Deployment:** Vercel

## 7. Business Model & Expansion
### Pricing Strategy (PPP - Purchasing Power Parity)
*   **Brazil:** R$ 67/year (Accessible volume play)
*   **Global:** US$ 67/year (Premium play)
*   *Note: Same backend, detected via IP.*

### Growth Strategy
1.  **Phase 1 (Global Validation):** Launch in US (ProductHunt, Reddit) to validate product-market fit and get USD revenue.
2.  **Phase 2 (Brazil Scale):** Use "US Validated" social proof to convert Brazilian users via influencers and ads.

## 8. Development Status
*   **Current:** MVP functional (Web Recorder, AI Integration).
*   **To-Do:** Implement Hard Paywall (Blurred Preview), Finish i18n (Internationalization), Integrate Stripe/Mercado Pago switching logic.
