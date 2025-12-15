/**
 * Pipeline Service
 * Orchestrates the full audio-to-script workflow
 */

import { transcribeAudio } from './transcription';
import { generateViralScript, type ViralScriptResult } from './script';
import { fetchMultipleYouTubeInfo } from './youtube';

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
    // Fetch YouTube video info if links provided
    let youtubeReferences: { title: string; author: string }[] = [];

    if (youtubeLinks && youtubeLinks.length > 0) {
        onProgress?.('Analisando vídeos de referência...');
        youtubeReferences = await fetchMultipleYouTubeInfo(youtubeLinks);
    }

    onProgress?.('Transcrevendo áudio...');
    const transcription = await transcribeAudio(audioBlob);

    onProgress?.(youtubeReferences.length > 0
        ? 'Remixando com vídeos virais...'
        : 'Gerando roteiro viral...'
    );

    const script = await generateViralScript(
        transcription,
        youtubeReferences.length > 0 ? youtubeReferences : undefined
    );

    return { transcription, script };
}
