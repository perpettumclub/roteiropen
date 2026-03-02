import { Navigate, useNavigate } from 'react-router-dom';
import { ShareScreen } from '../features/share';
import { useScriptContext } from '../shared/context/ScriptContext';

export const SharePage = () => {
    const navigate = useNavigate();
    const { script } = useScriptContext();

    const handleComplete = () => navigate('/dashboard');

    if (!script) return <Navigate to="/dashboard" />;

    const selectedHook = script.hooks[script.selectedHookIndex];
    const hookText = typeof selectedHook === 'string' ? selectedHook : selectedHook.text;

    // Format CTA
    let ctaText = '';
    if (typeof script.cta === 'string') {
        ctaText = script.cta;
    } else if (script.cta && typeof script.cta === 'object') {
        ctaText = `${script.cta.texto} ${script.cta.palavra_chave} ${script.cta.emoji}`;
    }

    const content = `${hookText}\n\n${script.contexto}\n\n${script.conceito}\n\n${script.ruptura}\n\n${script.plano}\n\n${ctaText}`;

    return <ShareScreen scriptContent={content} onShare={handleComplete} onSkip={handleComplete} />;
};
