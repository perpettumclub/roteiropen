import { useNavigate } from 'react-router-dom';
import { YouTubeLinkInput } from '../features/remix';
import { useScriptContext } from '../shared/context/ScriptContext';

export const RemixPage = () => {
    const navigate = useNavigate();
    const { youtubeLinks, setYoutubeLinks, generateScript } = useScriptContext();

    const handleConfirm = () => {
        generateScript(false).then((success) => {
            if (success) navigate('/app/resultado');
            else navigate('/app/erro');
        });
        navigate('/app/gerando-script');
    };

    const handleSkip = () => {
        generateScript(true).then((success) => {
            if (success) navigate('/app/resultado');
            else navigate('/app/erro');
        });
        navigate('/app/gerando-script');
    };

    return (
        <div className="glass-card" style={{
            padding: '2rem',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
            margin: '0 auto'
        }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>
                Adicione referências
            </h2>
            <YouTubeLinkInput
                links={youtubeLinks}
                onLinksChange={setYoutubeLinks}
                maxLinks={3}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                {youtubeLinks.length > 0 && (
                    <button onClick={handleConfirm} className="btn-primary">
                        🚀 Criar Roteiro Remixado
                    </button>
                )}
                <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: 'var(--gray)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Pular, criar sem remix →
                </button>
            </div>
        </div>
    );
};
