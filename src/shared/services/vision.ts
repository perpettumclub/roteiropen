
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * All metrics that can be extracted from Instagram prints.
 * These fields match the Supabase social_metrics table (migration 24).
 */
export interface ExtractedMetrics {
    // From Profile Print
    seguidores?: number;      // followers count
    followers?: number;       // alias for backwards compat
    seguindo?: number;        // following count
    posts?: number;           // total posts
    username?: string;

    // From Insights Print (REQUIRED for engagement calculation)
    contas_alcancadas?: number;       // accounts reached
    contas_com_engajamento?: number;  // accounts engaged
    impressoes?: number;              // impressions
    interacoes?: number;              // total interactions
    cliques_site?: number;            // website clicks
    cliques_email?: number;           // email clicks
    visitas_perfil?: number;          // profile visits
    saves?: number;                   // saves
    shares?: number;                  // shares
    likes_periodo?: number;           // likes in period
    comentarios_periodo?: number;     // comments in period

    // Calculated
    engajamento_percent?: number;     // (interacoes / contas_alcancadas) * 100

    // Legacy fields (backwards compat)
    avgLikes?: number;
    avgComments?: number;
}

export async function analyzeProfileImage(base64Image: string): Promise<ExtractedMetrics> {
    if (!OPENAI_API_KEY) {
        console.warn('OpenAI API Key missing. Returning mock data.');
        await new Promise(r => setTimeout(r, 2000));
        return {
            seguidores: 12500,
            followers: 12500,
            username: '@mock_user',
            contas_alcancadas: 15000,
            interacoes: 1200,
            engajamento_percent: 8.0
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
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are an expert at extracting data from Instagram screenshots (Profile and Insights screens).
                        
CONTEXT: The user uploads TWO screenshots:
1. Profile screenshot - shows: followers (seguidores), following (seguindo), posts count, username
2. Insights screenshot - shows: accounts reached, accounts engaged, impressions, interactions, website clicks, profile visits, saves, shares, likes, comments

IMPORTANT RULES:
1. Handle Portuguese number formats: "1.000" = 1000 (thousand separator is dot). "1,5 M" = 1500000.
2. If a value shows 'k' (e.g., 10k), multiply by 1000. If 'M' or 'mi', multiply by 1000000.
3. Extract EXACTLY what is visible. Do NOT invent data.
4. If a field is not visible, set it to null.
5. For Insights screens, look for:
   - "Contas alcançadas" or "Accounts reached" → contas_alcancadas
   - "Contas com engajamento" or "Accounts engaged" → contas_com_engajamento
   - "Impressões" or "Impressions" → impressoes
   - "Interações" or "Interactions" → interacoes
   - "Toques no site" or "Website clicks" → cliques_site
   - "Toques no e-mail" → cliques_email
   - "Visitas ao perfil" or "Profile visits" → visitas_perfil
   - "Salvamentos" or "Saves" → saves
   - "Compartilhamentos" or "Shares" → shares
   - "Curtidas" or "Likes" → likes_periodo
   - "Comentários" or "Comments" → comentarios_periodo

Return a valid JSON with these exact keys:
{
    "seguidores": number | null,
    "seguindo": number | null,
    "posts": number | null,
    "username": string | null,
    "contas_alcancadas": number | null,
    "contas_com_engajamento": number | null,
    "impressoes": number | null,
    "interacoes": number | null,
    "cliques_site": number | null,
    "cliques_email": number | null,
    "visitas_perfil": number | null,
    "saves": number | null,
    "shares": number | null,
    "likes_periodo": number | null,
    "comentarios_periodo": number | null,
    "engajamento_percent": number | null
}

For engajamento_percent: Calculate as (interacoes / contas_alcancadas) * 100 if both values exist. Otherwise null.`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract ALL metrics from this Instagram screenshot. Include followers from profile AND engagement data from insights if visible." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Ensure backwards compatibility
            if (parsed.seguidores && !parsed.followers) {
                parsed.followers = parsed.seguidores;
            }
            if (parsed.followers && !parsed.seguidores) {
                parsed.seguidores = parsed.followers;
            }



            return parsed;
        }

        throw new Error('Could not parse JSON from response');

    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
}
