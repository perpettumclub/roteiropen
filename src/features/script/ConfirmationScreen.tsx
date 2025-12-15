import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Check, ArrowRight } from 'lucide-react';

interface ConfirmationScreenProps {
    transcription: string;
    problem: string;
    solution: string;
    onConfirm: (problem: string, solution: string) => void;
    onBack: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
    transcription,
    problem: initialProblem,
    solution: initialSolution,
    onConfirm,
    onBack
}) => {
    const [problem, setProblem] = useState(initialProblem);
    const [solution, setSolution] = useState(initialSolution);
    const [editingProblem, setEditingProblem] = useState(false);
    const [editingSolution, setEditingSolution] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
                width: '100%',
                maxWidth: '550px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}
        >
            <div className="glass-card" style={{
                padding: '2rem',
                borderRadius: '24px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'var(--dark)',
                    marginBottom: '0.5rem'
                }}>
                    Confirma o tema do roteiro?
                </h2>
                <p style={{
                    color: 'var(--gray)',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem'
                }}>
                    Revise e edite o problema e solução extraídos do seu áudio
                </p>

                {/* Problem Field */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#e74c3c',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            😤 Problema / Dor
                        </label>
                        <motion.button
                            onClick={() => setEditingProblem(!editingProblem)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--gray)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.75rem'
                            }}
                        >
                            {editingProblem ? <Check size={14} /> : <Edit3 size={14} />}
                            {editingProblem ? 'Salvar' : 'Editar'}
                        </motion.button>
                    </div>
                    {editingProblem ? (
                        <textarea
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid #e74c3c',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1rem',
                                resize: 'vertical',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                    ) : (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(231, 76, 60, 0.08)',
                            borderRadius: '12px',
                            borderLeft: '3px solid #e74c3c',
                            fontSize: '1rem',
                            color: 'var(--dark)',
                            lineHeight: 1.5
                        }}>
                            {problem || 'Nenhum problema identificado'}
                        </div>
                    )}
                </div>

                {/* Solution Field */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#27ae60',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            💡 Solução / Insight
                        </label>
                        <motion.button
                            onClick={() => setEditingSolution(!editingSolution)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--gray)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.75rem'
                            }}
                        >
                            {editingSolution ? <Check size={14} /> : <Edit3 size={14} />}
                            {editingSolution ? 'Salvar' : 'Editar'}
                        </motion.button>
                    </div>
                    {editingSolution ? (
                        <textarea
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid #27ae60',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1rem',
                                resize: 'vertical',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                    ) : (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(39, 174, 96, 0.08)',
                            borderRadius: '12px',
                            borderLeft: '3px solid #27ae60',
                            fontSize: '1rem',
                            color: 'var(--dark)',
                            lineHeight: 1.5
                        }}>
                            {solution || 'Nenhuma solução identificada'}
                        </div>
                    )}
                </div>

                {/* Original transcription (collapsed) */}
                <details style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <summary style={{
                        fontSize: '0.8rem',
                        color: 'var(--gray)',
                        cursor: 'pointer',
                        marginBottom: '0.5rem'
                    }}>
                        📝 Ver transcrição original
                    </summary>
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: 'var(--gray)',
                        lineHeight: 1.6,
                        maxHeight: '150px',
                        overflow: 'auto'
                    }}>
                        {transcription}
                    </div>
                </details>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <motion.button
                        onClick={() => onConfirm(problem, solution)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: 'var(--dark)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem 1.5rem',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Confirmar e continuar <ArrowRight size={18} />
                    </motion.button>

                    <button
                        onClick={onBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gray)',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        ← Gravar novamente
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
