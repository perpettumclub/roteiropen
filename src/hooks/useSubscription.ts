import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MILLISECONDS_PER_DAY, PLAN_PRICE_BRL } from '../shared/constants';

interface Subscription {
    id: string;
    status: string;
    plan_name: string;
    plan_price: number;
    started_at: string;
    expires_at: string;
    auto_renew: boolean;
    days_remaining: number;
}

interface UseSubscriptionReturn {
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
    daysRemaining: number;
    autoRenew: boolean;
    isActive: boolean;
    toggleAutoRenew: () => Promise<boolean>;
    cancelSubscription: () => Promise<boolean>;
    refetch: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: subscriptionRows, error: rpcError } = await supabase.rpc('get_my_subscription');

            if (rpcError) {
                // Se não tiver assinatura, não é erro
                if (rpcError.code === 'PGRST116') {
                    setSubscription(null);
                    return;
                }
                throw rpcError;
            }

            if (subscriptionRows && subscriptionRows.length > 0) {
                setSubscription(subscriptionRows[0]);
            } else {
                setSubscription(null);
            }
        } catch (err: any) { // any: error type unknown, need .message access
            console.error('Error fetching subscription:', err);
            setError(err.message || 'Erro ao buscar assinatura');

            // Fallback para localStorage se Supabase falhar
            const startDate = localStorage.getItem('hooky_subscription_start');
            const endDate = localStorage.getItem('hooky_subscription_end');
            const autoRenew = localStorage.getItem('hooky_auto_renew') === 'true';

            if (startDate && endDate) {
                const end = new Date(endDate);
                const today = new Date();
                const daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / MILLISECONDS_PER_DAY));

                setSubscription({
                    id: 'local',
                    status: daysRemaining > 0 ? 'active' : 'expired',
                    plan_name: 'anual',
                    plan_price: PLAN_PRICE_BRL,
                    started_at: startDate,
                    expires_at: endDate,
                    auto_renew: autoRenew,
                    days_remaining: daysRemaining
                });
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleAutoRenew = useCallback(async (): Promise<boolean> => {
        if (!subscription) return false;

        const newValue = !subscription.auto_renew;

        try {

            const { error: rpcError } = await supabase.rpc('toggle_auto_renew', { new_value: newValue });

            if (rpcError) {
                console.error('Error toggling auto-renew:', rpcError);
                // Fallback para localStorage
                localStorage.setItem('hooky_auto_renew', newValue.toString());
            }


            setSubscription(prev => prev ? { ...prev, auto_renew: newValue } : null);
            return true;
        } catch (err) {
            console.error('Error toggling auto-renew:', err);
            // Fallback para localStorage
            localStorage.setItem('hooky_auto_renew', newValue.toString());
            setSubscription(prev => prev ? { ...prev, auto_renew: newValue } : null);
            return true;
        }
    }, [subscription]);

    // Cancelar assinatura via Edge Function (cancela no MP + reembolso + revoga acesso)
    const cancelSubscription = useCallback(async (): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { error: funcError } = await supabase.functions.invoke('cancel-subscription', {
                body: { user_id: user.id }
            });

            if (funcError) {
                console.error('Error cancelling subscription:', funcError);
                throw funcError;
            }





            localStorage.removeItem('hooky_auto_renew');
            setSubscription(prev => prev ? { ...prev, status: 'cancelled', auto_renew: false } : null);

            return true;
        } catch (err) {
            console.error('Error cancelling subscription:', err);
            return false;
        }
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    const daysRemaining = subscription?.days_remaining ?? 0;
    const autoRenew = subscription?.auto_renew ?? false;
    const isActive = subscription?.status === 'active' && daysRemaining > 0;

    return {
        subscription,
        loading,
        error,
        daysRemaining,
        autoRenew,
        isActive,
        toggleAutoRenew,
        cancelSubscription,
        refetch: fetchSubscription
    };
};
