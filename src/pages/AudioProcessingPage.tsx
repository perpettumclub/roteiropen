import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ProcessingView } from '../features/script';
import { useScriptContext } from '../shared/context/ScriptContext';

export const AudioProcessingPage = () => {
    const navigate = useNavigate();
    const { startTranscription, capturedAudio, error } = useScriptContext();

    useEffect(() => {
        if (!capturedAudio) {
            navigate('/app/gravar');
            return;
        }

        startTranscription()
            .then(() => navigate('/app/confirmar'))
            .catch(() => navigate('/app/erro'));
    }, []);

    if (error) return <Navigate to="/app/erro" />;

    return <ProcessingView />;
};
