import React, { useState, useRef } from 'react';

import { toPng } from 'html-to-image';
import { Download, Share2, TrendingUp, Upload, RefreshCw, X, Eye, ScanSearch, CheckCircle2, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface GrowthCardProps {
    onClose?: () => void;
}

export const GrowthCard: React.FC<GrowthCardProps> = ({ onClose }) => {
    // State for inputs
    const [startFollowers, setStartFollowers] = useState<string>('');
    const [currentFollowers, setCurrentFollowers] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [timeframe, setTimeframe] = useState<string>('30 dias');
    const [profileVisits, setProfileVisits] = useState<string>('');

    // State for Images
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [afterImage, setAfterImage] = useState<string | null>(null);

    // Processing States
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzingBefore, setIsAnalyzingBefore] = useState(false);
    const [isAnalyzingAfter, setIsAnalyzingAfter] = useState(false);
    const [ocrError, setOcrError] = useState<string | null>(null);

    const cardRef = useRef<HTMLDivElement>(null);
    const beforeInputRef = useRef<HTMLInputElement>(null);
    const afterInputRef = useRef<HTMLInputElement>(null);

    // Calculate growth
    const parseNumber = (str: string) => {
        if (!str) return 0;
        let num = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (str.toLowerCase().includes('k')) num *= 1000;
        if (str.toLowerCase().includes('m')) num *= 1000000;
        return num;
    };

    const start = parseNumber(startFollowers);
    const current = parseNumber(currentFollowers);
    const growth = current - start;
    const growthPercentage = start > 0 ? ((growth / start) * 100).toFixed(0) : '0';

    const extractDataFromImage = async (imageSrc: string, type: 'before' | 'after') => {
        if (type === 'before') setIsAnalyzingBefore(true);
        else setIsAnalyzingAfter(true);
        setOcrError(null);

        try {
            const result = await Tesseract.recognize(imageSrc, 'eng', {
                logger: m => console.log(m)
            });

            const text = result.data.text;
            console.log('OCR Text:', text);

            // 1. Try to find Username (@handle)
            const usernameMatch = text.match(/@([a-zA-Z0-9_.]+)/);
            if (usernameMatch && !username) {
                setUsername('@' + usernameMatch[1]);
            }

            // 2. Try to find Follower Count
            // Logic: numbers often appear as "1,234" or "10.5K" near "Followers" or "Seguidores"
            // Or just a big number at the top of profile
            const lines = text.split('\n');

            let foundFollowers = null;
            let foundVisits = null;

            // Heuristic A: Look for "Followers" and take the number before or above it
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].toLowerCase();

                // Followers Logic
                if (line.includes('followers') || line.includes('seguidores')) {
                    // Check previous line for number (Instagram Layout)
                    if (i > 0) {
                        const prevLine = lines[i - 1].trim();
                        const match = prevLine.match(/^([0-9.,]+[KkMm]?)$/); // Exact match number
                        if (match) foundFollowers = match[1];
                    }
                    // Check same line "12K followers"
                    if (!foundFollowers) {
                        const match = lines[i].match(/([0-9.,]+[KkMm]?)\s*(followers|seguidores)/i);
                        if (match) foundFollowers = match[1];
                    }
                }

                // Profile Visits (Insights) Logic
                if ((line.includes('accounts reached') || line.includes('visitas ao perfil') || line.includes('contas alcançadas') || line.includes('profile visits'))) {
                    const match = lines[i].match(/([0-9.,]+[KkMm]?)/);
                    if (match) foundVisits = match[1];
                    // Check previous/next line
                    if (!foundVisits && i > 0 && lines[i - 1].match(/^([0-9.,]+[KkMm]?)$/)) foundVisits = lines[i - 1];
                }
            }

            // Heuristic B: Fallback - find biggest formatted number (risky, but often works for header)
            if (!foundFollowers) {
                const potentialNumbers = text.match(/[0-9]{1,3}[.,][0-9]{1,3}[KkMm]?|[0-9]+[KkMm]/g);
                if (potentialNumbers && potentialNumbers.length > 0) {
                    // Pick the one that looks most like a follower count (usually 2nd or 3rd number in header after posts)
                    // This is hard to guess reliably.
                }
            }

            if (foundFollowers) {
                if (type === 'before') setStartFollowers(foundFollowers.toUpperCase());
                else setCurrentFollowers(foundFollowers.toUpperCase());
            }

            if (foundVisits && type === 'after') {
                setProfileVisits(foundVisits.toUpperCase());
            }

        } catch (err) {
            console.error('OCR Failed', err);
            setOcrError('Não foi possível ler os dados automaticamente. Verifique a qualidade do print.');
        } finally {
            if (type === 'before') setIsAnalyzingBefore(false);
            else setIsAnalyzingAfter(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (type === 'before') setBeforeImage(result);
                else setAfterImage(result);

                // Trigger OCR
                extractDataFromImage(result, type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `hooky-proof-${username || 'growth'}.png`;
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
                const file = new File([blob], 'growth-proof.png', { type: 'image/png' });
                await navigator.share({
                    title: 'Meu Crescimento Real',
                    text: `Prova real: Cresci ${growthPercentage}% em ${timeframe} com Hooky! 🚀`,
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
            maxWidth: '960px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    color: 'var(--dark)',
                    marginBottom: '0.5rem'
                }}>
                    Prove seu resultado 📸
                </h2>
                <p style={{ color: 'var(--gray)' }}>
                    Carregue prints do seu perfil. Nossa IA irá validar os números.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* CONTROLS SIDE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Image Uploads */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Before Upload */}
                        <div
                            onClick={() => !isAnalyzingBefore && beforeInputRef.current?.click()}
                            style={{
                                border: '2px dashed var(--border)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                                cursor: isAnalyzingBefore ? 'wait' : 'pointer',
                                background: beforeImage ? 'rgba(0,0,0,0.02)' : 'white',
                                aspectRatio: '1/1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <input
                                type="file"
                                ref={beforeInputRef}
                                onChange={(e) => handleImageUpload(e, 'before')}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                            {beforeImage ? (
                                <img src={beforeImage} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isAnalyzingBefore ? 0.5 : 1 }} />
                            ) : (
                                <>
                                    <Upload size={24} color="var(--gray)" />
                                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--gray)' }}>Print Antigo</span>
                                </>
                            )}

                            {isAnalyzingBefore && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
                                    <ScanSearch className="spin" size={24} color="var(--primary)" />
                                    <span style={{ fontSize: '0.7rem', marginTop: '0.5rem', fontWeight: 600 }}>Lendo...</span>
                                </div>
                            )}

                            {startFollowers && !isAnalyzingBefore && beforeImage && (
                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#10B981', borderRadius: '50%', padding: '4px' }}>
                                    <CheckCircle2 size={12} color="white" />
                                </div>
                            )}
                        </div>

                        {/* After Upload */}
                        <div
                            onClick={() => !isAnalyzingAfter && afterInputRef.current?.click()}
                            style={{
                                border: '2px dashed var(--border)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                                cursor: isAnalyzingAfter ? 'wait' : 'pointer',
                                background: afterImage ? 'rgba(0,0,0,0.02)' : 'white',
                                aspectRatio: '1/1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <input
                                type="file"
                                ref={afterInputRef}
                                onChange={(e) => handleImageUpload(e, 'after')}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                            {afterImage ? (
                                <img src={afterImage} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isAnalyzingAfter ? 0.5 : 1 }} />
                            ) : (
                                <>
                                    <Upload size={24} color="var(--primary)" />
                                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>Print Atual</span>
                                </>
                            )}

                            {isAnalyzingAfter && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
                                    <ScanSearch className="spin" size={24} color="var(--primary)" />
                                    <span style={{ fontSize: '0.7rem', marginTop: '0.5rem', fontWeight: 600 }}>Lendo...</span>
                                </div>
                            )}
                            {currentFollowers && !isAnalyzingAfter && afterImage && (
                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#10B981', borderRadius: '50%', padding: '4px' }}>
                                    <CheckCircle2 size={12} color="white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {ocrError && (
                        <div style={{ fontSize: '0.8rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={14} /> {ocrError}
                        </div>
                    )}

                    {/* Detected Data Display */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Seguidores Antes</label>
                            <div style={{
                                padding: '0.75rem', borderRadius: '8px',
                                background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)',
                                fontWeight: 600, color: startFollowers ? 'var(--dark)' : 'var(--gray)'
                            }}>
                                {startFollowers || '-'}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Seguidores Agora</label>
                            <div style={{
                                padding: '0.75rem', borderRadius: '8px',
                                background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)',
                                fontWeight: 600, color: currentFollowers ? 'var(--dark)' : 'var(--gray)'
                            }}>
                                {currentFollowers || '-'}
                            </div>
                        </div>
                    </div>

                    {profileVisits && (
                        <div style={{
                            padding: '0.75rem', borderRadius: '8px',
                            background: '#FFFBE6', border: '1px solid #FFE58F',
                            color: '#D48806', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <Eye size={16} /> <strong>{profileVisits}</strong> visualizações no perfil detectadas!
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Contas Alcançadas (Opcional)</label>
                            <input
                                type="text"
                                value={profileVisits}
                                onChange={(e) => setProfileVisits(e.target.value)}
                                placeholder="10000"
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid var(--border)', fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Tempo</label>
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid var(--border)', fontSize: '0.9rem', background: 'white'
                                }}
                            >
                                <option>30 dias</option>
                                <option>60 dias</option>
                                <option>90 dias</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating || !startFollowers || !currentFollowers}
                            style={{
                                flex: 1, padding: '1rem', borderRadius: '12px',
                                border: '1px solid var(--border)', background: 'white',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600,
                                opacity: (!startFollowers || !currentFollowers) ? 0.5 : 1
                            }}
                        >
                            {isGenerating ? <RefreshCw className="spin" size={18} /> : <Download size={18} />} Baixar
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={isGenerating || !startFollowers || !currentFollowers}
                            style={{
                                flex: 1, padding: '1rem', borderRadius: '12px',
                                border: 'none', background: 'var(--primary)', color: 'white',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600,
                                opacity: (!startFollowers || !currentFollowers) ? 0.5 : 1
                            }}
                        >
                            {isGenerating ? <RefreshCw className="spin" size={18} /> : <Share2 size={18} />} Compartilhar
                        </button>
                    </div>

                </div>

                {/* PREVIEW SIDE */}
                <div style={{ display: 'flex', justifyContent: 'center', background: '#f5f5f5', padding: '1rem', borderRadius: '16px' }}>
                    <div
                        ref={cardRef}
                        style={{
                            width: '320px', // Fixed width for Story preview (scaled down)
                            aspectRatio: '9/16',
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            color: 'white',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                    >
                        {/* Background Elements */}
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
                            background: '#D4AF37',
                            filter: 'blur(100px)',
                            opacity: 0.1
                        }} />

                        {/* Content */}
                        <div style={{ zIndex: 10, padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.7 }}>HOOKY PROOFS</div>
                                <TrendingUp size={18} color="#D4AF37" />
                            </div>

                            <h2 style={{
                                fontSize: '2rem',
                                fontFamily: 'var(--font-display)',
                                lineHeight: '1.1',
                                marginBottom: '2rem'
                            }}>
                                Resultado real<br />
                                <span style={{ color: '#D4AF37' }}>em {timeframe}</span>
                            </h2>

                            {/* Screenshots Area */}
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '2rem',
                                justifyContent: 'center'
                            }}>
                                {/* BEFORE phone */}
                                <div style={{
                                    width: '100px',
                                    height: '180px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '4px',
                                    transform: 'rotate(-5deg) translateY(10px)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden', background: '#333' }}>
                                        {beforeImage ? (
                                            <img src={beforeImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.7rem' }}>Sem print</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.7rem', marginTop: '5px', fontWeight: 'bold' }}>ANTES</div>
                                </div>

                                {/* AFTER phone */}
                                <div style={{
                                    width: '110px',
                                    height: '200px',
                                    background: '#D4AF37', // Gold border 
                                    borderRadius: '8px',
                                    padding: '4px',
                                    transform: 'rotate(5deg) translateZ(10px)',
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
                                    zIndex: 5
                                }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden', background: '#333' }}>
                                        {afterImage ? (
                                            <img src={afterImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.7rem' }}>Sem print</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold', color: '#D4AF37' }}>AGORA</div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>CRESCIMENTO</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D4AF37' }}>+{growthPercentage}%</div>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0', borderRadius: '2px' }}>
                                    <div style={{ width: '100%', height: '100%', background: '#D4AF37', borderRadius: '2px' }}></div>
                                </div>
                                <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                    {startFollowers || '...'} ➔ <span style={{ color: 'white', fontWeight: 'bold' }}>{currentFollowers || '...'}</span>
                                </div>
                            </div>

                            {profileVisits && (
                                <div style={{
                                    marginTop: '0.8rem',
                                    paddingTop: '0.8rem',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.8rem',
                                    color: '#D4AF37'
                                }}>
                                    <Eye size={14} />
                                    <strong>{profileVisits}</strong> <span style={{ opacity: 0.7, color: 'white' }}>contas alcançadas</span>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D4AF37', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {(username || 'H').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{username || '@usuario'}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Verificado pelo Hooky ✅</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}
            >
                <X size={20} />
            </button>

        </div>
    );
};
