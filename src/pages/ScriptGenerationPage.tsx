import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessingView } from '../features/script';
import { useScriptContext } from '../shared/context/ScriptContext';

export const ScriptGenerationPage = () => {
    const { error, script } = useScriptContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (script) navigate('/app/resultado');
        if (error) navigate('/app/erro');
    }, [script, error, navigate]);

    return <ProcessingView />;
};
