import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { useUser, LandingView } from '../shared';

export const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { hasCompletedQuiz } = useUser();

    const handleStart = () => {
        const onboardingComplete = localStorage.getItem('hooky_onboarding_complete');

        if (!onboardingComplete) {
            navigate('/onboarding');
        } else if (!hasCompletedQuiz) {
            navigate('/quiz');
        } else if (localStorage.getItem('hooky_pending_checkout') === 'true') {
            navigate('/checkout');
        } else if (!user) {
            localStorage.setItem('hooky_pending_checkout', 'true');
            navigate('/checkout');
        } else {
            navigate('/app/gravar');
        }
    };

    return <LandingView onStart={handleStart} onLogin={() => navigate('/login')} />;
};
