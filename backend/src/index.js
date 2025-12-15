import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import healthRoutes from './routes/health.js';
import transcribeRoutes from './routes/transcribe.js';
import youtubeRoutes from './routes/youtube.js';
import scriptRoutes from './routes/script.js';
import knowledgeRoutes from './routes/knowledge.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/script', scriptRoutes);
app.use('/api/knowledge', knowledgeRoutes);

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
