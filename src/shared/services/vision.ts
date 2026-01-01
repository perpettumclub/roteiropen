
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface ExtractedMetrics {
    followers?: number;
    avgLikes?: number;
    avgComments?: number;
    username?: string;
}

export async function analyzeProfileImage(base64Image: string): Promise<ExtractedMetrics> {
    if (!OPENAI_API_KEY) {
        console.warn('OpenAI API Key missing. Returning mock data.');
        await new Promise(r => setTimeout(r, 2000));
        return {
            followers: 12500,
            username: '@mock_user'
        };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert at extracting data from social media screenshots. 
                        Analyze the image and extract the following:
                        1. Follower count (convert 'k' to 000, 'm' to 000000, etc)
                        2. Username (if visible)
                        3. Any visible engagement metrics (likes/comments averages if explicitly shown in an insights view).
                        
                        Return ONLY a valid JSON object with these keys: "followers" (number), "username" (string), "avgLikes" (number, optional), "avgComments" (number, optional).`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract metrics from this profile screenshot." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 300
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Could not parse JSON from response');

    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
}
