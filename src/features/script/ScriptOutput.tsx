import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Copy, Check, Download, RefreshCw, Share2, LayoutDashboard, ChevronLeft, ChevronRight, GripVertical, Pencil, X, Loader2 } from 'lucide-react';
import type { ViralScript } from '../../types';
import { TypewriterText } from '../../shared/components/TypewriterText';

interface ScriptOutputProps {
    script: ViralScript;
    transcription?: string; // Original audio transcription for context
    onReset: () => void;
    onViewDashboard?: () => void;
}

// Draggable Section Interface
interface ScriptSection {
    id: string;
    label: string;
    emoji: string;
    content: string;
    color: string;
}

// CTA objective types
const CTA_OBJECTIVES = [
    { id: 'contextual', emoji: '✨', label: 'IA Sugestão', template: (keyword: string, promise?: string) => `Comenta '${keyword}' ${promise || 'que eu te mando o conteúdo!'}` },
    { id: 'comment', emoji: '💬', label: 'Comentário', template: (keyword: string) => `Comenta '${keyword}' que eu te mando o conteúdo completo!` },
    { id: 'follow', emoji: '👤', label: 'Seguir', template: (keyword: string) => `Segue o perfil pra mais conteúdo sobre ${keyword}!` },
    { id: 'dm', emoji: '📩', label: 'DM', template: (keyword: string) => `Me manda '${keyword}' no direct que eu te respondo!` },
    { id: 'sales', emoji: '🛒', label: 'Vendas', template: (keyword: string) => `Link na bio pra você garantir ${keyword} agora!` },
];

// Tone options for script style
const TONE_OPTIONS = [
    { id: 'confrontador', emoji: '🔥', label: 'Confrontador' },
    { id: 'humoristico', emoji: '😂', label: 'Humorístico' },
    { id: 'educativo', emoji: '📚', label: 'Educativo' },
    { id: 'inspiracional', emoji: '✨', label: 'Inspiracional' },
    { id: 'storytelling', emoji: '📖', label: 'Storytelling' },
    { id: 'direto', emoji: '🎯', label: 'Direto ao Ponto' },
];

// OpenAI API key from env
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const ScriptOutput: React.FC<ScriptOutputProps> = ({ script, transcription, onReset, onViewDashboard }) => {
    const [copied, setCopied] = useState(false);
    const [selectedHook, setSelectedHook] = useState(0);

    // CTA editing states
    const [selectedCTA, setSelectedCTA] = useState(0);
    const [ctaKeyword, setCtaKeyword] = useState('EU QUERO');
    const [ctaPromise, setCtaPromise] = useState('');

    // Initialize CTA from script if structured
    useEffect(() => {
        if (typeof script.cta === 'object' && script.cta !== null) {
            // It's a structured CTA
            setCtaKeyword(script.cta.palavra_chave || 'EU QUERO');
            setCtaPromise(script.cta.entrega_prometida || 'que eu te mando o conteúdo');
            setSelectedCTA(0); // Select 'contextual' (index 0)
        } else if (typeof script.cta === 'string') {
            // Legacy string support
            // Try to extract keyword if possible, otherwise default
            const match = script.cta.match(/'([^']+)'/);
            if (match) setCtaKeyword(match[1]);
        }
    }, [script]);

    // Tone selection state
    const [selectedTone, setSelectedTone] = useState(() => {
        // Find initial tone from script metadata
        const initialTone = TONE_OPTIONS.findIndex(t => t.label.toLowerCase() === script.metadata?.tone?.toLowerCase());
        return initialTone >= 0 ? initialTone : 0;
    });
    const [isRegeneratingTone, setIsRegeneratingTone] = useState(false);

    // Section editing states
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);

    const currentHook = script.hooks?.[selectedHook] || { type: 'Hook', text: '', emoji: '🎯' };
    const currentCTA = CTA_OBJECTIVES[selectedCTA];
    const currentTone = TONE_OPTIONS[selectedTone];

    // Reorderable sections state (initialized from script prop)
    const [sections, setSections] = useState<ScriptSection[]>([]);

    useEffect(() => {
        setSections([
            { id: 'contexto', label: 'Contexto (Identificação)', emoji: '🫂', content: script.contexto, color: '#e67e22' },
            { id: 'conceito', label: 'Conceito (Autoridade)', emoji: '🧠', content: script.conceito || 'Conceito em desenvolvimento...', color: '#3498db' },
            { id: 'ruptura', label: 'Ruptura (A Verdade)', emoji: '💥', content: script.ruptura, color: '#9b59b6' },
            { id: 'plano', label: 'Plano de Ação', emoji: '📝', content: script.plano, color: '#27ae60' }
        ]);
    }, [script]);

    // Calculate estimated duration based on word count (150 words/min average speaking rate in Portuguese)
    const calculateDuration = () => {
        const hookText = currentHook.text || '';
        const sectionsText = sections.map(s => s.content).join(' ');
        const ctaText = currentCTA.template(ctaKeyword, ctaPromise);

        const fullText = `${hookText} ${sectionsText} ${ctaText}`;
        const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;

        // 150 words per minute = 2.5 words per second
        const seconds = Math.round(wordCount / 2.5);

        if (seconds < 60) {
            return `${seconds} segundos`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} min`;
        }
    };

    const estimatedDuration = calculateDuration();

    const getFullText = () => {
        const ctaText = currentCTA.template(ctaKeyword, ctaPromise);

        let text = `${currentHook.emoji} HOOK (${currentHook.type}):\n${currentHook.text}\n\n`;

        // Add sections in their current visual order
        sections.forEach(s => {
            text += `${s.emoji} ${s.label.toUpperCase()}:\n${s.content}\n\n`;
        });

        text += `🎬 CTA:\n${ctaText}\n\n---\n✨ Criado com Hooky\nhookyai.com.br`;
        return text.trim();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getFullText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const text = getFullText();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Meu Roteiro Viral',
                    text: text,
                });
            } catch {
                handleCopy();
            }
        } else {
            handleCopy();
        }
    };

    const handleDownload = () => {
        const text = getFullText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roteiro-viral.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const nextHook = () => {
        if (script.hooks && selectedHook < script.hooks.length - 1) {
            setSelectedHook(selectedHook + 1);
        }
    };

    const prevHook = () => {
        if (selectedHook > 0) {
            setSelectedHook(selectedHook - 1);
        }
    };

    // Section editing handlers
    const startEditing = (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);
        if (section) {
            setEditingSectionId(sectionId);
            setEditingContent(section.content);
        }
    };

    const saveEditing = () => {
        if (!editingSectionId) return;
        setSections(prev => prev.map(s =>
            s.id === editingSectionId ? { ...s, content: editingContent } : s
        ));
        setEditingSectionId(null);
        setEditingContent('');
    };

    const cancelEditing = () => {
        setEditingSectionId(null);
        setEditingContent('');
    };

    const regenerateSection = async (sectionId: string) => {
        if (!OPENAI_API_KEY) {
            alert('API key não configurada');
            return;
        }

        const section = sections.find(s => s.id === sectionId);
        if (!section) return;

        setRegeneratingSectionId(sectionId);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `Você é um especialista em roteiros virais. Reescreva a seção "${section.label}" do roteiro de forma diferente mas mantendo a mesma ideia central.

⚠️ REGRA CRÍTICA: A seção reescrita DEVE estar 100% conectada ao TEMA ORIGINAL do áudio transcrito. Não divague para outros assuntos.

${section.id === 'storytelling' ? `
PARA STORYTELLING - Escolha UMA opção:
A) Cite um livro/autor famoso que EXPLICA o fenômeno mencionado
B) Conte uma história pessoal relacionada ao tema
C) Dê uma explicação científica/técnica do "porquê"
NÃO fale sobre "o que é storytelling" - fale sobre o TEMA do roteiro!
` : ''}

REGRAS:
- Mantenha conexão OBRIGATÓRIA com o tema original
- Voz ativa, frases curtas
- Tom de amigo sincero
- Zero clichês
- Emoção > Informação

Responda APENAS com o texto da seção reescrita, sem aspas ou formatação extra.`
                        },
                        {
                            role: 'user',
                            content: `TRANSCRIÇÃO ORIGINAL DO ÁUDIO (este é o TEMA CENTRAL - todas as seções devem falar sobre isso):
${transcription || 'Não disponível'}

Contexto do roteiro atual:
Hook: ${script.hooks?.[selectedHook]?.text || ''}

Seção atual (${section.label}):
${section.content}

Reescreva esta seção de forma diferente mas SEMPRE conectada ao tema da transcrição original:`
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 300
                }),
            });

            if (!response.ok) throw new Error('Failed to regenerate');

            const data = await response.json();
            const newContent = data.choices[0].message.content.trim();

            setSections(prev => prev.map(s =>
                s.id === sectionId ? { ...s, content: newContent } : s
            ));
        } catch (error) {
            console.error('Error regenerating section:', error);
            alert('Erro ao regenerar seção. Tente novamente.');
        } finally {
            setRegeneratingSectionId(null);
        }
    };

    // Regenerate all sections with new tone
    const handleToneChange = async (newToneIndex: number) => {
        const newTone = TONE_OPTIONS[newToneIndex];
        setSelectedTone(newToneIndex);

        if (!OPENAI_API_KEY) return;

        setIsRegeneratingTone(true);

        try {
            // Regenerate each section with the new tone
            const regeneratedSections = await Promise.all(
                sections.map(async (section) => {
                    try {
                        const response = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                model: 'gpt-4o-mini',
                                messages: [
                                    {
                                        role: 'system',
                                        content: `Você é um especialista em roteiros virais. Reescreva a seção "${section.label}" usando o tom ${newTone.label.toUpperCase()}.

ESTILO ${newTone.label.toUpperCase()}:
${newTone.id === 'confrontador' ? '- Provocativo, direto, desafia o espectador' : ''}
${newTone.id === 'humoristico' ? '- Leve, engraçado, usa humor e piadas' : ''}
${newTone.id === 'educativo' ? '- Informativo, claro, explica conceitos' : ''}
${newTone.id === 'inspiracional' ? '- Motivador, positivo, eleva o espectador' : ''}
${newTone.id === 'storytelling' ? '- Narrativo, conta história, cria conexão emocional' : ''}
${newTone.id === 'direto' ? '- Objetivo, sem enrolação, vai direto ao ponto' : ''}

REGRAS:
- Mantenha a mesma ideia central
- Adapte o tom e linguagem ao estilo escolhido
- Frases curtas e impactantes

Responda APENAS com o texto reescrito, sem aspas ou formatação.`
                                    },
                                    {
                                        role: 'user',
                                        content: `TRANSCRIÇÃO ORIGINAL DO ÁUDIO (mantenha o tema!):
${transcription || 'Não disponível'}

Seção atual (${section.label}):
${section.content}

Reescreva no tom ${newTone.label}, mantendo conexão com o tema original:`
                                    }
                                ],
                                temperature: 0.8,
                                max_tokens: 300
                            }),
                        });

                        if (!response.ok) throw new Error('Failed');

                        const data = await response.json();
                        return { ...section, content: data.choices[0].message.content.trim() };
                    } catch {
                        return section; // Keep original if fails
                    }
                })
            );

            setSections(regeneratedSections);
        } catch (error) {
            console.error('Error regenerating with tone:', error);
        } finally {
            setIsRegeneratingTone(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="script-output"
            style={{
                width: '100%',
                maxWidth: '650px',
                textAlign: 'left'
            }}
        >
            <div className="glass-card" style={{
                borderRadius: '32px',
                padding: '2.5rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease',
            }}>
                {/* Header Metadata */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    fontSize: '0.85rem',
                    color: 'var(--gray)',
                    fontFamily: 'var(--font-mono)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    paddingBottom: '1rem'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>⏱ {estimatedDuration}</span>

                    {/* Clickable Tone Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <motion.button
                            onClick={() => handleToneChange(Math.max(0, selectedTone - 1))}
                            disabled={selectedTone === 0 || isRegeneratingTone}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: selectedTone === 0 || isRegeneratingTone ? '#eee' : 'var(--primary)',
                                border: 'none', cursor: selectedTone === 0 || isRegeneratingTone ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: selectedTone === 0 || isRegeneratingTone ? '#999' : 'white', padding: 0
                            }}
                        >
                            <ChevronLeft size={14} />
                        </motion.button>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            minWidth: '130px', justifyContent: 'center'
                        }}>
                            {isRegeneratingTone ? (
                                <>
                                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                    <span>Adaptando...</span>
                                </>
                            ) : (
                                <>{currentTone.emoji} {currentTone.label}</>
                            )}
                        </span>
                        <motion.button
                            onClick={() => handleToneChange(Math.min(TONE_OPTIONS.length - 1, selectedTone + 1))}
                            disabled={selectedTone === TONE_OPTIONS.length - 1 || isRegeneratingTone}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: selectedTone === TONE_OPTIONS.length - 1 || isRegeneratingTone ? '#eee' : 'var(--primary)',
                                border: 'none', cursor: selectedTone === TONE_OPTIONS.length - 1 || isRegeneratingTone ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: selectedTone === TONE_OPTIONS.length - 1 || isRegeneratingTone ? '#999' : 'white', padding: 0
                            }}
                        >
                            <ChevronRight size={14} />
                        </motion.button>
                    </div>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📱 {script.metadata.platform}</span>
                </div>

                {/* FIXED HOOK Section */}
                <div style={{ marginBottom: '2rem', position: 'relative' }}>
                    <div style={{
                        position: 'absolute', left: '-2.5rem', top: '0.5rem', width: '4px', height: '80%',
                        background: 'var(--primary)', borderRadius: '0 4px 4px 0'
                    }} />

                    {/* Hook Header with Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{
                            fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)',
                            textTransform: 'uppercase', letterSpacing: '0.1em'
                        }}>
                            {currentHook.emoji} Hook ({currentHook.type})
                        </label>

                        {script.hooks && script.hooks.length > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <motion.button
                                    onClick={prevHook}
                                    disabled={selectedHook === 0}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: selectedHook === 0 ? '#eee' : 'var(--primary)',
                                        border: 'none', cursor: selectedHook === 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: selectedHook === 0 ? '#999' : 'white'
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                </motion.button>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray)', minWidth: '40px', textAlign: 'center' }}>
                                    {selectedHook + 1}/{script.hooks.length}
                                </span>
                                <motion.button
                                    onClick={nextHook}
                                    disabled={selectedHook === script.hooks.length - 1}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: selectedHook === script.hooks.length - 1 ? '#eee' : 'var(--primary)',
                                        border: 'none', cursor: selectedHook === script.hooks.length - 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: selectedHook === script.hooks.length - 1 ? '#999' : 'white'
                                    }}
                                >
                                    <ChevronRight size={16} />
                                </motion.button>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedHook}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                fontSize: '1.4rem',
                                fontFamily: 'var(--font-display)',
                                lineHeight: 1.3,
                                color: 'var(--dark)',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            <TypewriterText text={currentHook.text} speed={20} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* DRAGGABLE SECTIONS (Conflict, Climax, Storytelling, Solution) */}
                <Reorder.Group axis="y" values={sections} onReorder={setSections} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {sections.map((section) => (
                        <Reorder.Item key={section.id} value={section} style={{ position: 'relative' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem'
                                }}>
                                    <label style={{
                                        fontSize: '0.75rem', fontWeight: 800, color: section.color,
                                        textTransform: 'uppercase', letterSpacing: '0.1em',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        cursor: 'grab'
                                    }}>
                                        {section.emoji} {section.label} <GripVertical size={14} style={{ opacity: 0.5 }} />
                                    </label>

                                    {/* Edit/Regenerate buttons */}
                                    {editingSectionId !== section.id && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <motion.button
                                                onClick={() => startEditing(section.id)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Editar seção"
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '8px',
                                                    background: 'rgba(0,0,0,0.05)', border: 'none',
                                                    cursor: 'pointer', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    color: section.color
                                                }}
                                            >
                                                <Pencil size={14} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => regenerateSection(section.id)}
                                                disabled={regeneratingSectionId === section.id}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Regenerar seção"
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '8px',
                                                    background: 'rgba(0,0,0,0.05)', border: 'none',
                                                    cursor: regeneratingSectionId === section.id ? 'wait' : 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: section.color,
                                                    opacity: regeneratingSectionId === section.id ? 0.5 : 1
                                                }}
                                            >
                                                {regeneratingSectionId === section.id ? (
                                                    <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <RefreshCw size={14} />
                                                )}
                                            </motion.button>
                                        </div>
                                    )}
                                </div>

                                {/* Content: Edit mode or Display mode */}
                                {editingSectionId === section.id ? (
                                    <div style={{
                                        paddingLeft: '1rem', borderLeft: `2px solid ${section.color}`,
                                        background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0'
                                    }}>
                                        <textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            style={{
                                                width: '100%', minHeight: '120px', padding: '1rem',
                                                fontSize: '1rem', lineHeight: 1.7, fontFamily: 'inherit',
                                                border: `2px solid ${section.color}`, borderRadius: '8px',
                                                background: 'white', resize: 'vertical', outline: 'none'
                                            }}
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingBottom: '0.5rem' }}>
                                            <motion.button
                                                onClick={saveEditing}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '8px',
                                                    background: section.color, color: 'white',
                                                    border: 'none', cursor: 'pointer',
                                                    fontSize: '0.85rem', fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                }}
                                            >
                                                <Check size={14} /> Salvar
                                            </motion.button>
                                            <motion.button
                                                onClick={cancelEditing}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '8px',
                                                    background: '#eee', color: '#666',
                                                    border: 'none', cursor: 'pointer',
                                                    fontSize: '0.85rem', fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                }}
                                            >
                                                <X size={14} /> Cancelar
                                            </motion.button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--dark)', opacity: 0.9,
                                        paddingLeft: '1rem', borderLeft: `2px solid ${section.color}`,
                                        background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {regeneratingSectionId === section.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0', color: section.color }}>
                                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                <span>Regenerando...</span>
                                            </div>
                                        ) : (
                                            <TypewriterText
                                                text={section.content}
                                                delay={0}
                                                speed={15}
                                                style={{ whiteSpace: 'pre-wrap' }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {/* FIXED CTA Section */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)',
                    padding: '1.5rem',
                    borderRadius: '20px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <label style={{
                            fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark)',
                            textTransform: 'uppercase', letterSpacing: '0.1em'
                        }}>
                            {currentCTA.emoji} CTA ({currentCTA.label})
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <motion.button
                                onClick={() => setSelectedCTA(Math.max(0, selectedCTA - 1))}
                                disabled={selectedCTA === 0}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: selectedCTA === 0 ? '#eee' : 'var(--dark)',
                                    border: 'none', cursor: selectedCTA === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedCTA === 0 ? '#999' : 'white'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </motion.button>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray)', minWidth: '30px', textAlign: 'center' }}>
                                {selectedCTA + 1}/{CTA_OBJECTIVES.length}
                            </span>
                            <motion.button
                                onClick={() => setSelectedCTA(Math.min(CTA_OBJECTIVES.length - 1, selectedCTA + 1))}
                                disabled={selectedCTA === CTA_OBJECTIVES.length - 1}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: selectedCTA === CTA_OBJECTIVES.length - 1 ? '#eee' : 'var(--dark)',
                                    border: 'none', cursor: selectedCTA === CTA_OBJECTIVES.length - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedCTA === CTA_OBJECTIVES.length - 1 ? '#999' : 'white'
                                }}
                            >
                                <ChevronRight size={16} />
                            </motion.button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCTA}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--dark)', lineHeight: 1.5 }}
                        >
                            👉 {currentCTA.template(ctaKeyword, ctaPromise)}
                        </motion.div>
                    </AnimatePresence>

                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Palavra-chave:</span>
                        <input
                            type="text"
                            value={ctaKeyword}
                            onChange={(e) => setCtaKeyword(e.target.value.toUpperCase())}
                            style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '8px',
                                border: '2px dashed var(--primary)',
                                background: 'rgba(255,107,107,0.1)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                textAlign: 'center',
                                outline: 'none',
                                width: '120px'
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <motion.button
                        onClick={handleCopy}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            flex: 1,
                            background: copied ? 'var(--success)' : 'var(--dark)',
                            color: 'white',
                            border: 'none',
                            padding: '1.2rem',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            transition: 'background 0.3s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Copiado!' : 'Copiar Roteiro'}
                    </motion.button>

                    <motion.button
                        onClick={handleShare}
                        whileHover={{ scale: 1.05, background: 'var(--primary)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '56px',
                            background: 'rgba(255,107,107,0.1)',
                            border: '1px solid var(--primary)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            transition: 'all 0.2s'
                        }}
                        title="Compartilhar"
                    >
                        <Share2 size={24} />
                    </motion.button>

                    <motion.button
                        onClick={handleDownload}
                        whileHover={{ scale: 1.05, background: 'var(--bg-surface)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '56px',
                            background: 'rgba(255,255,255,0.5)',
                            border: '1px solid var(--gray)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--dark)'
                        }}
                        title="Baixar"
                    >
                        <Download size={24} />
                    </motion.button>
                </div>

                {/* Watermark/Branding */}
                <div style={{
                    textAlign: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    fontSize: '0.8rem',
                    color: 'var(--gray)',
                    opacity: 0.7
                }}>
                    ✨ Criado com <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>Hooky</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <button
                    onClick={onReset}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--dark)',
                        opacity: 0.6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem'
                    }}
                >
                    <RefreshCw size={16} /> Criar Novo Roteiro
                </button>

                {onViewDashboard && (
                    <motion.button
                        onClick={onViewDashboard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: 'var(--shadow-colored)'
                        }}
                    >
                        <LayoutDashboard size={18} /> Ver Meu Dashboard
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};
