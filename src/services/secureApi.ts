/**
 * Secure API Service - Método Israel Henrique
 * 
 * REGRA DE OURO: Frontend NUNCA acessa APIs externas diretamente.
 * Todas as chamadas passam pelo backend (Vercel Serverless).
 * 
 * Fluxo seguro:
 * Frontend → Vercel Serverless (API key segura) → OpenAI
 */

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
            // Remove o prefixo data:audio/webm;base64,
            resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Transcreve áudio usando o backend seguro
 * A API key fica no servidor, nunca exposta
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const audioBase64 = await blobToBase64(audioBlob);

    const response = await fetch(`${API_BASE}/transcribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: audioBase64 }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
    }

    const data = await response.json();
    return data.transcription;
}

/**
 * Extrai problema e solução da transcrição
 */
export async function extractProblemSolution(transcription: string): Promise<{
    problem: string;
    solution: string;
}> {
    // Esta é uma análise simples que pode ser feita localmente
    // ou movida para o backend se necessário
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transcription,
            extractOnly: true
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to extract problem/solution');
    }

    const data = await response.json();
    return {
        problem: data.problem || transcription.slice(0, 100) + '...',
        solution: data.solution || 'Insight extraído da sua ideia',
    };
}

/**
 * Gera roteiro viral usando o backend seguro
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
    metadata: {
        duration: string;
        tone: string;
        format: string;
    };
}> {
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transcription,
            youtubeReferences,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Script generation failed');
    }

    const data = await response.json();
    return data.script;
}

/**
 * Pipeline completo: Áudio → Transcrição → Roteiro
 * Tudo via backend seguro
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
        metadata: {
            duration: string;
            tone: string;
            format: string;
        };
    };
}> {
    // Fetch YouTube video info if links provided
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

/**
 * Extrai ID do vídeo YouTube
 */
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

/**
 * Busca info do YouTube via oEmbed (não precisa de API key)
 */
async function fetchYouTubeInfo(url: string): Promise<{ title: string; author: string } | null> {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) return null;

        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);

        if (!response.ok) return null;

        const data = await response.json();
        return {
            title: data.title || '',
            author: data.author_name || ''
        };
    } catch {
        return null;
    }
}
