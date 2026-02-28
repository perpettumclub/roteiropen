import { useNavigate } from 'react-router-dom';
import { ConfirmationScreen } from '../features/script';
import { useScriptContext } from '../shared/context/ScriptContext';

export const ConfirmationPage = () => {
    const navigate = useNavigate();
    const { transcription, confirmedProblem, confirmedSolution, confirmProblemSolution } = useScriptContext();

    const handleConfirm = (prob: string, sol: string) => {
        confirmProblemSolution(prob, sol);
        navigate('/app/remix');
    };

    return (
        <ConfirmationScreen
            transcription={transcription}
            problem={confirmedProblem}
            solution={confirmedSolution}
            onConfirm={handleConfirm}
            onBack={() => navigate('/app/gravar')}
        />
    );
};
