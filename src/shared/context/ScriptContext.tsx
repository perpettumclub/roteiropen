import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { ViralScript } from '../../types';
import {
    transcribeAudio,
    extractProblemSolution,
    processAudioToScript,
} from '..'; // Import from shared index
import { useUser } from './UserContext';

interface ScriptState {
    capturedAudio: Blob | null;
    transcription: string;
    confirmedProblem: string;
    confirmedSolution: string;
    youtubeLinks: string[];
    script: ViralScript | null;
    isProcessing: boolean;
    isTranscribing: boolean;
    error: string | null;
}

interface ScriptContextType extends ScriptState {
    // Actions
    setCapturedAudio: (blob: Blob) => void;
    startTranscription: () => Promise<void>;
    confirmProblemSolution: (problem: string, solution: string) => void;
    setYoutubeLinks: (links: string[]) => void;
    generateScript: (skipRemix?: boolean) => Promise<boolean>; // Returns success/fail
    resetScript: () => void;
    setError: (error: string | null) => void;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const ScriptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { useScript: consumeCredit, saveScript, checkStreak, creatorProfile } = useUser();

    // State mirroring App.tsx
    const [capturedAudio, setCapturedAudioState] = useState<Blob | null>(null);
    const [transcription, setTranscription] = useState<string>('');
    const [confirmedProblem, setConfirmedProblem] = useState<string>('');
    const [confirmedSolution, setConfirmedSolution] = useState<string>('');
    const [youtubeLinks, setYoutubeLinksState] = useState<string[]>([]);
    const [script, setScript] = useState<ViralScript | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Loading states
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const setCapturedAudio = (blob: Blob) => {
        setCapturedAudioState(blob);
        // Reset downstream state when new audio is captured
        setTranscription('');
        setConfirmedProblem('');
        setConfirmedSolution('');
        setYoutubeLinksState([]);
        setScript(null);
        setError(null);
    };

    const startTranscription = async () => {
        if (!capturedAudio) return;

        setIsTranscribing(true);
        setError(null);

        try {
            // Transcribe audio
            const transcribedText = await transcribeAudio(capturedAudio);
            setTranscription(transcribedText);

            // Extract problem and solution
            const { problem, solution } = await extractProblemSolution(transcribedText);
            setConfirmedProblem(problem);
            setConfirmedSolution(solution);
        } catch (err: any) { // any: API/transcription errors not typed as Error
            console.error('Transcription error:', err);
            setError(err.message || 'Erro ao transcrever o áudio.');
            throw err; // Re-throw to allow UI to handle navigation if needed
        } finally {
            setIsTranscribing(false);
        }
    };

    const confirmProblemSolution = (problem: string, solution: string) => {
        setConfirmedProblem(problem);
        setConfirmedSolution(solution);
    };

    const setYoutubeLinks = (links: string[]) => {
        setYoutubeLinksState(links);
    };

    const generateScript = async (skipRemix: boolean = false): Promise<boolean> => {
        if (!capturedAudio) return false;

        setIsProcessing(true);
        setError(null);

        try {
            // If skipping remix, force empty links
            const linksToUse = skipRemix ? [] : youtubeLinks;

            const result = await processAudioToScript(capturedAudio, linksToUse.length > 0 ? linksToUse : undefined);

            // Transform API response to ViralScript format
            // (Copied strictly from App.tsx logic)
            const viralScript: ViralScript = {
                hooks: result.script.hooks,
                selectedHookIndex: 0,
                contexto: result.script.conflito,
                conceito: result.script.climax,
                ruptura: result.script.storytelling || '',
                plano: result.script.solucao,
                cta: result.script.cta,
                metadata: {
                    duration: result.script.metadata.duration,
                    tone: result.script.metadata.tone,
                    platform: result.script.metadata.format
                }
            };

            // Consume one free script
            const canCreate = consumeCredit();
            if (!canCreate) {
                // UI should handle the paywall redirect based on return value
                setIsProcessing(false);
                return false;
            }

            // Save script to library
            saveScript(viralScript, creatorProfile?.niche);

            // Update streak
            checkStreak();

            setScript(viralScript);
            // Clean up audio after successful generation to save memory? 
            // App.tsx did setCapturedAudio(null) here, but we might want to keep it if user goes "back".
            // For now, let's keep strict parity with App.tsx behavior.
            setCapturedAudioState(null);

            return true;
        } catch (err: any) { // any: API/transcription errors not typed as Error
            console.error('API Error:', err);
            setError(err.message || 'Algo deu errado. Tente novamente.');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const resetScript = () => {
        setScript(null);
        setError(null);
        setCapturedAudioState(null);
        setYoutubeLinksState([]);
        setTranscription('');
        setConfirmedProblem('');
        setConfirmedSolution('');
    };

    return (
        <ScriptContext.Provider value={{
            // State
            capturedAudio,
            transcription,
            confirmedProblem,
            confirmedSolution,
            youtubeLinks,
            script,
            isProcessing,
            isTranscribing,
            error,
            // Actions
            setCapturedAudio,
            startTranscription,
            confirmProblemSolution,
            setYoutubeLinks,
            generateScript,
            resetScript,
            setError
        }}>
            {children}
        </ScriptContext.Provider>
    );
};

export const useScriptContext = (): ScriptContextType => {
    const context = useContext(ScriptContext);
    if (!context) {
        throw new Error('useScriptContext must be used within a ScriptProvider');
    }
    return context;
};
