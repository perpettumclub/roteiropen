import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Gift } from 'lucide-react';

interface ReferralCardProps {
    compact?: boolean;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ compact = false }) => {
    const [copied, setCopied] = useState(false);
    const [referralCode, setReferralCode] = useState('');

    useEffect(() => {
        // Generate or retrieve referral code
        let code = localStorage.getItem('hooky_referral_code');
        if (!code) {
            code = 'RP' + Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('hooky_referral_code', code);
        }
        setReferralCode(code);
    }, []);

    const referralLink = `https://hookr.ai?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Hooky - Roteiros Virais com IA',
                    text: 'Descubra como criar roteiros virais em segundos! Use meu código: ' + referralCode,
                    url: referralLink
                });
            } catch (err) {
                handleCopy();
            }
        } else {
            handleCopy();
        }
    };

    if (compact) {
        return (
            <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,107,107,0.05) 100%)',
                    border: '1px solid rgba(255,107,107,0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--primary)'
                }}
            >
                <Gift size={16} />
                Convide amigos
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(255,107,107,0.03) 100%)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1px solid rgba(255,107,107,0.15)'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
            }}>
                <Gift size={20} color="var(--primary)" />
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Convide Amigos
                </span>
            </div>

            <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--dark)',
                marginBottom: '0.5rem'
            }}>
                Indique e ganhe benefícios
            </h3>

            <p style={{
                fontSize: '0.9rem',
                color: 'var(--gray)',
                marginBottom: '1rem',
                lineHeight: 1.5
            }}>
                Compartilhe seu link e ajude outros criadores a viralizarem
            </p>

            {/* Referral Link */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem'
            }}>
                <div style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    fontSize: '0.85rem',
                    color: 'var(--gray)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {referralLink}
                </div>
                <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '0.75rem',
                        background: copied ? '#27ae60' : 'var(--dark)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                </motion.button>
            </div>

            {/* Share Button */}
            <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                <Share2 size={18} />
                Compartilhar
            </motion.button>

            {/* Referral Code */}
            <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--gray)'
            }}>
                Seu código: <strong style={{ color: 'var(--primary)' }}>{referralCode}</strong>
            </div>
        </motion.div>
    );
};
