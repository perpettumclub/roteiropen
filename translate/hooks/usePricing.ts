/**
 * Hook para usar no Frontend
 * 
 * Uso:
 * const { pricing, loading } = usePricing();
 * 
 * if (pricing.gateway === 'stripe') {
 *   // Mostra Stripe checkout
 * } else {
 *   // Mostra Mercado Pago checkout
 * }
 */

import { useState, useEffect } from 'react';

interface Pricing {
    gateway: 'mercadopago' | 'stripe';
    price: number;
    currency: 'BRL' | 'USD';
    symbol: string;
    displayPrice: string;
    country: string;
}

const DEFAULT_PRICING: Pricing = {
    gateway: 'mercadopago',
    price: 67,
    currency: 'BRL',
    symbol: 'R$',
    displayPrice: 'R$ 67',
    country: 'BR'
};

export function usePricing() {
    const [pricing, setPricing] = useState<Pricing>(DEFAULT_PRICING);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPricing() {
            try {
                const response = await fetch('/api/get-pricing');

                if (!response.ok) {
                    throw new Error('Failed to fetch pricing');
                }

                const data = await response.json();
                setPricing(data);
            } catch (err) {
                console.error('Error fetching pricing:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Em caso de erro, usa padrão Brasil (mais seguro)
                setPricing(DEFAULT_PRICING);
            } finally {
                setLoading(false);
            }
        }

        fetchPricing();
    }, []);

    return { pricing, loading, error };
}
