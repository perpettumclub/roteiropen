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

        // Initial delay
        timeoutId = setTimeout(() => {
            setIsTyping(true);
            let currentIndex = 0;

            const typeInterval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(prev => prev + text.charAt(currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(typeInterval);
                    setIsTyping(false);
                    onComplete?.();
                }
            }, speed);

            // Clean up interval on unmount
            return () => clearInterval(typeInterval);

        }, delay);

        return () => clearTimeout(timeoutId);
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
