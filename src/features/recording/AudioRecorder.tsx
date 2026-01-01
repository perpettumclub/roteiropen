import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, RotateCcw, ArrowRight, Upload, FileAudio } from 'lucide-react';
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

    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // --- Drag & Drop Handlers ---
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Validate type
        if (!file.type.startsWith('audio/')) {
            alert('Por favor, envie apenas arquivos de áudio (.mp3, .wav, .m4a, etc).');
            return;
        }

        // Validate size (approx 25MB limit for ~5-10 mins high quality)
        if (file.size > 25 * 1024 * 1024) {
            alert('Arquivo muito grande. O limite é 25MB.');
            return;
        }

        // Send directly to processing
        onAudioCaptured(file);
    };

    return (
        <div
            className="audio-recorder"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
                // Drag visual feedback
                outline: isDragActive ? '4px dashed var(--primary)' : 'none',
                outlineOffset: '20px',
                borderRadius: '20px',
                transition: 'all 0.2s'
            }}
        >
            {/* Hidden Input for Click Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                style={{ display: 'none' }}
            />

            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: -20, left: -20, right: -20, bottom: -20,
                            background: 'rgba(255,255,255,0.9)',
                            zIndex: 100,
                            borderRadius: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            pointerEvents: 'none',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        <Upload size={48} color="var(--primary)" />
                        <h3 style={{ color: 'var(--dark)' }}>Solte seu áudio aqui!</h3>
                    </motion.div>
                )}
            </AnimatePresence>

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

                {/* Pulsing Glow */}
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
                        animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                                '0 10px 20px rgba(255,107,107,0.3)',
                                '0 15px 30px rgba(255,107,107,0.5)',
                                '0 10px 20px rgba(255,107,107,0.3)'
                            ]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
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
                    // Stop Button
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

            <div style={{
                marginTop: '2rem',
                color: 'var(--dark)',
                opacity: 0.6,
                fontSize: '1.1rem',
                fontWeight: 500,
                minHeight: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span>
                    {!isRecording && !audioBlob ? "Toque no microfone para comear" : ""}
                    {isRecording ? "Fale naturalmente..." : ""}
                    {audioBlob ? "Áudio capturado!" : ""}
                </span>

                {/* Upload Option - Only show when idle */}
                {!isRecording && !audioBlob && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1.05 }}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            background: 'rgba(255, 107, 107, 0.1)'
                        }}
                    >
                        <FileAudio size={16} /> ou envie um arquivo de áudio
                    </motion.button>
                )}
            </div>
        </div>
    );
};
