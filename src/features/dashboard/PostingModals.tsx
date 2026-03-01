import React from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface PostingModalsProps {
    showPostedModal: boolean;
    showNotPostedModal: boolean;
    onClosePosted: () => void;
    onCloseNotPosted: () => void;
    onPostConfirmed: () => void;
}

export const PostingModals: React.FC<PostingModalsProps> = ({
    showPostedModal,
    showNotPostedModal,
    onClosePosted,
    onCloseNotPosted,
    onPostConfirmed,
}) => {
    const handleMarkAsPosted = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: scripts } = await supabase
                .from('frequency_scripts')
                .select('id')
                .eq('user_id', user.id)
                .is('posted_at', null)
                .order('created_at', { ascending: false })
                .limit(1);

            if (scripts && scripts[0]) {
                await supabase
                    .from('frequency_scripts')
                    .update({ posted_at: new Date().toISOString() })
                    .eq('id', scripts[0].id);

                await supabase.rpc('update_posting_stats', { p_user_id: user.id });
            }

            onClosePosted();
            onPostConfirmed();
            alert('✅ Postagem registrada com sucesso!');
        } catch (error) {
            console.error('Error marking as posted:', error);
            alert('Erro ao registrar postagem');
        }
    };

    const handleMarkAsNotPosted = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: scripts } = await supabase
                .from('frequency_scripts')
                .select('id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (scripts && scripts[0]) {
                const now = new Date();
                const brasiliaOffset = -3 * 60;
                const localTime = new Date(now.getTime() + brasiliaOffset * 60 * 1000);

                await supabase
                    .from('frequency_scripts')
                    .update({ not_posted_at: localTime.toISOString() })
                    .eq('id', scripts[0].id);
            }

            onCloseNotPosted();
            window.location.reload();
        } catch (error) {
            console.error('Error marking as not posted:', error);
            alert('Erro ao registrar');
        }
    };

    return (
        <>
            {showPostedModal && (
                <div
                    onClick={onClosePosted}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card"
                        style={{ padding: '2rem', borderRadius: '24px', maxWidth: '400px', width: '100%', background: 'white' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem'
                            }}>✅</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Parabéns! 🎉</h3>
                            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Você postou hoje! Isso é consistência. Continue assim! 🔥
                            </p>
                            <button
                                onClick={handleMarkAsPosted}
                                style={{
                                    width: '100%', padding: '1rem', background: '#10B981', color: 'white',
                                    border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showNotPostedModal && (
                <div
                    onClick={onCloseNotPosted}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card"
                        style={{ padding: '2rem', borderRadius: '24px', maxWidth: '400px', width: '100%', background: 'white' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem'
                            }}>❌</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Não postei hoje</h3>
                            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Tudo bem! Consistência é sobre ser honesto. Amanhã é um novo dia para manter o ritmo. 💪
                            </p>
                            <button
                                onClick={handleMarkAsNotPosted}
                                style={{
                                    width: '100%', padding: '1rem', background: '#EF4444', color: 'white',
                                    border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                OK, entendi
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};
