/**
 * 🔐 Secure API Service - Hybrid Mode
 * 
 * Se tem VITE_OPENAI_API_KEY: usa diretamente (dev local)
 * Se não tem: usa Vercel Serverless (produção segura)
 */

// A chave da OpenAI foi removida do frontend por segurança.
// Todas as chamadas de IA devem passar pelo backend.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';



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
 * Transcreve áudio
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
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
        throw new Error('Erro ao transcrever áudio com o servidor.');
    }
}

/**
 * Extrai problema e solução da transcrição
 * Como a API Key foi removida, repassamos a transcrição para a Edge Function / Server.
 * Caso ainda não haja uma rota específica de extração no backend para fallback,
 * retornamos o comportamento de fallback padrão que existia antes.
 */
export async function extractProblemSolution(transcription: string): Promise<{
    problem: string;
    solution: string;
}> {
    // Agora o frontend não tem mais permição para chamar o chat completion da OpenAI diretamente.
    // O fallback original devolvia a própria transcrição como problema.
    // Futura melhoria estruturada: Criar rota `/api/extract` no backend.
    console.warn('⚠️ Frontend abstraction: Sending fallback. A backend route should be created for /api/extract.');
    return {
        problem: transcription,
        solution: 'Solução baseada na sua ideia',
    };
}

/**
 * Gera roteiro viral
 */
export async function generateViralScript(
    transcription: string,
    youtubeReferences?: { title: string; author: string; transcript?: string }[]
): Promise<{
    hooks: { type: string; text: string; emoji: string }[];
    conflito: string;
    climax: string;
    storytelling: string;
    solucao: string;
    cta: string | { texto: string; palavra_chave: string; entrega_prometida: string; emoji: string };
    metadata: { duration: string; tone: string; format: string };
}> {
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
        throw new Error('Erro ao comunicar com o servidor de IA.');
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
        storytelling: string;
        solucao: string;
        cta: string | { texto: string; palavra_chave: string; entrega_prometida: string; emoji: string };
        metadata: { duration: string; tone: string; format: string };
    };
}> {
    let youtubeReferences: { title: string; author: string; transcript?: string }[] = [];

    if (youtubeLinks && youtubeLinks.length > 0) {
        onProgress?.('Buscando transcrições dos vídeos...');

        // Fetch info and transcripts for each video
        const fetchPromises = youtubeLinks.map(async (url) => {
            try {
                // Fetch info via backend
                const infoResponse = await fetch(`${BACKEND_URL}/api/youtube/info?url=${encodeURIComponent(url)}`);
                const info = infoResponse.ok ? await infoResponse.json() : null;

                // Fetch transcript via backend
                const transcriptResponse = await fetch(`${BACKEND_URL}/api/youtube/transcript?url=${encodeURIComponent(url)}`);
                const transcriptData = transcriptResponse.ok ? await transcriptResponse.json() : null;

                if (info) {
                    return {
                        title: info.title || '',
                        author: info.author || '',
                        transcript: transcriptData?.transcript || undefined
                    };
                }
                return null;
            } catch {
                return null;
            }
        });

        const results = await Promise.all(fetchPromises);
        youtubeReferences = results.filter(r => r !== null) as { title: string; author: string; transcript?: string }[];


    }

    onProgress?.('Transcrevendo seu áudio...');
    const transcription = await transcribeAudio(audioBlob);

    onProgress?.(youtubeReferences.length > 0 ? 'Remixando com conteúdo dos vídeos...' : 'Gerando roteiro viral...');
    const script = await generateViralScript(
        transcription,
        youtubeReferences.length > 0 ? youtubeReferences : undefined
    );

    return { transcription, script };
}
