import { Navigate, useNavigate } from 'react-router-dom';
import { ScriptOutput } from '../features/script';
import { useScriptContext } from '../shared/context/ScriptContext';

export const ResultPage = () => {
    const navigate = useNavigate();
    const { script, transcription, resetScript } = useScriptContext();

    if (!script) return <Navigate to="/app/gravar" />;

    return (
        <ScriptOutput
            script={script}
            transcription={transcription}
            onReset={() => {
                resetScript();
                navigate('/app/gravar');
            }}
            onViewDashboard={() => navigate('/app/compartilhar')}
        />
    );
};
