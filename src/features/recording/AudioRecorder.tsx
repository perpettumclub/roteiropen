
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, RotateCcw, ArrowRight } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { AudioVisualizer } from './AudioVisualizer';

interface AudioRecorderProps {
    onAudioCaptured: (blob: Blob) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioCaptured }) => {
    const {
        isRecording,
        recordingTime,
        audioBlob,
        mediaStream,
        startRecording,
        stopRecording,
        resetRecording
    } = useAudioRecorder();

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFinish = () => {
        if (audioBlob) {
            onAudioCaptured(audioBlob);
        }
    };

    return (
        <div className="audio-recorder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%' }}>

            {/* Timer Display */}
            <AnimatePresence mode="wait">
                {isRecording ? (
                    <motion.div
                        key="timer-recording"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="timer"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}
                    >
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '6rem',
                            color: 'var(--dark)',
                            fontVariantNumeric: 'tabular-nums',
                            lineHeight: 1,
                            textShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {formatTime(recordingTime)}
                        </div>

                        {/* Visualizer instead of "GRAVANDO" text */}
                        <div style={{ height: '80px', width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <AudioVisualizer stream={mediaStream} isRecording={isRecording} />
                        </div>
                    </motion.div>
                ) : (
                    // Show Placeholder or smaller timer when paused/done? Or just nothing/big timer
                    // PRD shows "00:45 / 02:00" in ASCII.
                    // For now, let's keep the big timer if we are in a 'paused' state (captured but not processed)?
                    // But here 'isRecording' is false AND audioBlob might be present.
                    // If audioBlob is present, we show controls.

                    audioBlob ? (
                        <motion.div
                            key="timer-done"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '4rem',
                                color: 'var(--dark)',
                                marginBottom: '3rem',
                                opacity: 0.5
                            }}
                        >
                            {formatTime(recordingTime)}
                        </motion.div>
                    ) : (
                        <div style={{ height: '100px' }}></div>
                    )
                )}
            </AnimatePresence>

            {/* Main Action Button */}
            <div className="controls" style={{ position: 'relative', zIndex: 10 }}>

                {/* Pulsing Glow (Optional - kept for background ambiance) */}
                {isRecording && (
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(255,107,107,0.2) 0%, rgba(255,107,107,0) 70%)',
                            zIndex: -1,
                            transform: 'translate(-50%, -50%)'
                        }}
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                )}

                {!isRecording && !audioBlob ? (
                    // Start Button
                    <motion.button
                        onClick={startRecording}
                        whileHover={{ scale: 1.1, filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'var(--gradient-btn)',
                            border: '4px solid rgba(255,255,255,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-colored)',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <Mic size={48} color="white" />
                    </motion.button>
                ) : isRecording ? (
                    // Stop Button - CSS-based square stop icon
                    <motion.button
                        onClick={stopRecording}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.9)',
                            border: '4px solid rgba(255,107,107,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(255,107,107,0.25)',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        {/* Stop square icon */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
                        }} />
                    </motion.button>
                ) : (
                    // Review Controls
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <motion.button
                            onClick={resetRecording}
                            whileHover={{ scale: 1.1, rotate: -10, background: 'rgba(255,255,255,1)' }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--dark)',
                                backdropFilter: 'blur(4px)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <RotateCcw size={24} />
                        </motion.button>

                        <motion.button
                            onClick={handleFinish}
                            whileHover={{ scale: 1.05, x: 5, boxShadow: '0 15px 30px -5px rgba(0, 184, 148, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '1rem 2.5rem',
                                borderRadius: '3rem',
                                background: 'var(--success)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                boxShadow: '0 10px 20px -5px rgba(0, 184, 148, 0.3)',
                                letterSpacing: '0.02em'
                            }}
                        >
                            Criar Roteiro <ArrowRight size={24} />
                        </motion.button>
                    </div>
                )}
            </div>

            <p style={{
                marginTop: '2rem',
                color: 'var(--dark)',
                opacity: 0.6,
                fontSize: '1.1rem',
                fontWeight: 500,
                minHeight: '1.5rem' // Prevent layout jump
            }}>
                {!isRecording && !audioBlob ? "Toque no microfone para começar" : ""}
                {isRecording ? "Fale naturalmente..." : ""}
                {audioBlob ? "Áudio capturado!" : ""}
            </p>
        </div>
    );
};
