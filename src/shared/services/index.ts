/**
 * Shared Services - Barrel Export
 * 
 * Enables clean imports:
 * import { transcribeAudio, generateViralScript } from '../shared/services';
 */

// YouTube Service
export {
    extractVideoId,
    fetchYouTubeInfo,
    fetchMultipleYouTubeInfo,
    type YouTubeVideoInfo
} from './youtube';

// Transcription Service
export {
    transcribeAudio,
    extractProblemSolution
} from './transcription';

// Script Generation Service
export {
    generateViralScript,
    type ViralScriptResult
} from './script';

// Pipeline Service
export {
    processAudioToScript,
    type PipelineResult,
    type ProgressCallback
} from './pipeline';
