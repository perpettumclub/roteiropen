/**
 * Transcription Service
 * Handles audio transcription using OpenAI Whisper API
 */

import { OPENAI_CONFIG } from '../constants';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', OPENAI_CONFIG.TRANSCRIPTION_MODEL);
    formData.append('language', 'pt'); // Portuguese

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.text;
}

/**
 * Extract problem and solution from transcription
 */
export async function extractProblemSolution(transcription: string): Promise<{
    problem: string;
    solution: string;
}> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OPENAI_CONFIG.CHAT_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `Você é um especialista em analisar ideias para conteúdo viral.
Analise a transcrição do usuário e extraia:

1. PROBLEMA/DOR: Qual é o problema ou dor que o público-alvo enfrenta? (1-2 frases)
2. SOLUÇÃO/INSIGHT: Qual é a solução ou insight principal que resolve esse problema? (1-2 frases)

Responda em JSON:
{
  "problem": "O problema/dor identificado",
  "solution": "A solução/insight proposto"
}

Se não houver um problema/solução claro, faça uma sugestão baseada no contexto.`
                },
                { role: 'user', content: transcription }
            ],
            temperature: 0.5,
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to extract problem/solution');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}
