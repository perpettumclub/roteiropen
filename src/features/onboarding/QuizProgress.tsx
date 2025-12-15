/**
 * Quiz Progress Component
 * 
 * Displays the progress bar and back button for the quiz funnel.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface QuizProgressProps {
    progress: number;
    currentIndex: number;
    isLoading: boolean;
    onBack: () => void;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
    progress,
    currentIndex,
    isLoading,
    onBack
}) => {
    return (
        <div style={{ marginBottom: '3rem', position: 'relative', paddingTop: '0.5rem' }}>
            {/* Back button */}
            {currentIndex > 0 && !isLoading && (
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex'
                    }}
                >
                    <ChevronLeft size={24} color="var(--dark)" />
                </motion.button>
            )}

            {/* Progress bar */}
            <div style={{
                maxWidth: '320px',
                margin: '0 auto',
                height: '6px',
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                        borderRadius: '3px'
                    }}
                />
            </div>
        </div>
    );
};
