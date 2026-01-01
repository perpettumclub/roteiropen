// Follow this setup guide to integrate the SDK: https://github.com/mercadopago/sdk-js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Preference } from 'npm:mercadopago';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Initialize Mercado Pago with Access Token (from env)
        const client = new MercadoPagoConfig({
            accessToken: Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || '',
            options: { timeout: 5000 }
        });

        const preference = new Preference(client);

        // 2. Build the preference object
        // In a real app, you might pass the user's email or ID from the request body
        const { userEmail } = await req.json();

        const body = {
            items: [
                {
                    id: 'premium_sub',
                    title: 'Assinatura Premium Hooky',
                    quantity: 1,
                    unit_price: 29.90, // Example price
                    currency_id: 'BRL',
                    description: 'Acesso ilimitado a roteiros e IA.'
                }
            ],
            payer: {
                email: userEmail || 'test_user_123@testuser.com'
            },
            back_urls: {
                success: 'http://localhost:5173/payment/success', // Update with production URL
                failure: 'http://localhost:5173/payment/failure',
                pending: 'http://localhost:5173/payment/pending'
            },
            auto_return: 'approved',
        };

        // 3. Create the preference
        const result = await preference.create({ body });

        // 4. Return the checkout URL (init_point)
        return new Response(
            JSON.stringify({
                id: result.id,
                init_point: result.init_point,
                sandbox_init_point: result.sandbox_init_point
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
