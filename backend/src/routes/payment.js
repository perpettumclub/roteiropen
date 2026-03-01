import express from 'express';

const router = express.Router();

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

/**
 * POST /api/payment/process
 * Processa pagamento com cartão
 */
router.post('/process', async (req, res) => {
    try {
        const { token, payment_method_id, amount, plan = 'annual', payer } = req.body;

        console.log('📦 Processing card payment:', {
            amount,
            plan,
            payment_method_id,
            payer_email: payer?.email
        });

        // Simular processamento (em produção, chamar API do Mercado Pago)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockPaymentId = `card_${Date.now()}`;
        console.log('✅ Card payment approved:', mockPaymentId);

        res.json({
            id: mockPaymentId,
            status: 'approved',
            status_detail: 'accredited',
            payment_method_id: payment_method_id,
            date_approved: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Payment error:', error);
        res.status(400).json({
            error: error.message || 'Erro ao processar pagamento',
            status: 'error'
        });
    }
});

/**
 * POST /api/payment/pix/create
 * Cria pagamento PIX e retorna QR Code
 */
router.post('/pix/create', async (req, res) => {
    try {
        const { amount, email, description = 'Assinatura Hooky' } = req.body;

        console.log('📦 Creating PIX payment:', { amount, email });

        if (!MP_ACCESS_TOKEN) {
            // Modo mock se não tiver access token
            console.log('⚠️ MERCADOPAGO_ACCESS_TOKEN not set, using mock');

            const mockId = `pix_${Date.now()}`;
            const mockPixCode = `00020126580014br.gov.bcb.pix0136${mockId}5204000053039865802BR5925HOOKY6009SAO PAULO62070503***6304ABCD`;

            return res.json({
                id: mockId,
                status: 'pending',
                qr_code: mockPixCode,
                qr_code_base64: '',
                expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            });
        }

        // Criar pagamento PIX real via API do Mercado Pago
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            body: JSON.stringify({
                transaction_amount: amount,
                description: description,
                payment_method_id: 'pix',
                payer: {
                    email: email
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Mercado Pago error:', data);
            throw new Error(data.message || 'Erro ao criar pagamento PIX');
        }

        console.log('✅ PIX payment created:', data.id);

        res.json({
            id: data.id,
            status: data.status,
            qr_code: data.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
            expiration_date: data.date_of_expiration
        });

    } catch (error) {
        console.error('❌ PIX error:', error);
        res.status(400).json({
            error: error.message || 'Erro ao criar pagamento PIX',
            status: 'error'
        });
    }
});

/**
 * GET /api/payment/pix/status/:id
 * Verifica status do pagamento PIX
 */
router.get('/pix/status/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🔍 Checking PIX status:', id);

        if (!MP_ACCESS_TOKEN) {
            // Modo mock - simular aprovação após alguns segundos
            console.log('⚠️ Mock mode - simulating pending');
            return res.json({
                id: id,
                status: 'pending',
                status_detail: 'pending_waiting_payment'
            });
        }

        // Verificar status real via API do Mercado Pago
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao verificar pagamento');
        }

        console.log('📊 PIX status:', data.status);

        res.json({
            id: data.id,
            status: data.status,
            status_detail: data.status_detail,
            date_approved: data.date_approved
        });

    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(400).json({
            error: error.message || 'Erro ao verificar status',
            status: 'error'
        });
    }
});

export default router;

