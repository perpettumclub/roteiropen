/**
 * YouTube Service
 * Handles YouTube video information fetching via oEmbed
 */

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
 * Fetch info for multiple YouTube URLs
 */
export async function fetchMultipleYouTubeInfo(urls: string[]): Promise<YouTubeVideoInfo[]> {
    const infoPromises = urls.map(fetchYouTubeInfo);
    const results = await Promise.all(infoPromises);
    return results.filter((r): r is YouTubeVideoInfo => r !== null);
}
