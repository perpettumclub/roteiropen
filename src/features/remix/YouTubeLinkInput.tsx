import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, X, Plus, Link } from 'lucide-react';

interface YouTubeLinkInputProps {
    links: string[];
    onLinksChange: (links: string[]) => void;
    maxLinks?: number;
}

// Extract video ID from various YouTube URL formats
const extractVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// Validate YouTube URL
const isValidYouTubeUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
};

export const YouTubeLinkInput: React.FC<YouTubeLinkInputProps> = ({
    links,
    onLinksChange,
    maxLinks = 3
}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAddLink = () => {
        const url = inputValue.trim();

        if (!url) {
            setError('Cole um link do YouTube');
            return;
        }

        if (!isValidYouTubeUrl(url)) {
            setError('Link inválido. Use um link do YouTube.');
            return;
        }

        if (links.includes(url)) {
            setError('Este vídeo já foi adicionado');
            return;
        }

        if (links.length >= maxLinks) {
            setError(`Máximo de ${maxLinks} vídeos`);
            return;
        }

        onLinksChange([...links, url]);
        setInputValue('');
        setError(null);
    };

    const handleRemoveLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        onLinksChange(newLinks);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddLink();
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (isValidYouTubeUrl(text)) {
                setInputValue(text);
                setError(null);
            }
        } catch {
            // Clipboard access denied
        }
    };

    return (
        <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.05)',
            backdropFilter: 'blur(10px)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
            }}>
                <Youtube size={20} color="#FF0000" />
                <span style={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--dark)'
                }}>
                    Remixar com vídeos virais
                </span>
                <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--gray)',
                    marginLeft: 'auto'
                }}>
                    {links.length}/{maxLinks}
                </span>
            </div>

            {/* Description */}
            <p style={{
                fontSize: '0.85rem',
                color: 'var(--gray)',
                marginBottom: '1rem',
                lineHeight: 1.4
            }}>
                Cole links de vídeos virais para a IA analisar e combinar com sua ideia
            </p>

            {/* Input */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: error ? '0.5rem' : '0'
            }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    border: error ? '2px solid #EF4444' : '2px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    padding: '0.5rem 0.75rem',
                    gap: '0.5rem'
                }}>
                    <Link size={16} color="var(--gray)" />
                    <input
                        type="text"
                        placeholder="Cole link do YouTube..."
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={handlePaste}
                        disabled={links.length >= maxLinks}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.9rem',
                            background: 'transparent',
                            fontFamily: 'var(--font-body)'
                        }}
                    />
                </div>

                <motion.button
                    onClick={handleAddLink}
                    disabled={links.length >= maxLinks}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: links.length >= maxLinks ? 'rgba(0,0,0,0.1)' : 'var(--dark)',
                        border: 'none',
                        cursor: links.length >= maxLinks ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}
                >
                    <Plus size={20} />
                </motion.button>
            </div>

            {/* Error message */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        fontSize: '0.8rem',
                        color: '#EF4444',
                        marginBottom: '0.75rem'
                    }}
                >
                    {error}
                </motion.p>
            )}

            {/* Added Links */}
            <AnimatePresence>
                {links.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            marginTop: '1rem'
                        }}
                    >
                        {links.map((link, index) => {
                            const videoId = extractVideoId(link);
                            return (
                                <motion.div
                                    key={link}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.5rem',
                                        background: 'white',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <img
                                        src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                        alt="Thumbnail"
                                        style={{
                                            width: '48px',
                                            height: '36px',
                                            borderRadius: '6px',
                                            objectFit: 'cover'
                                        }}
                                    />

                                    {/* Video ID */}
                                    <span style={{
                                        flex: 1,
                                        fontSize: '0.85rem',
                                        color: 'var(--dark)',
                                        fontFamily: 'var(--font-mono)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {videoId}
                                    </span>

                                    {/* Remove button */}
                                    <motion.button
                                        onClick={() => handleRemoveLink(index)}
                                        whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.1)' }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#EF4444'
                                        }}
                                    >
                                        <X size={16} />
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { extractVideoId, isValidYouTubeUrl };
