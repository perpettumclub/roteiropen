import { useAuth } from '../features/auth';

export const useAdmin = () => {
    const { user } = useAuth();
    // Hardcoded admin email as per requirements
    const isAdmin = user?.email === 'felipevidalbk@gmail.com';
    return { isAdmin };
};
