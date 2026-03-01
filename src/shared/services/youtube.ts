/**
 * YouTube Service
 * Handles YouTube video information and transcript fetching
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Extract YouTube video ID from URL
 */
export function extractVideoId(url: string): string | null {
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

export interface YouTubeVideoInfo {
    title: string;
    author: string;
    transcript?: string; // Optional transcript
}

/**
 * Fetch YouTube video info using oEmbed (no API key needed)
 */
export async function fetchYouTubeInfo(url: string): Promise<YouTubeVideoInfo | null> {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) return null;

        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);

        if (!response.ok) return null;

        const data = await response.json();
        return {
            title: data.title || '',
            author: data.author_name || ''
        };
    } catch {
        return null;
    }
}

/**
 * Fetch YouTube video transcript via backend API
 */
export async function fetchYouTubeTranscript(url: string): Promise<string | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/youtube/transcript?url=${encodeURIComponent(url)}`);

        if (!response.ok) return null;

        const data = await response.json();
        return data.transcript || null;
    } catch {
        return null;
    }
}

/**
 * Fetch info AND transcript for a YouTube video
 */
export async function fetchYouTubeInfoWithTranscript(url: string): Promise<YouTubeVideoInfo | null> {
    try {
        // Fetch info and transcript in parallel
        const [info, transcript] = await Promise.all([
            fetchYouTubeInfo(url),
            fetchYouTubeTranscript(url)
        ]);

        if (!info) return null;

        return {
            ...info,
            transcript: transcript || undefined
        };
    } catch {
        return null;
    }
}

/**
 * Fetch info for multiple YouTube URLs (basic - title/author only)
 */
export async function fetchMultipleYouTubeInfo(urls: string[]): Promise<YouTubeVideoInfo[]> {
    const infoPromises = urls.map(fetchYouTubeInfo);
    const results = await Promise.all(infoPromises);
    return results.filter((r): r is YouTubeVideoInfo => r !== null);
}

/**
 * Fetch info + transcripts for multiple YouTube URLs
 */
export async function fetchMultipleYouTubeInfoWithTranscripts(urls: string[]): Promise<YouTubeVideoInfo[]> {
    const infoPromises = urls.map(fetchYouTubeInfoWithTranscript);
    const results = await Promise.all(infoPromises);
    return results.filter((r): r is YouTubeVideoInfo => r !== null);
}
