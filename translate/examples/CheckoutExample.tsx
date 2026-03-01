/**
 * Exemplo de como usar o gateway duplo no Checkout
 * 
 * Este arquivo mostra como integrar Mercado Pago (BR) e Stripe (Global)
 * no mesmo checkout, detectando automaticamente pelo país.
 */

import React from 'react';
import { usePricing } from '../hooks/usePricing';
import { useTranslation } from 'react-i18next';

// Componentes fictícios - você já tem o real
const MercadoPagoButton = ({ price }: { price: string }) => (
    <button className="btn-primary">
        Pagar {price} com Mercado Pago
    </button>
);

const StripeButton = ({ price }: { price: string }) => (
    <button className="btn-primary">
        Pay {price} with Card
    </button>
);

export function CheckoutExample() {
    const { t } = useTranslation();
    const { pricing, loading } = usePricing();

    if (loading) {
        return <div>{t('common.loading')}</div>;
    }

    return (
        <div className="checkout-container">
            <h1>{t('paywall.title')}</h1>

            {/* Preço se adapta automaticamente */}
            <div className="price-display">
                <span className="price">{pricing.displayPrice}</span>
                <span className="period">/ano</span>
            </div>

            {/* Gateway se adapta automaticamente */}
            {pricing.gateway === 'mercadopago' ? (
                <>
                    <MercadoPagoButton price={pricing.displayPrice} />
                    <p className="payment-methods">
                        💳 Cartão, Pix ou Boleto
                    </p>
                </>
            ) : (
                <>
                    <StripeButton price={pricing.displayPrice} />
                    <p className="payment-methods">
                        💳 Credit Card (Visa, Mastercard, Amex)
                    </p>
                </>
            )}

            {/* Debug info (remover em produção) */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#f0f0f0',
                borderRadius: '8px',
                fontSize: '0.8rem'
            }}>
                <strong>Debug Info:</strong>
                <pre>{JSON.stringify(pricing, null, 2)}</pre>
            </div>
        </div>
    );
}

/**
 * INTEGRAÇÃO COM SEU CheckoutScreen.tsx ATUAL:
 * 
 * 1. Importe o hook:
 *    import { usePricing } from '@/hooks/usePricing';
 * 
 * 2. No componente:
 *    const { pricing, loading } = usePricing();
 * 
 * 3. Substitua o preço fixo pelo dinâmico:
 *    - Antes: planPrice={49.90}
 *    - Depois: planPrice={pricing.price}
 * 
 * 4. Adicione lógica condicional pro gateway:
 *    if (pricing.gateway === 'stripe') {
 *      // Chama Stripe Checkout
 *      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
 *      await stripe.redirectToCheckout({ sessionId });
 *    } else {
 *      // Chama Mercado Pago (seu código atual)
 *      window.location.href = mercadoPagoUrl;
 *    }
 */
