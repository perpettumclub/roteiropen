import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChallengeSignUpScreen } from '../features/auth';

export const ChallengeSignUpPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('hooky_redirect_to', '/checkout-desafio');
    }, []);

    return (
        <ChallengeSignUpScreen
            onSuccess={() => {
                navigate('/checkout-desafio');
            }}
            redirectPath="/checkout-desafio"
        />
    );
};
