/**
 * 🔐 Secure API Service - Método Israel Henrique
 * 
 * SEGURANÇA: Todas as chamadas passam pelo backend.
 * A API key do OpenAI fica no servidor, NUNCA exposta no frontend.
 * 
 * "A chave de API nem deveria estar aqui. A informação não pode chegar
 * até esse local." - Israel Henrique
 */

// Re-export todas as funções do serviço seguro
export {
    transcribeAudio,
    extractProblemSolution,
    generateViralScript,
    processAudioToScript,
} from './secureApi';
