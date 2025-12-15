/**
 * useAppState Hook
 * 
 * Manages the application's state machine and navigation logic.
 * Extracted from App.tsx to follow Single Responsibility Principle.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ViralScript } from '../types';
import type { CreatorProfile } from '../features/onboarding';
import { useUser } from '../shared/context/UserContext';
import { useAuth } from '../features/auth/AuthContext';
import {
    transcribeAudio,
    extractProblemSolution,
    processAudioToScript
} from '../shared/services';
import { STORAGE_KEYS } from '../shared/constants';

// =============================================================================
// TYPES
// =============================================================================

export type AppState =
    | 'idle'
    | 'onboarding'
    | 'quiz'
    | 'paywall'
    | 'login'
    | 'signup'
    | 'forgotpassword'
    | 'dashboard'
    | 'library'
    | 'progress'
    | 'recording'
    | 'transcribing'
    | 'confirm'
    | 'remix'
    | 'processing'
    | 'result'
    | 'share'
    | 'error';

export interface AppStateData {
    // Current state
    state: AppState;

    // Data
    script: ViralScript | null;
    error: string | null;
    capturedAudio: Blob | null;
    youtubeLinks: string[];
    transcription: string;
    confirmedProblem: string;
    confirmedSolution: string;
    showPaywall: boolean;
}

export interface AppStateActions {
    // Navigation
    startFlow: () => void;
    handleStartRecording: () => void;
    handleReset: () => void;
    handleViewDashboard: () => void;
    handleShareComplete: () => void;

    // Auth
    handleAuthSuccess: () => void;
    handleUpgrade: () => void;
    setShowPaywall: (show: boolean) => void;

    // Quiz
    handleQuizComplete: (profile: CreatorProfile) => void;

    // Recording
    handleAudioCaptured: (blob: Blob) => Promise<void>;

    // Confirmation
    handleConfirmProblemSolution: (problem: string, solution: string) => void;

    // Remix
    handleSkipRemix: () => void;
    handleConfirmRemix: () => void;
    setYoutubeLinks: (links: string[]) => void;

    // Direct state control
    setState: (state: AppState) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAppState(): AppStateData & AppStateActions {
    // State
    const [state, setState] = useState<AppState>('idle');
    const [script, setScript] = useState<ViralScript | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    // Remix flow
    const [capturedAudio, setCapturedAudio] = useState<Blob | null>(null);
    const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);

    // Confirmation flow
    const [transcription, setTranscription] = useState<string>('');
    const [confirmedProblem, setConfirmedProblem] = useState<string>('');
    const [confirmedSolution, setConfirmedSolution] = useState<string>('');

    // External state
    const {
        hasCompletedQuiz,
        freeScriptsRemaining,
        isPremium,
        creatorProfile,
        completeQuiz,
        useScript,
        saveScript,
        checkStreak,
        upgradeToPremium
    } = useUser();

    const { user, loading: authLoading } = useAuth();

    // ==========================================================================
    // EFFECTS
    // ==========================================================================

    // Check auth and streak on mount
    useEffect(() => {
        if (authLoading) return;

        if (hasCompletedQuiz && user) {
            checkStreak();
            if (state === 'idle') {
                setState('recording');
            }
        }
    }, [hasCompletedQuiz, user, authLoading, state, checkStreak]);

    // ==========================================================================
    // NAVIGATION HANDLERS
    // ==========================================================================

    const startFlow = useCallback(() => {
        const onboardingComplete = localStorage.getItem(STORAGE_KEYS.ONBOARDING);

        if (!onboardingComplete) {
            setState('onboarding');
        } else if (!hasCompletedQuiz) {
            setState('quiz');
        } else if (!user) {
            setState('login');
        } else {
            setState('recording');
        }
    }, [hasCompletedQuiz, user]);

    const handleStartRecording = useCallback(() => {
        if (!isPremium && freeScriptsRemaining <= 0) {
            setShowPaywall(true);
        } else {
            setState('recording');
        }
    }, [isPremium, freeScriptsRemaining]);

    const handleReset = useCallback(() => {
        setState('recording');
        setScript(null);
        setError(null);
        setCapturedAudio(null);
        setYoutubeLinks([]);
    }, []);

    const handleViewDashboard = useCallback(() => {
        setState('share');
    }, []);

    const handleShareComplete = useCallback(() => {
        setState('dashboard');
    }, []);

    // ==========================================================================
    // AUTH HANDLERS
    // ==========================================================================

    const handleAuthSuccess = useCallback(() => {
        setState('recording');
    }, []);

    const handleUpgrade = useCallback(() => {
        upgradeToPremium();
        setShowPaywall(false);
        if (!user) {
            setState('login');
        } else {
            setState('recording');
        }
    }, [upgradeToPremium, user]);

    // ==========================================================================
    // QUIZ HANDLERS
    // ==========================================================================

    const handleQuizComplete = useCallback((profile: CreatorProfile) => {
        completeQuiz(profile);
        setState('paywall');
    }, [completeQuiz]);

    // ==========================================================================
    // RECORDING HANDLERS
    // ==========================================================================

    const handleAudioCaptured = useCallback(async (blob: Blob) => {
        if (!isPremium && freeScriptsRemaining <= 0) {
            setShowPaywall(true);
            return;
        }

        setCapturedAudio(blob);
        setYoutubeLinks([]);
        setState('transcribing');

        try {
            const transcribedText = await transcribeAudio(blob);
            setTranscription(transcribedText);

            const { problem, solution } = await extractProblemSolution(transcribedText);
            setConfirmedProblem(problem);
            setConfirmedSolution(solution);

            setState('confirm');
        } catch (err: any) {
            console.error('Transcription error:', err);
            setError(err.message || 'Erro ao transcrever o áudio.');
            setState('error');
        }
    }, [isPremium, freeScriptsRemaining]);

    // ==========================================================================
    // CONFIRMATION HANDLERS
    // ==========================================================================

    const handleConfirmProblemSolution = useCallback((problem: string, solution: string) => {
        setConfirmedProblem(problem);
        setConfirmedSolution(solution);
        setState('remix');
    }, []);

    // ==========================================================================
    // REMIX HANDLERS
    // ==========================================================================

    const processScript = useCallback(async (links: string[]) => {
        if (!capturedAudio) return;

        setState('processing');
        setError(null);

        try {
            const result = await processAudioToScript(
                capturedAudio,
                links.length > 0 ? links : undefined
            );

            const viralScript: ViralScript = {
                hooks: result.script.hooks,
                selectedHookIndex: 0,
                conflito: result.script.conflito,
                climax: result.script.climax,
                solucao: result.script.solucao,
                cta: result.script.cta,
                metadata: {
                    duration: result.script.metadata.duration,
                    tone: result.script.metadata.tone,
                    platform: result.script.metadata.format
                }
            };

            const canCreate = useScript();
            if (!canCreate) {
                setShowPaywall(true);
                setState('dashboard');
                return;
            }

            saveScript(viralScript, creatorProfile?.niche);
            checkStreak();

            setScript(viralScript);
            setCapturedAudio(null);
            setState('result');
        } catch (err: any) {
            console.error('API Error:', err);
            setError(err.message || 'Algo deu errado. Tente novamente.');
            setState('error');
        }
    }, [capturedAudio, useScript, saveScript, creatorProfile, checkStreak]);

    const handleSkipRemix = useCallback(() => {
        processScript([]);
    }, [processScript]);

    const handleConfirmRemix = useCallback(() => {
        processScript(youtubeLinks);
    }, [processScript, youtubeLinks]);

    // ==========================================================================
    // RETURN
    // ==========================================================================

    return {
        // State
        state,
        script,
        error,
        capturedAudio,
        youtubeLinks,
        transcription,
        confirmedProblem,
        confirmedSolution,
        showPaywall,

        // Actions
        startFlow,
        handleStartRecording,
        handleReset,
        handleViewDashboard,
        handleShareComplete,
        handleAuthSuccess,
        handleUpgrade,
        setShowPaywall,
        handleQuizComplete,
        handleAudioCaptured,
        handleConfirmProblemSolution,
        handleSkipRemix,
        handleConfirmRemix,
        setYoutubeLinks,
        setState
    };
}
