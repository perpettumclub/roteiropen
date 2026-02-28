import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from '../features/onboarding';
import { useUser } from '../shared';

export const OnboardingPage = () => {
    const navigate = useNavigate();
    const { hasCompletedQuiz } = useUser();

    const handleComplete = () => {
        localStorage.setItem('hooky_onboarding_complete', 'true');

        if (!hasCompletedQuiz) {
            navigate('/quiz');
        } else {
            navigate('/app/gravar');
        }
    };

    return <OnboardingScreen onComplete={handleComplete} />;
};
