/**
 * 🔐 Secure API Service - Hybrid Mode
 * 
 * Se tem VITE_OPENAI_API_KEY: usa diretamente (dev local)
 * Se não tem: usa Vercel Serverless (produção segura)
 */

// Para desenvolvimento local, usa a key diretamente
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Log para debug (seguro, não mostra a key toda)
console.log('🔍 DEBUG ENV:');
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('VITE_OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
if (OPENAI_API_KEY) {
    console.log('VITE_OPENAI_API_KEY length:', OPENAI_API_KEY.length);
    console.log('VITE_OPENAI_API_KEY prefix:', OPENAI_API_KEY.substring(0, 7));
} else {
    console.warn('⚠️ VITE_OPENAI_API_KEY is undefined!');
}

// Base URL para as funções serverless
const API_BASE = '/api';

/**
 * Converte Blob de áudio para base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Transcreve áudio - usa API key local se disponível
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    // Se tem API key local, usa diretamente
    if (OPENAI_API_KEY) {
        console.log('🔑 Using direct OpenAI API call');

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pt');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Transcription failed');
        }

        const data = await response.json();
        return data.text;
    }

    // Sem API key local, tenta serverless (produção)
    console.log('🔒 Using serverless function (Production Mode)');

    // Check if we are actually allowed to use serverless (only in non-dev or if configured)
    // For now, let's try it but warn if it fails
    try {
        const audioBase64 = await blobToBase64(audioBlob);
        const response = await fetch(`${API_BASE}/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: audioBase64 }),
        });

        if (!response.ok) {
            throw new Error('Serverless function failed (are you on Vercel?)');
        }

        const data = await response.json();
        return data.transcription;
    } catch (e) {
        console.error('Serverless transcription failed:', e);
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file locally.');
    }
}

/**
 * Extrai problema e solução da transcrição
 */
export async function extractProblemSolution(transcription: string): Promise<{
    problem: string;
    solution: string;
}> {
    return {
        problem: transcription.slice(0, 100) + '...',
        solution: 'Insight extraído da sua ideia',
    };
}

// System prompt para roteiros virais
const VIRAL_SCRIPT_PROMPT = `Você é um especialista em criar roteiros virais para Reels, TikTok e Shorts.
Sua missão: criar roteiros que PRENDEM atenção nos primeiros 3 segundos.

🎯 O HOOK PERFEITO (0-3 segundos)
O hook precisa ser uma AFIRMAÇÃO POLÊMICA que choca a pessoa.

EXEMPLOS DE HOOKS:
- "Você não quer ter sucesso de verdade. Se quisesse, já tinha parado de ficar rolando a tela do Instagram."
- "Você sabe que tá procrastinando agora, né?"

REGRAS DO HOOK:
- Português brasileiro natural e conversacional
- Use "VOCÊ" falando diretamente
- Máximo 2 frases curtas

📝 ESTRUTURA:
1. HOOK: Afirmação provocativa (1-2 frases)
2. CONFLITO: Mostre que entende a dor
3. CLÍMAX: O momento da verdade
4. SOLUÇÃO: O que fazer diferente
5. CTA: Chamada para ação

Gere 7 VARIAÇÕES DE HOOKS diferentes!

Responda em JSON:
{
  "hooks": [
    { "type": "Provocativo", "text": "...", "emoji": "🔥" },
    { "type": "Número Específico", "text": "...", "emoji": "📊" },
    { "type": "Pergunta que Dói", "text": "...", "emoji": "❓" },
    { "type": "Anti-guru", "text": "...", "emoji": "🚫" },
    { "type": "História Pessoal", "text": "...", "emoji": "📖" },
    { "type": "Segredo", "text": "...", "emoji": "🤫" },
    { "type": "Resultado Impossível", "text": "...", "emoji": "🚀" }
  ],
  "conflito": "...",
  "climax": "...",
  "solucao": "...",
  "cta": "...",
  "metadata": { "duration": "45 segundos", "tone": "confrontador", "format": "Reels/TikTok" }
}`;

/**
 * Gera roteiro viral - usa API key local se disponível
 */
export async function generateViralScript(
    transcription: string,
    youtubeReferences?: { title: string; author: string }[]
): Promise<{
    hooks: { type: string; text: string; emoji: string }[];
    conflito: string;
    climax: string;
    solucao: string;
    cta: string;
    metadata: { duration: string; tone: string; format: string };
}> {
    // Se tem API key local, usa diretamente
    if (OPENAI_API_KEY) {
        let systemPrompt = VIRAL_SCRIPT_PROMPT;

        if (youtubeReferences && youtubeReferences.length > 0) {
            const refsText = youtubeReferences
                .map((ref, i) => `${i + 1}. "${ref.title}" por ${ref.author}`)
                .join('\n');
            systemPrompt += `\n\n🎬 MODO REMIX - Referências:\n${refsText}`;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Transforme esta ideia em um roteiro viral:\n\n${transcription}` }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Script generation failed');
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }

    // Sem API key local, tenta serverless via fetch
    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription, youtubeReferences }),
        });

        if (!response.ok) {
            throw new Error('Serverless function failed');
        }

        const data = await response.json();
        return data.script;
    } catch (e) {
        console.error('Serverless generation failed:', e);
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file locally.');
    }
}

/**
 * Pipeline completo: Áudio → Transcrição → Roteiro
 */
export async function processAudioToScript(
    audioBlob: Blob,
    youtubeLinks?: string[],
    onProgress?: (step: string) => void
): Promise<{
    transcription: string;
    script: {
        hooks: { type: string; text: string; emoji: string }[];
        conflito: string;
        climax: string;
        solucao: string;
        cta: string;
        metadata: { duration: string; tone: string; format: string };
    };
}> {
    let youtubeReferences: { title: string; author: string }[] = [];

    if (youtubeLinks && youtubeLinks.length > 0) {
        onProgress?.('Analisando vídeos de referência...');
        const infoPromises = youtubeLinks.map(fetchYouTubeInfo);
        const results = await Promise.all(infoPromises);
        youtubeReferences = results.filter((r): r is { title: string; author: string } => r !== null);
    }

    onProgress?.('Transcrevendo áudio...');
    const transcription = await transcribeAudio(audioBlob);

    onProgress?.(youtubeReferences.length > 0 ? 'Remixando com vídeos virais...' : 'Gerando roteiro viral...');
    const script = await generateViralScript(
        transcription,
        youtubeReferences.length > 0 ? youtubeReferences : undefined
    );

    return { transcription, script };
}

function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

async function fetchYouTubeInfo(url: string): Promise<{ title: string; author: string } | null> {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) return null;

        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);
        if (!response.ok) return null;

        const data = await response.json();
        return { title: data.title || '', author: data.author_name || '' };
    } catch {
        return null;
    }
}
