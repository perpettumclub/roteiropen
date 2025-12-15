/**
 * 🔐 Transcription Service - Secure Version
 * 
 * SEGURANÇA: Re-exporta do serviço seguro.
 * A API key fica no servidor, NUNCA exposta no frontend.
 */

export { transcribeAudio, extractProblemSolution } from '../../services/secureApi';
