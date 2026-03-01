/**
 * Edge Function: create-checkout
 * 
 * Cria uma assinatura (preapproval) no Mercado Pago com:
 * - Trial de 3 dias grátis (cartão obrigatório)
 * - Cobrança automática de R$49,90/ano (ou R$67,90 após 100 assinantes)
 * - Redirecionamento para checkout do MP
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pricing tiers
const PRICE_EARLY = 49.90;   // Primeiros 100 assinantes
const PRICE_NORMAL = 67.90;  // A partir do 101º
const MAX_EARLY_SUBS = 100;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email, price, title } = await req.json()

    if (!user_id || !email) {
      throw new Error('Missing user_id or email')
    }

    // 1. Configurar Supabase Admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Preço dinâmico: contar assinantes ativos
    const { count, error: countError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const activeCount = count || 0;
    const currentPrice = activeCount >= MAX_EARLY_SUBS ? PRICE_NORMAL : PRICE_EARLY;

    console.log(`📊 Active subs: ${activeCount}, Price: R$${currentPrice}`);

    // 3. Buscar nome do usuário
    let payerName = 'Membro Hooky';
    const { data: userData } = await supabase.auth.admin.getUserById(user_id);
    if (userData?.user?.user_metadata?.full_name) {
      payerName = userData.user.user_metadata.full_name;
    }

    // 4. Criar Preapproval (Assinatura) via API REST do Mercado Pago
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) throw new Error('MP_ACCESS_TOKEN not configured');

    const preapprovalBody = {
      reason: title || 'Hooky AI - Plano Anual',
      external_reference: user_id,
      payer_email: email,
      auto_recurring: {
        frequency: 12,
        frequency_type: 'months',
        transaction_amount: currentPrice,
        currency_id: 'BRL',
        free_trial: {
          frequency: 3,
          frequency_type: 'days'
        }
      },
      back_url: 'https://hookyai.com.br/app/gravar?status=success',
      status: 'pending'
    };

    console.log('📤 Creating preapproval:', JSON.stringify(preapprovalBody));

    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preapprovalBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('❌ MP Error:', JSON.stringify(mpData));
      throw new Error(mpData.message || 'Erro ao criar assinatura no Mercado Pago');
    }

    console.log('✅ Preapproval created:', mpData.id, '| init_point:', mpData.init_point);

    // 5. Registrar trial na tabela subscriptions (status = trialing)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3);

    await supabase.from('subscriptions').upsert({
      user_id: user_id,
      status: 'trialing',
      plan_name: 'anual',
      plan_price: currentPrice,
      started_at: new Date().toISOString(),
      expires_at: trialEnd.toISOString(), // Será atualizado pelo webhook quando cobrar
      payment_id: String(mpData.id),      // preapproval ID
      auto_renew: true
    }, { onConflict: 'user_id' });

    // 6. Liberar acesso imediato (trial ativo)
    await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: { tier: 'hooky_pro' }
    });
    await supabase.from('profiles').update({ tier: 'hooky_pro' }).eq('id', user_id);

    console.log(`🎉 Trial started for user ${user_id}, access granted`);

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        preapproval_id: mpData.id,
        price: currentPrice,
        trial_days: 3
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Checkout Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
