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

// Vision & AI Analysis Service
export {
    analyzeProfileImage,
    type ExtractedMetrics
} from './vision';

// Challenge Generator Service
export {
    generateDailyChallenge,
    type DailyChallengePrompt
} from './challengeGenerator';

// Payment Service
export {
    initiateCheckout,
    type CheckoutResponse
} from './payment';
