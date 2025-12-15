/**
 * 🔐 Script Generation Service - Secure Version
 * 
 * SEGURANÇA: Re-exporta do serviço seguro.
 * A API key fica no servidor, NUNCA exposta no frontend.
 */

import type { YouTubeVideoInfo } from './youtube';

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

// Re-export a função segura
export { generateViralScript } from '../../services/secureApi';

// Re-export o tipo para compatibilidade
export type { YouTubeVideoInfo };
