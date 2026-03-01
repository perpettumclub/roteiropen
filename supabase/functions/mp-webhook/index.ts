// Webhook para receber notificações do Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Payment } from 'npm:mercadopago';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // 1. Configurar Supabase Admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''; 
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Pegar dados do Webhook
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    if (topic !== 'payment') {
      return new Response(JSON.stringify({ message: 'Ignored non-payment topic' }), { status: 200 });
    }

    if (!id) {
       return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    // 3. Consultar MP
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) throw new Error('MP Token not set');

    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const payment = new Payment(client);
    
    const paymentData = await payment.get({ id: id });

    // 4. Se aprovado, liberar acesso
    if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference;

        if (!userId) {
            console.error('Payment approved but no user ID found');
            return new Response(JSON.stringify({ message: 'No user ID' }), { status: 200 });
        }

        console.log(`Liberando acesso para user: ${userId}`);

        // LÓGICA DE PRODUTOS BASEADA NO PREÇO
        const amount = paymentData.transaction_amount || 0;
        let tierToGrant = 'desafio_45'; // Padrão (App R$ 49,90)
        let planName = 'anual';

        // Se for o Desafio de R$ 297 (considerando margem de erro ou cupons)
        if (amount > 100) { 
            tierToGrant = 'challenge_297'; // Tier especial para quem comprou o desafio
            planName = 'desafio_vsl';
        }

        // Data de expiração (1 ano)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // A. Salvar na tabela de assinaturas
        await supabase.from('subscriptions').insert({
            user_id: userId,
            status: 'active',
            plan_name: planName,
            plan_price: amount,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            payment_id: String(paymentData.id),
            payment_method: paymentData.payment_type_id,
            auto_renew: false
        });

        // B. Atualizar perfil do usuário com o Tier correto
        await supabase
            .from('profiles')
            .update({ tier: tierToGrant })
            .eq('id', userId);
            
        // C. Atualizar metadados do Auth
        await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { tier: tierToGrant }
        });

        return new Response(JSON.stringify({ message: `Access granted: ${tierToGrant}` }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: 'Payment not approved yet' }), { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})
