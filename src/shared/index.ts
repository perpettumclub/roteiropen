// Shared components exports
export { HookyLogo } from './components/HookyLogo';
export { StreakDisplay } from './components/StreakDisplay';
export { LandingView } from './components/LandingView';
export { AISuggestions } from './components/AISuggestions';
export { BadgeNotification } from './components/BadgeNotification';

// Shared context exports
export { UserProvider, useUser } from './context/UserContext';

// Shared prompts exports
export {
    VIRAL_SCRIPT_SYSTEM_PROMPT,
    buildCompletePrompt,
    buildKnowledgeContext,
    buildRemixContext,
    JSON_RESPONSE_FORMAT
} from './prompts/viral-script-prompt';

// Shared services exports
export {
    transcribeAudio,
    extractProblemSolution,
    generateViralScript,
    processAudioToScript,
    generateDailyChallenge,
    analyzeProfileImage,
    type ViralScriptResult,
    type PipelineResult,
    type DailyChallengePrompt,
    type ExtractedMetrics
} from './services';

// Shared constants exports
export * from './constants';
