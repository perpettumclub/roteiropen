import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';

const router = express.Router();

// Extract video ID from various YouTube URL formats
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// GET /api/youtube/info?url=... - Get video info
router.get('/info', async (req, res, next) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Fetch oEmbed info
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);

        if (!response.ok) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const data = await response.json();

        res.json({
            videoId,
            title: data.title,
            author: data.author_name,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/youtube/transcript?url=... - Get video transcript
router.get('/transcript', async (req, res, next) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const fullText = transcript.map(t => t.text).join(' ');

        res.json({
            videoId,
            transcript: fullText,
            segments: transcript
        });
    } catch (error) {
        // Transcript might not be available
        res.status(404).json({
            error: 'Transcript not available for this video',
            details: error.message
        });
    }
});

export default router;
