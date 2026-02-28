import { useNavigate } from 'react-router-dom';
import { QuizFunnel } from '../features/onboarding';
import { useUser } from '../shared';

export const QuizPage = () => {
    const navigate = useNavigate();
    const { completeQuiz } = useUser();

    const handleComplete = (profile: any) => {
        completeQuiz(profile);
        navigate('/oferta');
    };

    return <QuizFunnel onComplete={handleComplete} />;
};
