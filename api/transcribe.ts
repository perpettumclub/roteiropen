import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// API key segura no servidor - NUNCA exposta no frontend
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Apenas POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY environment variable is not set');
        return res.status(500).json({
            error: 'OpenAI API key not configured on server',
            hint: 'Add OPENAI_API_KEY to Vercel Environment Variables'
        });
    }

    try {
        const { audio } = req.body;

        if (!audio) {
            return res.status(400).json({ error: 'Audio data is required' });
        }

        // Converter base64 para buffer
        const audioBuffer = Buffer.from(audio, 'base64');

        // Criar um arquivo temporário para enviar à API
        const audioFile = new File([audioBuffer], 'recording.webm', {
            type: 'audio/webm',
        });

        // Transcrever com Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'pt',
        });

        return res.status(200).json({
            success: true,
            transcription: transcription.text,
        });
    } catch (error) {
        console.error('Transcription error:', error);
        return res.status(500).json({
            error: 'Transcription failed',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
