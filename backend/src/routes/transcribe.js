import express from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/openai.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/transcribe - Transcribe audio file
router.post('/', upload.single('audio'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const transcription = await transcribeAudio(req.file.buffer, req.file.mimetype);

        res.json({
            success: true,
            transcription
        });
    } catch (error) {
        next(error);
    }
});

export default router;
