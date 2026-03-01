import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Supabase client (usando service role para acesso completo)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

/**
 * POST /api/coupon/validate
 * Valida um cupom e retorna informações de desconto
 */
router.post('/validate', async (req, res) => {
    try {
        const { code, originalPrice = 49.90 } = req.body;

        if (!code) {
            return res.status(400).json({
                valid: false,
                error: 'Código do cupom é obrigatório'
            });
        }

        console.log('🎫 Validating coupon:', code);

        // Se Supabase não estiver configurado, usar modo mock
        if (!supabase) {
            console.log('⚠️ Supabase not configured, using mock validation');

            // Mock: aceitar alguns cupons de teste
            const mockCoupons = {
                'TESTE50': { discount_type: 'percentage', discount_value: 50 },
                'TESTE10': { discount_type: 'fixed', discount_value: 10 },
                'LANCAMENTO': { discount_type: 'percentage', discount_value: 30 }
            };

            const upperCode = code.toUpperCase();
            if (mockCoupons[upperCode]) {
                const coupon = mockCoupons[upperCode];
                const discountAmount = coupon.discount_type === 'percentage'
                    ? originalPrice * (coupon.discount_value / 100)
                    : coupon.discount_value;
                const finalPrice = Math.max(0, originalPrice - discountAmount);

                return res.json({
                    valid: true,
                    coupon: {
                        code: upperCode,
                        discount_type: coupon.discount_type,
                        discount_value: coupon.discount_value
                    },
                    discount: {
                        original_price: originalPrice,
                        discount_amount: discountAmount,
                        final_price: finalPrice
                    }
                });
            }

            return res.status(400).json({
                valid: false,
                error: 'Cupom não encontrado'
            });
        }

        // Validação real via Supabase
        const { data, error } = await supabase.rpc('validate_coupon', {
            coupon_code: code
        });

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Erro ao validar cupom');
        }

        const result = data?.[0];

        if (!result || !result.is_valid) {
            return res.status(400).json({
                valid: false,
                error: result?.error_message || 'Cupom inválido'
            });
        }

        // Calcular desconto
        const discountAmount = result.discount_type === 'percentage'
            ? originalPrice * (result.discount_value / 100)
            : result.discount_value;
        const finalPrice = Math.max(0, originalPrice - discountAmount);

        console.log('✅ Coupon valid:', {
            code: result.code,
            discount_type: result.discount_type,
            discount_value: result.discount_value,
            final_price: finalPrice
        });

        res.json({
            valid: true,
            coupon: {
                id: result.id,
                code: result.code,
                discount_type: result.discount_type,
                discount_value: result.discount_value
            },
            discount: {
                original_price: originalPrice,
                discount_amount: discountAmount,
                final_price: finalPrice
            }
        });

    } catch (error) {
        console.error('❌ Coupon validation error:', error);
        res.status(500).json({
            valid: false,
            error: error.message || 'Erro ao validar cupom'
        });
    }
});

/**
 * POST /api/coupon/use
 * Registra o uso de um cupom após pagamento bem-sucedido
 */
router.post('/use', async (req, res) => {
    try {
        const { couponId, userId, subscriptionId, originalPrice, discountAmount, finalPrice } = req.body;

        if (!couponId || !userId) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        console.log('📝 Recording coupon use:', { couponId, userId });

        if (!supabase) {
            console.log('⚠️ Mock mode - coupon use recorded');
            return res.json({ success: true, mock: true });
        }

        // Registrar uso
        const { error: useError } = await supabase
            .from('coupon_uses')
            .insert({
                coupon_id: couponId,
                user_id: userId,
                subscription_id: subscriptionId,
                original_price: originalPrice,
                discount_amount: discountAmount,
                final_price: finalPrice
            });

        if (useError) {
            console.error('Error recording use:', useError);
            throw useError;
        }

        // Incrementar contador de uso
        const { error: updateError } = await supabase
            .from('coupons')
            .update({ current_uses: supabase.rpc('increment_uses', { row_id: couponId }) })
            .eq('id', couponId);

        // Alternativa simples para incrementar
        await supabase.rpc('increment_coupon_uses', { coupon_id: couponId }).catch(() => {
            // Se a função não existir, fazer update manual
            return supabase
                .from('coupons')
                .select('current_uses')
                .eq('id', couponId)
                .single()
                .then(({ data }) => {
                    return supabase
                        .from('coupons')
                        .update({ current_uses: (data?.current_uses || 0) + 1 })
                        .eq('id', couponId);
                });
        });

        console.log('✅ Coupon use recorded successfully');
        res.json({ success: true });

    } catch (error) {
        console.error('❌ Error recording coupon use:', error);
        res.status(500).json({ error: error.message || 'Erro ao registrar uso do cupom' });
    }
});

export default router;
