import { useNavigate } from 'react-router-dom';
import { Paywall } from '../features/billing';

export const SalesPaywallPage = () => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        localStorage.setItem('hooky_pending_checkout', 'true');
        navigate('/signup');
    };

    return <Paywall onUpgrade={handleUpgrade} isRequired={true} />;
};
