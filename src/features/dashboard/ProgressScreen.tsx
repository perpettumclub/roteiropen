import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, BarChart3, Plus, Flame, Target, ArrowLeft, Upload, X, Loader2, Calendar } from 'lucide-react';
import { analyzeProfileImage } from '../../shared';
import { useUser } from '../../shared/context/UserContext';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';
import { DateRangePicker } from '../../shared/components/DateRangePicker';
import { GoalSettingModal } from '../../shared/components/GoalSettingModal';
import { LevelUpModal } from '../../shared/components/LevelUpModal';
import { getNextTier } from '../../shared/utils/goalUtils';
import { sendUploadConfirmation, checkGoalProximityAndNotify } from '../../shared/services/emailService';
import { MILLISECONDS_PER_DAY } from '../../shared/constants';

interface MetricEntry {
    date: string;
    followers: number;
    seguidores?: number;
    seguindo?: number;
    posts?: number;

    // Insights fields
    contas_alcancadas?: number;
    contas_com_engajamento?: number;
    impressoes?: number;
    interacoes?: number;
    cliques_site?: number;
    visitas_perfil?: number;
    saves?: number;
    shares?: number;
    likes_periodo?: number;
    comentarios_periodo?: number;
    engajamento_percent?: number;

    // Legacy
    avgLikes: number;
    avgComments: number;
}

interface Screenshot {
    id: string;
    type: 'profile' | 'insights';
    imageData: string;
    date: string;
}

interface ProgressScreenProps {
    onBack: () => void;
}

const STORAGE_KEY = 'hooky_progress_data';
const SCREENSHOTS_KEY = 'hooky_screenshots';

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ onBack }) => {
    const { fetchMetrics, saveMetric, fetchGoal, saveGoal, user, growthGoal, checkProgressBadges, fetchGoalHistory, badges } = useUser() as any; // Cast for new methods

    const [metrics, setMetrics] = useState<MetricEntry[]>([]);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);

    const [pendingProfile, setPendingProfile] = useState<File | null>(null);
    const [pendingInsights, setPendingInsights] = useState<File | null>(null);
    const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
    const [insightsPreviewUrl, setInsightsPreviewUrl] = useState<string | null>(null);

    // Goal History State for timeline
    const [goalHistory, setGoalHistory] = useState<any[]>([]);

    // Date Range State
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());

    // Form state
    const [newFollowers, setNewFollowers] = useState('');
    const [newLikes, setNewLikes] = useState('');
    const [newComments, setNewComments] = useState('');

    // Level Up State
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [nextTierGoal, setNextTierGoal] = useState(0);

    const handleAcceptNextLevel = async () => {
        if (!nextTierGoal) return;

        try {
            await saveGoal({
                target_followers: nextTierGoal,

                target_date: growthGoal?.targetDate ? new Date(growthGoal.targetDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                notification_weekly: growthGoal?.notificationWeekly ?? true,
                notification_monthly: growthGoal?.notificationMonthly ?? true
            });
            setShowLevelUp(false);
            await loadGoal(); // Refresh
            alert('Nova meta definida! Vamos com tudo! 🚀');
        } catch (error) {
            console.error('Failed to update goal:', error);
        }
    };

    // AI Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const profileInputRef = useRef<HTMLInputElement>(null);
    const insightsInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (user?.id) {
            loadMetrics();
            loadGoal();
            loadScreenshots(); // New
            loadGoalHistory(); // Load goal history timeline
        }
    }, [user, startDate, endDate]);

    const loadGoal = async () => {
        await fetchGoal();
    };

    const loadGoalHistory = async () => {
        const history = await fetchGoalHistory();
        setGoalHistory(history || []);
    };

    const loadMetrics = async () => {
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        const data = await fetchMetrics(user.id, startStr, endStr);


        const mapped = data.map((m: any) => ({
            date: m.date,
            followers: m.followers || m.seguidores || 0,
            seguidores: m.seguidores || m.followers,
            seguindo: m.seguindo,
            posts: m.posts,

            // Insights fields from OCR
            contas_alcancadas: m.contas_alcancadas,
            contas_com_engajamento: m.contas_com_engajamento,
            impressoes: m.impressoes,
            interacoes: m.interacoes,
            cliques_site: m.cliques_site,
            visitas_perfil: m.visitas_perfil,
            saves: m.saves,
            shares: m.shares,
            likes_periodo: m.likes_periodo,
            comentarios_periodo: m.comentarios_periodo,
            engajamento_percent: m.engajamento_percent,

            // Legacy
            avgLikes: m.avg_likes || m.likes_periodo || 0,
            avgComments: m.avg_comments || m.comentarios_periodo || 0
        }));
        setMetrics(mapped);


        if (mapped.length > 0 && growthGoal?.targetFollowers) {
            const current = mapped[mapped.length - 1].followers;
            if (current >= growthGoal.targetFollowers) {
                const next = getNextTier(current);
                // Only show if the next tier is appreciably higher than current target (prevent spam)
                if (next > growthGoal.targetFollowers) {
                    setNextTierGoal(next);
                    setShowLevelUp(true);
                }
            }
        }
    };


    const loadScreenshots = async () => {
        try {
            const { data, error } = await supabase
                .from('user_screenshots')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped = data.map((s: any) => ({
                    id: s.id,
                    type: s.type,
                    imageData: s.image_url, // Using URL now
                    date: s.captured_at
                }));
                setScreenshots(mapped);
            }
        } catch (error) {
            console.error('Error loading screenshots:', error);
        }
    };

    const deleteScreenshot = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic update
        const previous = [...screenshots];
        setScreenshots(prev => prev.filter(s => s.id !== id));

        try {
            // Get path to delete from storage
            const { data: meta } = await supabase.from('user_screenshots').select('image_path').eq('id', id).single();

            if (meta?.image_path) {
                await supabase.storage.from('progress-photos').remove([meta.image_path]);
            }

            await supabase.from('user_screenshots').delete().eq('id', id);
        } catch (error) {
            console.error('Error deleting screenshot:', error);
            setScreenshots(previous); // Revert
        }
    };


    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'insights') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        if (type === 'profile') {
            setPendingProfile(file);
            setProfilePreviewUrl(url);
        } else {
            setPendingInsights(file);
            setInsightsPreviewUrl(url);
        }
    };

    const processSingleImage = async (file: File, type: 'profile' | 'insights') => {
        if (!user?.id) throw new Error('User not found');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${type}.${fileExt}`;

        // 1. Upload
        const { error: uploadError } = await supabase.storage
            .from('progress-photos')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Get URL
        const { data: { publicUrl } } = supabase.storage
            .from('progress-photos')
            .getPublicUrl(fileName);

        // 3. Save DB Record
        const { data: metaData } = await supabase
            .from('user_screenshots')
            .insert({
                user_id: user.id,
                image_url: publicUrl,
                image_path: fileName,
                type,
                captured_at: new Date().toISOString()
            })
            .select()
            .single();

        // 4. Update Gallery State
        if (metaData) {
            setScreenshots(prev => [{
                id: metaData.id,
                type: metaData.type as 'profile' | 'insights',
                imageData: metaData.image_url,
                date: metaData.captured_at
            }, ...prev]);
        }

        // 5. Build Base64 for AI
        const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });


        const metrics = await analyzeProfileImage(base64);

        return { type, metrics };
    };

    const processImages = async () => {
        if (!pendingProfile && !pendingInsights) return;

        setIsAnalyzing(true);

        try {
            let extractedData: any = {};
            const uploads = [];


            if (pendingProfile) {
                uploads.push(processSingleImage(pendingProfile, 'profile'));
            }


            if (pendingInsights) {
                uploads.push(processSingleImage(pendingInsights, 'insights'));
            }

            const results = await Promise.all(uploads);

            // Merge results from both images

            results.forEach(res => {

                if (res.metrics) {
                    extractedData = { ...extractedData, ...res.metrics };
                }
            });


            // === AUTO-SAVE TO SUPABASE ===

            const today = new Date().toLocaleDateString('en-CA');
            const entry = {
                // Profile fields
                followers: extractedData.seguidores || extractedData.followers || 0,
                seguidores: extractedData.seguidores || extractedData.followers,
                seguindo: extractedData.seguindo,
                posts: extractedData.posts,

                // Insights fields (from OCR - NO MANUAL INPUT!)
                contas_alcancadas: extractedData.contas_alcancadas,
                contas_com_engajamento: extractedData.contas_com_engajamento,
                impressoes: extractedData.impressoes,
                interacoes: extractedData.interacoes,
                cliques_site: extractedData.cliques_site,
                cliques_email: extractedData.cliques_email,
                visitas_perfil: extractedData.visitas_perfil,
                saves: extractedData.saves,
                shares: extractedData.shares,
                likes_periodo: extractedData.likes_periodo,
                comentarios_periodo: extractedData.comentarios_periodo,
                engajamento_percent: extractedData.engajamento_percent,

                // Legacy (for backwards compat)
                avg_likes: extractedData.avgLikes || extractedData.likes_periodo,
                avg_comments: extractedData.avgComments || extractedData.comentarios_periodo,

                date: today
            };



            const saved = await saveMetric(entry);
            if (!saved) throw new Error('Save returned null');




            await loadMetrics();
            await loadGoal();

            // === CHECK AND AWARD BADGES ===
            // Check for follower milestone badges
            if (checkProgressBadges) {
                await checkProgressBadges(
                    entry.followers,
                    growthGoal?.targetFollowers
                );
            }

            // === SEND EMAIL NOTIFICATIONS ===
            // (Fire and forget - don't block UI)
            if (user?.id) {
                // 1. Upload confirmation email
                sendUploadConfirmation(user.id, {
                    seguidores: entry.followers,
                    engajamento: entry.engajamento_percent,
                    meta: growthGoal?.targetFollowers
                }).catch(console.error);

                // 2. Check goal proximity and notify
                checkGoalProximityAndNotify(
                    user.id,
                    entry.followers,
                    growthGoal?.targetFollowers
                ).catch(console.error);
            }


            setPendingProfile(null);
            setPendingInsights(null);
            setProfilePreviewUrl(null);
            setInsightsPreviewUrl(null);


            setShowUploadModal(false);
            alert('✅ Dashboard atualizado com sucesso! Dados salvos permanentemente.');

        } catch (error) {
            console.error('Batch processing failed:', error);
            alert('Erro ao processar imagens. Tente novamente.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'insights') => {
        const file = event.target.files?.[0];
        if (!file || !user?.id) return;

        setIsAnalyzing(true);

        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('progress-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;


            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('progress-photos')
                .getPublicUrl(filePath);

            // Preview is already handled by profilePreviewUrl/insightsPreviewUrl state


            // 3. Save Metadata
            const { data: metaData, error: dbError } = await supabase
                .from('user_screenshots')
                .insert({
                    user_id: user.id,
                    image_url: publicUrl,
                    image_path: filePath,
                    type,
                    captured_at: new Date().toISOString()
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // 4. Update UI
            if (metaData) {
                const newScreenshot: Screenshot = {
                    id: metaData.id,
                    type: metaData.type as 'profile' | 'insights',
                    imageData: metaData.image_url,
                    date: metaData.captured_at
                };
                setScreenshots(prev => [newScreenshot, ...prev]);
            }

            // 5. Analyze with AI (keeping existing logic but using URL/Base64 if needed)
            // For analysis we might still need base64 or pass URL if API supports it.
            // Let's assume we read file to base64 just for analysis like before
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                try {
                    const metrics = await analyzeProfileImage(base64String);
                    if (metrics.followers) setNewFollowers(metrics.followers.toString());
                    if (metrics.avgLikes) setNewLikes(metrics.avgLikes.toString());
                    if (metrics.avgComments) setNewComments(metrics.avgComments.toString());
                } catch (e) {
                    console.error('Analysis failed', e);
                }
                setShowUploadModal(false);
                setShowAddModal(true);
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Failed to upload/analyze image:', error);
            setIsAnalyzing(false);
            setShowUploadModal(false);
        }
    };

    const handleAddEntry = async () => {
        if (!newFollowers) {
            alert('Por favor, preencha o número de seguidores.');
            return;
        }

        // Use local date (YYYY-MM-DD) to ensure it matches the user's current day
        const today = new Date().toLocaleDateString('en-CA');

        const entry = {
            followers: parseInt(newFollowers) || 0,
            avg_likes: parseInt(newLikes) || 0,
            avg_comments: parseInt(newComments) || 0,
            date: today
        };



        try {

            const saved = await saveMetric(entry);
            if (!saved) throw new Error('Save returned null');




            await loadMetrics();
            await loadGoal(); // Refresh goal status too


            setShowAddModal(false);
            setNewFollowers('');
            setNewLikes('');
            setNewComments('');

            // Allow time for state to update
            setTimeout(() => {
                alert('Métricas salvas com sucesso!');
            }, 100);

        } catch (error) {
            console.error('Failed to save metrics:', error);
            alert('Erro ao salvar métricas. Tente novamente.');
        }
    };


    const latestEntry = metrics[metrics.length - 1];
    const previousEntry = metrics[metrics.length - 2];
    const firstEntry = metrics[0];

    // Growth since Day 1 (User request: "growth from first day to now")
    const followerGrowth = latestEntry && firstEntry
        ? latestEntry.followers - firstEntry.followers
        : 0;

    // Engagement rate from OCR Insights (NOT manual calculation!)
    // Priority: engajamento_percent from OCR > fallback calculation
    const engagementRate = latestEntry?.engajamento_percent != null
        ? latestEntry.engajamento_percent.toFixed(2)
        : (latestEntry && latestEntry.contas_alcancadas && latestEntry.interacoes)
            ? ((latestEntry.interacoes / latestEntry.contas_alcancadas) * 100).toFixed(2)
            : (latestEntry && latestEntry.followers > 0)
                ? ((latestEntry.avgLikes + latestEntry.avgComments) / latestEntry.followers * 100).toFixed(2)
                : '0';

    // Engagement trend indicator (compare with previous entry)
    const previousEngagement = previousEntry?.engajamento_percent ?? null;
    const engagementTrend = latestEntry?.engajamento_percent != null && previousEngagement != null
        ? (latestEntry.engajamento_percent > previousEngagement ? '📈' : latestEntry.engajamento_percent < previousEngagement ? '📉' : '')
        : '';


    const streak = metrics.length; // Simplified

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                width: '100%',
                maxWidth: '650px', // FIX: Match Library width
                padding: '1rem',
                margin: '0 auto'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        background: 'rgba(255,255,255,0.5)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <div style={{ flex: 1 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.8rem',
                        color: 'var(--dark)',
                        margin: 0
                    }}>
                        Progresso
                    </h1>
                </div>
                {/* Date Picker Widget */}
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                />
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {/* Followers Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Seguidores</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {latestEntry?.followers.toLocaleString('pt-BR') || '—'}
                    </div>
                    {followerGrowth !== 0 && (
                        <div style={{
                            fontSize: '0.8rem',
                            color: followerGrowth > 0 ? '#10b981' : '#ef4444',
                            fontWeight: 600
                        }}>
                            {followerGrowth > 0 ? '+' : ''}{followerGrowth.toLocaleString('pt-BR')}
                        </div>
                    )}
                </motion.div>

                {/* Streak Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Flame size={18} color="var(--secondary)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Registros</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {streak} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>entradas</span>
                    </div>
                </motion.div>

                {/* Engagement Card */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Heart size={18} color="#ec4899" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Engajamento</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {engagementRate}% {engagementTrend && <span style={{ fontSize: '1.2rem' }}>{engagementTrend}</span>}
                    </div>
                    {!latestEntry?.engajamento_percent && latestEntry?.followers ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                            Envie print de Insights para dados reais
                        </div>
                    ) : null}
                </motion.div>

                {/* Goal Card - Enhanced with Progress Bar + Countdown */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowGoalModal(true)}
                    whileHover={{ scale: 1.02 }}
                    style={{
                        padding: '1.25rem',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Target size={18} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Meta</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {growthGoal?.targetFollowers ? (growthGoal.targetFollowers / 1000).toFixed(1) + 'K' : 'Definir'}
                    </div>

                    {/* Progress Bar */}
                    {growthGoal?.targetFollowers && latestEntry && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: '6px',
                                background: 'rgba(0,0,0,0.1)',
                                borderRadius: '3px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min((latestEntry.followers / growthGoal.targetFollowers) * 100, 100)}%`,
                                    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                                    borderRadius: '3px',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--gray)' }}>
                                    {Math.min(Math.round((latestEntry.followers / growthGoal.targetFollowers) * 100), 100)}%
                                </span>
                                {/* Countdown to target date */}
                                {growthGoal.targetDate && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>
                                        {(() => {
                                            const now = new Date();
                                            const target = new Date(growthGoal.targetDate);
                                            const diff = Math.ceil((target.getTime() - now.getTime()) / MILLISECONDS_PER_DAY);
                                            if (diff < 0) return '⏰ Prazo expirado';
                                            if (diff === 0) return '🎯 Hoje!';
                                            if (diff === 1) return '⚡ Amanhã!';
                                            return `📅 ${diff} dias`;
                                        })()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Faltam X para meta */}
                    {growthGoal?.targetFollowers && latestEntry && latestEntry.followers < growthGoal.targetFollowers && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray)', marginTop: '0.3rem' }}>
                            Faltam <strong>{(growthGoal.targetFollowers - latestEntry.followers).toLocaleString('pt-BR')}</strong> seguidores
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Chart Section (Recharts AreaChart) */}
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    marginBottom: '1.5rem',
                    minHeight: '350px',
                    background: 'white'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Crescimento</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: Number(followerGrowth) >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {Number(followerGrowth) > 0 ? '+' : ''}{followerGrowth} seguidores (total)
                    </div>
                </div>

                {metrics.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={metrics}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(d) => {
                                        if (!d) return '';
                                        const parts = d.split('-');
                                        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
                                    }}
                                    tick={{ fontSize: 12, fill: '#888' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                    padding={{ left: 20, right: isMobile ? 200 : 425 }}
                                />
                                <YAxis
                                    hide={false}
                                    tick={{ fontSize: 12, fill: '#888' }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={['dataMin - 100', 'dataMax + 100']}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(d) => d ? new Date(d).toLocaleDateString('pt-BR') : ''}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="followers"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorFollowers)"
                                    dot={{ r: 5, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 7, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--gray)',
                        fontSize: '0.9rem'
                    }}>
                        Adicione seu primeiro registro para ver o gráfico de evolução
                    </div>
                )}
            </motion.div>

            {/* Goal History Timeline */}
            {goalHistory.length > 0 && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1.5rem',
                        borderRadius: '24px'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        <span style={{ fontSize: '1.3rem' }}>🏆</span>
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'var(--dark)'
                        }}>
                            Histórico de Metas Batidas
                        </span>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        position: 'relative'
                    }}>
                        {/* Timeline Line */}
                        <div style={{
                            position: 'absolute',
                            left: '15px',
                            top: '20px',
                            bottom: '20px',
                            width: '2px',
                            background: 'linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%)',
                            borderRadius: '2px'
                        }} />

                        {goalHistory.map((goal: any, index: number) => {
                            const achievedDate = new Date(goal.achieved_at);
                            const formattedDate = achievedDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            });

                            // Determine trophy color based on milestone
                            const getTrophyColor = (followers: number) => {
                                if (followers >= 100000) return '#FFD700'; // Gold
                                if (followers >= 50000) return '#C0C0C0'; // Silver
                                if (followers >= 10000) return '#CD7F32'; // Bronze
                                return 'var(--primary)';
                            };

                            return (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1rem',
                                        paddingLeft: '2rem',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Timeline Dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '8px',
                                        top: '4px',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        background: getTrophyColor(goal.target_followers),
                                        border: '3px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        zIndex: 1
                                    }} />

                                    {/* Content Card */}
                                    <div style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.7)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.25rem'
                                        }}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: 'var(--dark)',
                                                fontSize: '0.95rem'
                                            }}>
                                                🎯 {goal.target_followers?.toLocaleString()} seguidores
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--gray)'
                                            }}>
                                                {formattedDate}
                                            </span>
                                        </div>

                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--gray)'
                                        }}>
                                            {goal.days_to_achieve ? (
                                                <span>Conquistado em <strong>{goal.days_to_achieve}</strong> dias</span>
                                            ) : (
                                                <span>Meta atingida! 🎉</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Screenshots Gallery - HIDDEN (Background Only) */}
            {/* 
            {screenshots.length > 0 && (
                ...
            )} 
            */}

            {/* Hidden Inputs Updated Handlers */}
            <input
                type="file"
                ref={profileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e, 'profile')}
            />
            <input
                type="file"
                ref={insightsInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e, 'insights')}
            />

            {/* Buttons Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Upload Screenshots Button (Black) */}
                <motion.button
                    onClick={() => setShowUploadModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        background: 'var(--dark)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <Upload size={20} />
                    Upload Prints do Crescimento
                </motion.button>

                {/* Set Goal Button */}
                <motion.button
                    onClick={() => setShowGoalModal(true)}
                    whileHover={{ scale: 1.02, boxShadow: '0 15px 30px -10px rgba(255,107,107,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        background: 'var(--gradient-btn)',
                        color: 'var(--dark)',
                        border: 'none',
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--shadow-colored)'
                    }}
                >
                    <Target size={20} />
                    Definir Meta
                </motion.button>
            </div>

            <GoalSettingModal
                isOpen={showGoalModal}
                onClose={() => { setShowGoalModal(false); loadGoal(); }}
                currentFollowers={latestEntry?.followers || 0}
            />

            {/* Upload Modal (Dual Slot) */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUploadModal(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                width: '100%',
                                maxWidth: '360px',
                                padding: '2rem',
                                borderRadius: '24px'
                            }}
                        >
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                color: 'var(--dark)',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                📸 Análise Inteligente
                            </h2>
                            <p style={{
                                textAlign: 'center',
                                color: 'var(--gray)',
                                fontSize: '0.9rem',
                                marginBottom: '2rem'
                            }}>
                                Adicione seus prints para a IA extrair os dados.
                            </p>

                            {isAnalyzing ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '2rem',
                                    gap: '1rem'
                                }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Loader2 size={40} color="var(--primary)" />
                                    </motion.div>
                                    <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                                        🤖 Lendo imagens...
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {/* Profile Slot */}
                                        <div
                                            onClick={() => profileInputRef.current?.click()}
                                            style={{
                                                flex: 1,
                                                aspectRatio: '1',
                                                borderRadius: '16px',
                                                border: '2px dashed #ddd',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {profilePreviewUrl ? (
                                                <img
                                                    src={profilePreviewUrl}
                                                    alt="Profile Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <>
                                                    <Users size={24} color="#ff8e53" style={{ marginBottom: '0.5rem' }} />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray)', fontWeight: 500 }}>Perfil</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Insights Slot */}
                                        <div
                                            onClick={() => insightsInputRef.current?.click()}
                                            style={{
                                                flex: 1,
                                                aspectRatio: '1',
                                                borderRadius: '16px',
                                                border: '2px dashed #ddd',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {insightsPreviewUrl ? (
                                                <img
                                                    src={insightsPreviewUrl}
                                                    alt="Insights Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <>
                                                    <BarChart3 size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray)', fontWeight: 500 }}>Insights</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>
                                        Clique nos quadrados para carregar
                                    </p>

                                    <motion.button
                                        onClick={processImages}
                                        disabled={!pendingProfile && !pendingInsights}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: (!pendingProfile && !pendingInsights) ? '#f3f4f6' : 'var(--dark)',
                                            color: (!pendingProfile && !pendingInsights) ? '#9ca3af' : 'white',
                                            border: 'none',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            cursor: (!pendingProfile && !pendingInsights) ? 'not-allowed' : 'pointer',
                                            marginTop: '0.5rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        Processar Imagens
                                    </motion.button>

                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--gray)',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                padding: '2rem',
                                borderRadius: '24px'
                            }}
                        >
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                color: 'var(--dark)',
                                marginBottom: '1.5rem',
                            }}>
                                📊 Registrar Métricas
                            </h2>

                            {(profilePreviewUrl || insightsPreviewUrl) && (
                                <div style={{
                                    width: '100%',
                                    height: '150px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    marginBottom: '1.5rem',
                                    border: '2px solid rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    backgroundColor: '#f9fafb'
                                }}>
                                    <img
                                        src={profilePreviewUrl || insightsPreviewUrl || ''}
                                        alt="Preview"
                                        style={{ height: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                            )}

                            <div style={{
                                fontSize: '0.85rem',
                                color: newFollowers ? '#10b981' : 'var(--gray)',
                                textAlign: 'center',
                                marginBottom: '1rem',
                                background: newFollowers ? '#ecfdf5' : '#f3f4f6',
                                padding: '0.5rem',
                                borderRadius: '8px'
                            }}>
                                {newFollowers ? '✨ Dados lidos automaticamente pela IA' : '🔍 Preencha os dados conforme a imagem'}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--gray)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Seguidores atuais *
                                    </label>
                                    <input
                                        type="number"
                                        value={newFollowers}
                                        onChange={e => setNewFollowers(e.target.value)}
                                        placeholder="Ex: 1500"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--gray)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Média de likes por post
                                    </label>
                                    <input
                                        type="number"
                                        value={newLikes}
                                        onChange={e => setNewLikes(e.target.value)}
                                        placeholder="Ex: 150"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--gray)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Média de comentários por post
                                    </label>
                                    <input
                                        type="number"
                                        value={newComments}
                                        onChange={e => setNewComments(e.target.value)}
                                        placeholder="Ex: 20"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(0,0,0,0.1)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(0,0,0,0.1)',
                                        background: 'white',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <motion.button
                                    onClick={handleAddEntry}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        flex: 2,
                                        background: 'var(--gradient-btn)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        boxShadow: 'var(--shadow-colored)'
                                    }}
                                >
                                    Salvar
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )
                }
            </AnimatePresence >

            <GoalSettingModal
                isOpen={showGoalModal}
                onClose={() => {
                    setShowGoalModal(false);
                    loadGoal();
                }}
                currentFollowers={latestEntry?.followers || 0}
            />

            <LevelUpModal
                isOpen={showLevelUp}
                onClose={() => setShowLevelUp(false)}
                currentFollowers={metrics.length > 0 ? metrics[metrics.length - 1].followers : 0}
                nextGoal={nextTierGoal}
                onAcceptChallenge={handleAcceptNextLevel}
            />

        </motion.div >
    );
};
