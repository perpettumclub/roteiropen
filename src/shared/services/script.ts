/**
 * Script Generation Service
 * Handles viral script generation using OpenAI GPT-4o-mini
 */

import { OPENAI_CONFIG } from '../constants';
import { buildCompletePrompt } from '../prompts/viral-script-prompt';
import type { YouTubeVideoInfo } from './youtube';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface ViralScriptResult {
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
}

/**
 * Generate viral script using GPT-4o-mini
 */
export async function generateViralScript(
    transcription: string,
    youtubeReferences?: YouTubeVideoInfo[]
): Promise<ViralScriptResult> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    // Build system prompt with optional YouTube references
    const systemPrompt = buildCompletePrompt({
        youtubeReferences: youtubeReferences
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OPENAI_CONFIG.CHAT_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Transforme esta ideia em um roteiro viral:\n\n${transcription}` }
            ],
            temperature: OPENAI_CONFIG.TEMPERATURE,
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Script generation failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('Empty response from GPT');
    }

    return JSON.parse(content);
}
