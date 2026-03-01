import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, TrendingUp, Users, Target, RefreshCw } from 'lucide-react';
import { useUser } from '../../shared/context/UserContext';
import { supabase } from '../../lib/supabase';

interface GrowthCardProps {
    onClose?: () => void;
}

export const GrowthCard: React.FC<GrowthCardProps> = ({ onClose }) => {
    const {
        fetchGoal,
        fetchLatestMetric,
        creatorProfile,
        user
    } = useUser() as any;

    const [isGenerating, setIsGenerating] = useState(false);
    const [timeframe, setTimeframe] = useState('30 dias'); // Just visual for now, or could calculate growth
    const [followerGoal, setFollowerGoal] = useState<any>(null);
    const [currentFollowers, setCurrentFollowers] = useState(0);
    const [followerGrowth, setFollowerGrowth] = useState(0); // This would need historical data to be real
    const [totalPostingDays, setTotalPostingDays] = useState(0); // Total unique days posted
    const cardRef = useRef<HTMLDivElement>(null);

    // Load data from DB
    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                return;
            }



            // 1. Get Goal
            const goal = await fetchGoal();
            if (goal) setFollowerGoal(goal);

            // 2. Get Latest Followers
            const latest = await fetchLatestMetric();
            if (latest) {
                setCurrentFollowers(latest.followers);
            }

            // 3. Get Total Posting Days (unique dates from frequency_scripts)
            try {
                const { data: postings, error } = await supabase
                    .from('frequency_scripts')
                    .select('posted_at')
                    .eq('user_id', user.id)
                    .not('posted_at', 'is', null)
                    .order('posted_at', { ascending: false });

                if (error) {
                    console.error('❌ [GrowthCard] Error fetching postings:', error);
                    return;
                }



                if (postings && postings.length > 0) {
                    // Count unique Brasilia dates
                    const uniqueDates = new Set<string>();
                    postings.forEach((p: any) => {
                        const brasiliaDate = new Date(p.posted_at).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                        uniqueDates.add(brasiliaDate);
                    });
                    const totalDays = uniqueDates.size;

                    setTotalPostingDays(totalDays);
                } else {
                    setTotalPostingDays(0);
                }
            } catch (error) {
                console.error('❌ [GrowthCard] Exception loading posting days:', error);
            }
        };
        loadData();
    }, [user?.id]); // Only depend on user.id to avoid infinite loops

    // Calculate stats
    const goalTarget = followerGoal?.target_followers || 10000;
    const goalProgress = Math.min((currentFollowers / goalTarget) * 100, 100);

    // Creator Emoji
    const creatorEmoji = creatorProfile?.creatorType === 'relampago' ? '⚡' :
        creatorProfile?.creatorType === 'viral' ? '🔥' :
            creatorProfile?.creatorType === 'estrategista' ? '🎯' : '💎';

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `hooky-crescimento.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate image', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const blob = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2, cacheBust: true })
                .then(dataUrl => fetch(dataUrl).then(res => res.blob()));

            if (navigator.share) {
                const file = new File([blob], 'hooky-crescimento.png', { type: 'image/png' });
                await navigator.share({
                    title: 'Meu Progresso no Hooky',
                    text: `🔥 ${totalPostingDays} dias postando! Minha meta: ${(goalTarget / 1000).toFixed(0)}k seguidores. Estou a ${goalProgress.toFixed(0)}% lá! 🚀`,
                    files: [file]
                });
            } else {
                handleDownload();
            }
        } catch (err) {
            console.error('Share failed', err);
            handleDownload();
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'white',
                    marginBottom: '0.5rem'
                }}>
                    Seu Crescimento {creatorEmoji}
                </h2>
                <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                    Compartilhe seu progresso e inspire outros criadores!
                </p>
            </div>

            {/* Timeframe Selector (Visual only for now) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {['Meta Atual'].map(t => (
                    <button
                        key={t}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: 'none',
                            background: 'var(--dark)',
                            color: 'white',
                            fontSize: '0.85rem',
                            cursor: 'default',
                            fontWeight: 600
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Card Preview */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                    ref={cardRef}
                    style={{
                        width: '320px',
                        aspectRatio: '9/16',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Background glow */}
                    <div style={{
                        position: 'absolute',
                        top: '-50px', right: '-50px',
                        width: '200px', height: '200px',
                        background: '#D4AF37',
                        filter: 'blur(100px)',
                        opacity: 0.2
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-50px', left: '-50px',
                        width: '200px', height: '200px',
                        background: '#FF6B6B',
                        filter: 'blur(100px)',
                        opacity: 0.15
                    }} />

                    {/* Content */}
                    <div style={{ zIndex: 10, padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.6 }}>HOOKY</div>
                            <div style={{ fontSize: '1.5rem' }}>{creatorEmoji}</div>
                        </div>

                        {/* Main Stats */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>

                            {/* Total Posting Days */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#FF6B6B', lineHeight: 1 }}>
                                    🔥 {totalPostingDays}
                                </div>
                                <div style={{ fontSize: '1rem', opacity: 0.7, marginTop: '0.5rem' }}>
                                    Dias postando
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginTop: '1rem'
                            }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <Users size={20} color="#D4AF37" style={{ marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentFollowers.toLocaleString('pt-BR')}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Seguidores</div>
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <Target size={20} color="#10B981" style={{ marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(goalTarget / 1000).toFixed(0)}K</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Meta Alvo</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.6, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Rumo à Meta</span>
                                    <span>{goalProgress.toFixed(0)}%</span>
                                </div>
                                <div style={{
                                    height: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${goalProgress}%`,
                                        height: '100%',
                                        background: goalProgress >= 100
                                            ? 'linear-gradient(90deg, #10B981, #34D399)'
                                            : 'linear-gradient(90deg, #D4AF37, #F5D28A)',
                                        borderRadius: '4px'
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            marginTop: 'auto',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                Criado com Hooky ✨
                            </div>
                            <TrendingUp size={16} color="#D4AF37" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: 600
                    }}
                >
                    {isGenerating ? <RefreshCw className="spin" size={18} /> : <Download size={18} />}
                    Baixar
                </button>
                <button
                    onClick={handleShare}
                    disabled={isGenerating}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'var(--dark)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: 600
                    }}
                >
                    {isGenerating ? <RefreshCw className="spin" size={18} /> : <Share2 size={18} />}
                    Compartilhar
                </button>
            </div>
        </div>
    );
};
