import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    stream: MediaStream | null;
    isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream, isRecording }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!stream || !isRecording || !canvasRef.current) return;

        // Init Audio Context
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const audioCtx = audioContextRef.current;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // Low FFT size for fewer, thicker bars (retro/chunky look)
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            if (!isRecording) return;

            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2; // Make bars wider
            let barHeight;

            // Gradient for bars
            const gradient = ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, '#FF6B6B');  // Primary (Red/Orange)
            gradient.addColorStop(1, '#FFD93D');  // Secondary (Yellow)

            // Centered visualization looks better
            // But let's stick to a simple mirrored or centered approach for "speech"
            // Let's do a symmetric visualization from center

            for (let i = 0; i < bufferLength; i++) {
                // Normalize height
                barHeight = (dataArray[i] / 255) * height * 0.8;
                if (barHeight < 4) barHeight = 4; // Min height cap

                ctx.fillStyle = gradient;

                // Draw mirrored from center

                // Left side
                ctx.fillStyle = gradient;
                // Simple version: just draw bars left to right but centered
                // Wait, bufferLength is 32 (fft 64 / 2). 
                // Let's just draw them evenly spaced.

                // Round rounded rects for polish
                // Canvas doesn't support roundRect easily in all browsers yet properly for bottom-anchored.
                // Just use rects with rounded corners logic or simple rects.

                // Drawing simple bars for now to ensure performance and compatibility.
                // We'll calculate x to center the whole cluster
                const totalWidth = bufferLength * (barWidth + 2);
                const startX = (width - totalWidth) / 2;

                const currentX = startX + (i * (barWidth + 2));

                // Draw rounded top bar
                // Check browser support for roundRect or fallback
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(currentX, height - barHeight, barWidth, barHeight, [5, 5, 0, 0]);
                } else {
                    ctx.fillRect(currentX, height - barHeight, barWidth, barHeight);
                }
                ctx.fill();
            }
        };

        draw();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (sourceRef.current) sourceRef.current.disconnect();
            // Do NOT close AudioContext here, re-use it or let it persist to avoid overhead
            // Actually usually good to close it if component unmounts heavily, but for this recorder flow it's fine.
        };
    }, [stream, isRecording]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={80}
            style={{
                width: '100%',
                maxWidth: '300px',
                height: '80px',
                opacity: isRecording ? 1 : 0,
                transition: 'opacity 0.3s ease'
            }}
        />
    );
};
