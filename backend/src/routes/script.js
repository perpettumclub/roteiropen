import express from 'express';
import { generateViralScript } from '../services/openai.js';

const router = express.Router();

// POST /api/script/generate - Generate viral script
router.post('/generate', async (req, res, next) => {
    try {
        const { transcription, youtubeReferences, knowledgeContext } = req.body;

        if (!transcription) {
            return res.status(400).json({ error: 'Transcription is required' });
        }

        const script = await generateViralScript(
            transcription,
            youtubeReferences,
            knowledgeContext
        );

        res.json({
            success: true,
            script
        });
    } catch (error) {
        next(error);
    }
});

export default router;
