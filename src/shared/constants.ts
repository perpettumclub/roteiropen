/**
 * Application Constants
 * 
 * Centralized configuration for business logic values.
 * NOTE: Pricing values are intentionally kept in their respective components.
 */

// =============================================================================
// FREE TIER LIMITS
// =============================================================================

/** Number of free scripts before requiring upgrade */
export const FREE_SCRIPTS_LIMIT = 3;

/** Default weekly goal for new users */
export const DEFAULT_WEEKLY_GOAL = 5;

// =============================================================================
// GAMIFICATION
// =============================================================================

/** Days in a row for streak badges */
export const STREAK_MILESTONES = {
    WEEK: 7,
    MONTH: 30,
    LEGENDARY: 100,
} as const;

/** Scripts created milestones */
export const SCRIPTS_MILESTONES = {
    FIRST: 1,
    PRODUCTIVE: 10,
    MACHINE: 50,
    KING: 100,
} as const;

/** Shares count milestones */
export const SHARES_MILESTONES = {
    FIRST: 1,
    INFLUENCER: 10,
} as const;

// =============================================================================
// TIMING & LIMITS
// =============================================================================

/** Maximum entries to keep in activity log */
export const MAX_ACTIVITY_LOG_ENTRIES = 30;

/** Audio recording limits (in seconds) */
export const AUDIO_LIMITS = {
    MIN_DURATION: 5,
    MAX_DURATION: 300, // 5 minutes
    WARNING_DURATION: 240, // 4 minutes
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

/** OpenAI API settings */
export const OPENAI_CONFIG = {
    TRANSCRIPTION_MODEL: 'whisper-1',
    CHAT_MODEL: 'gpt-4o-mini',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/** Animation durations (in milliseconds) */
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    PAGE_TRANSITION: 400,
} as const;

/** Toast/notification display time (in milliseconds) */
export const TOAST_DURATION = 2000;

// =============================================================================
// LOCAL STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
    USER: 'hooky_user',
    PROGRESS: 'hooky_progress_data',
    SCREENSHOTS: 'hooky_screenshots',
    ONBOARDING: 'hooky_onboarding_complete',
} as const;
