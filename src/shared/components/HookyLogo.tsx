import React from 'react';
import { motion } from 'framer-motion';

interface HookyLogoProps {
    size?: number;
    animate?: boolean;
}

export const HookyLogo: React.FC<HookyLogoProps> = ({ size = 56, animate = true }) => {
    // Each star has unique animation properties for premium feel
    const stars = [
        // Main big star (center)
        {
            x: 50, y: 50,
            scale: 1,
            rotationDuration: 12,
            scalePulseDuration: 3,
            scaleRange: [1, 1.08, 1],
            delay: 0
        },
        // Small star top-right
        {
            x: 78, y: 22,
            scale: 0.35,
            rotationDuration: 8,
            scalePulseDuration: 2,
            scaleRange: [1, 1.3, 1],
            delay: 0.5
        },
        // Small star bottom-left
        {
            x: 22, y: 75,
            scale: 0.25,
            rotationDuration: 6,
            scalePulseDuration: 1.8,
            scaleRange: [1, 1.4, 1],
            delay: 1
        },
        // Tiny star top-left
        {
            x: 28, y: 28,
            scale: 0.18,
            rotationDuration: 5,
            scalePulseDuration: 1.5,
            scaleRange: [1, 1.5, 1],
            delay: 0.3
        }
    ];

    // 4-point star path (sparkle shape)
    const starPath = `
        M 0 -10
        C 2 -2, 2 -2, 10 0
        C 2 2, 2 2, 0 10
        C -2 2, -2 2, -10 0
        C -2 -2, -2 -2, 0 -10
        Z
    `;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{ overflow: 'visible' }}
        >
            <defs>
                {/* Gradient for stars */}
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE66D" />
                    <stop offset="50%" stopColor="#FFD93D" />
                    <stop offset="100%" stopColor="#FFC107" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {stars.map((star, index) => (
                <motion.g
                    key={index}
                    style={{
                        originX: `${star.x}px`,
                        originY: `${star.y}px`,
                        transformOrigin: `${star.x}px ${star.y}px`
                    }}
                >
                    <motion.g
                        animate={animate ? {
                            rotate: 360,
                            scale: star.scaleRange
                        } : {}}
                        transition={animate ? {
                            rotate: {
                                duration: star.rotationDuration,
                                repeat: Infinity,
                                ease: "linear",
                                delay: star.delay
                            },
                            scale: {
                                duration: star.scalePulseDuration,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: star.delay
                            }
                        } : {}}
                        style={{
                            originX: `${star.x}px`,
                            originY: `${star.y}px`,
                            transformOrigin: `${star.x}px ${star.y}px`
                        }}
                    >
                        <motion.path
                            d={starPath}
                            fill="url(#starGradient)"
                            filter="url(#starGlow)"
                            transform={`translate(${star.x}, ${star.y}) scale(${star.scale * 2.5})`}
                            initial={animate ? { opacity: 0, scale: 0 } : {}}
                            animate={animate ? { opacity: 1, scale: 1 } : {}}
                            transition={{
                                delay: star.delay * 0.3,
                                duration: 0.5,
                                type: "spring",
                                stiffness: 200,
                                damping: 15
                            }}
                        />
                    </motion.g>
                </motion.g>
            ))}
        </svg>
    );
};
