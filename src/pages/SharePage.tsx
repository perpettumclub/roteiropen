import { Navigate, useNavigate } from 'react-router-dom';
import { ShareScreen } from '../features/share';
import { useScriptContext } from '../shared/context/ScriptContext';

export const SharePage = () => {
    const navigate = useNavigate();
    const { script } = useScriptContext();

    const handleComplete = () => navigate('/dashboard');

    if (!script) return <Navigate to="/dashboard" />;

    const content = `${script.hooks[script.selectedHookIndex]}\n\n${script.contexto}\n\n${script.conceito}\n\n${script.ruptura}\n\n${script.plano}\n\n${script.cta}`;

    return <ShareScreen scriptContent={content} onShare={handleComplete} onSkip={handleComplete} />;
};
