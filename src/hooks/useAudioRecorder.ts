import { useState, useRef, useEffect } from 'react';

export interface AudioRecorderState {
    isRecording: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    error: string | null;
}

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<number | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMediaStream(stream);

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                chunksRef.current = [];
                stream.getTracks().forEach(track => track.stop());
                setMediaStream(null);
            };

            mediaRecorder.start(100);
            setIsRecording(true);
            setError(null);
            setRecordingTime(0);

            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err: any) {
            setError(err.message || 'Error accessing microphone');
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const resetRecording = () => {
        setAudioBlob(null);
        setRecordingTime(0);
        setError(null);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return {
        isRecording,
        recordingTime,
        audioBlob,
        error,
        mediaStream,
        startRecording,
        stopRecording,
        resetRecording
    };
};
