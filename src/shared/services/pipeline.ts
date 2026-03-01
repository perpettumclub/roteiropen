/**
 * Pipeline Service
 * Orchestrates the full audio-to-script workflow
 */

import { transcribeAudio } from './transcription';
import { generateViralScript, type ViralScriptResult } from './script';
import { fetchMultipleYouTubeInfoWithTranscripts } from './youtube';

export interface PipelineResult {
    transcription: string;
    script: ViralScriptResult;
}

export type ProgressCallback = (step: string) => void;

/**
 * Full pipeline: Audio → Transcription → Script (with optional YouTube remix)
 */
export async function processAudioToScript(
    audioBlob: Blob,
    youtubeLinks?: string[],
    onProgress?: ProgressCallback
): Promise<PipelineResult> {
    // Fetch YouTube video info + transcripts if links provided
    let youtubeReferences: { title: string; author: string; transcript?: string }[] = [];

    if (youtubeLinks && youtubeLinks.length > 0) {
        onProgress?.('Buscando transcrições dos vídeos...');
        youtubeReferences = await fetchMultipleYouTubeInfoWithTranscripts(youtubeLinks);
    }

    onProgress?.('Transcrevendo seu áudio...');
    const transcription = await transcribeAudio(audioBlob);

    onProgress?.(youtubeReferences.length > 0
        ? 'Remixando com conteúdo dos vídeos...'
        : 'Gerando roteiro viral...'
    );

    const script = await generateViralScript(
        transcription,
        youtubeReferences.length > 0 ? youtubeReferences : undefined
    );

    return { transcription, script };
}
