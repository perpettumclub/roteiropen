// Shared components exports
export { HookyLogo } from './components/HookyLogo';
export { StreakDisplay } from './components/StreakDisplay';
export { LandingView } from './components/LandingView';
export { AISuggestions } from './components/AISuggestions';

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
    type ViralScriptResult,
    type PipelineResult
} from './services';

// Shared constants exports
export * from './constants';
