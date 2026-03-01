import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
    text: string;
    delay?: number;
    speed?: number;
    onComplete?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    delay = 0,
    speed = 30,
    onComplete,
    className,
    style
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Reset state when text changes
        setDisplayedText('');
        setIsTyping(false);

        if (!text) return;

        let timeoutId: ReturnType<typeof setTimeout>;
        let intervalId: ReturnType<typeof setInterval>;

        // Initial delay
        timeoutId = setTimeout(() => {
            setIsTyping(true);
            let currentIndex = 1; // Start at 1 since we'll show text.substring(0, currentIndex)

            // Show first character immediately
            setDisplayedText(text.substring(0, 1));

            intervalId = setInterval(() => {
                currentIndex++;
                if (currentIndex <= text.length) {
                    setDisplayedText(text.substring(0, currentIndex));
                } else {
                    clearInterval(intervalId);
                    setIsTyping(false);
                    onComplete?.();
                }
            }, speed);

        }, delay);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [text, delay, speed, onComplete]);

    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {displayedText}
            {isTyping && (
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '1em',
                        background: 'currentColor',
                        marginLeft: '2px',
                        verticalAlign: 'text-bottom'
                    }}
                />
            )}
        </motion.div>
    );
};
