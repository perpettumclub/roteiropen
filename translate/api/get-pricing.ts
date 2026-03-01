/**
 * API de Detecção de Pricing por País
 * 
 * Coloque este arquivo em: /api/get-pricing.ts (Vercel Edge Function)
 * 
 * Uso: A aplicação chama GET /api/get-pricing
 * Retorna: gateway (mercadopago/stripe), preço, moeda
 */

export const config = {
    runtime: 'edge',
};

interface PricingResponse {
    gateway: 'mercadopago' | 'stripe';
    price: number;
    currency: 'BRL' | 'USD';
    symbol: string;
    displayPrice: string;
    country: string;
}

export default function handler(request: Request): Response {
    // Vercel injeta o país do IP automaticamente neste header
    const country = request.headers.get('x-vercel-ip-country') || 'US';

    let pricing: PricingResponse;

    if (country === 'BR') {
        pricing = {
            gateway: 'mercadopago',
            price: 67,
            currency: 'BRL',
            symbol: 'R$',
            displayPrice: 'R$ 67',
            country: 'BR'
        };
    } else {
        // Resto do mundo = Stripe em USD
        pricing = {
            gateway: 'stripe',
            price: 67,
            currency: 'USD',
            symbol: '$',
            displayPrice: '$67',
            country: country
        };
    }

    return new Response(JSON.stringify(pricing), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        }
    });
}
