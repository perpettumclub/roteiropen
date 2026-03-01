import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// IMPORTANTE: Carregar .env PRIMEIRO
dotenv.config();

// Importação dinâmica para garantir que process.env está preenchido
const startServer = async () => {
    // Importar rotas DEPOIS do dotenv.config()
    const { default: healthRoutes } = await import('./routes/health.js');
    const { default: transcribeRoutes } = await import('./routes/transcribe.js');
    const { default: youtubeRoutes } = await import('./routes/youtube.js');
    const { default: scriptRoutes } = await import('./routes/script.js');
    const { default: knowledgeRoutes } = await import('./routes/knowledge.js');
    const { default: paymentRoutes } = await import('./routes/payment.js');
    const { default: couponRoutes } = await import('./routes/coupon.js');

    const app = express();
    const PORT = process.env.PORT || 3001;

    // Middleware
    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:5555', 'http://localhost:3000', 'https://hookyai.com.br'],
        credentials: true
    }));
    app.use(express.json({ limit: '50mb' }));

    // Root route to avoid "Cannot GET /" confusion
    app.get('/', (req, res) => {
        res.send('Hooky Backend API is running successfully. Please access the frontend application on its respective port (e.g., 5555).');
    });

    // Routes
    app.use('/api/health', healthRoutes);
    app.use('/api/transcribe', transcribeRoutes);
    app.use('/api/youtube', youtubeRoutes);
    app.use('/api/script', scriptRoutes);
    app.use('/api/knowledge', knowledgeRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/coupon', couponRoutes);

    // Error handler
    app.use((err, req, res, next) => {
        console.error('Error:', err);
        res.status(500).json({
            error: err.message || 'Internal server error'
        });
    });

    app.listen(PORT, () => {
        console.log(`🚀 Hooky Backend running on http://localhost:${PORT}`);
    });
};

startServer().catch(console.error);

