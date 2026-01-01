

// Re-using the same secure API setup logic
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface DailyChallengePrompt {
    title: string;
    description: string;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

const CHALLENGE_SYSTEM_PROMPT = `Você é um mentor criativo especializado em desbloquear a criatividade de criadores de conteúdo.
Sua missão é criar UM desafio diário rápido e acionável para um criador de conteúdo, baseado no nicho dele.

REGRAS:
1. O desafio deve ser POSSÍVEL de fazer em menos de 15 minutos.
2. Deve ser específico para o nicho (se fornecido).
3. Deve ter um título curto e impactante.
4. Deve ter uma descrição clara do que gravar.
5. Use emojis.

Responda APENAS em JSON no seguinte formato:
{
    "title": "Título do Desafio",
    "description": "Instrução clara do que fazer (máx 2 frases).",
    "difficulty": "Fácil" | "Médio" | "Difícil"
}`;

export async function generateDailyChallenge(niche: string): Promise<DailyChallengePrompt> {
    // If no API key, return a fallback immediately to avoid errors
    if (!OPENAI_API_KEY) {
        return {
            title: "Desafio do Nicho",
            description: `Crie um vídeo rápido sobre uma curiosidade do nicho de ${niche}.`,
            difficulty: "Fácil"
        };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: CHALLENGE_SYSTEM_PROMPT },
                    { role: 'user', content: `Gere um desafio criativo para um criador do nicho: ${niche || "Geral"}` }
                ],
                temperature: 0.8,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate challenge');
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content;
    } catch (error) {
        console.error('Error generating challenge:', error);
        // Fallback in case of error
        return {
            title: "Storyteller Nato",
            description: "Conte uma história pessoal que se conecta com seu público hoje.",
            difficulty: "Médio"
        };
    }
}
