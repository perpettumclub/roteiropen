import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// API key segura no servidor - NUNCA exposta no frontend
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt do Mino para roteiros virais
const VIRAL_SCRIPT_PROMPT = `Você é um especialista em criar roteiros virais para Reels, TikTok e Shorts.
Sua missão: criar roteiros que PRENDEM atenção nos primeiros 3 segundos.

═══════════════════════════════════════════════════════════
🎯 O HOOK PERFEITO (0-3 segundos)
═══════════════════════════════════════════════════════════

O hook precisa ser uma AFIRMAÇÃO POLÊMICA que choca a pessoa.
Algo que faz ela parar o scroll e pensar "pera, como assim?!"
Fale como se fosse um amigo jogando a real na cara dela.

EXEMPLOS DE HOOKS (português natural):
- "Você não quer ter sucesso de verdade. Se quisesse, já tinha parado de ficar rolando a tela do Instagram."
- "Você sabe que tá procrastinando agora, né? Esse vídeo é só mais uma desculpa pra não começar."
- "Produtividade é a maior mentira que te venderam. O problema não é falta de organização, é medo de fracassar."

REGRAS DO HOOK:
- Escreva em português brasileiro natural e conversacional
- Use "VOCÊ" falando diretamente com a pessoa
- Máximo 2 frases curtas

═══════════════════════════════════════════════════════════
📝 ESTRUTURA OBRIGATÓRIA
═══════════════════════════════════════════════════════════

1. HOOK: Afirmação provocativa que choca (1-2 frases)
2. CONFLITO: Mostre que você entende a dor da pessoa
3. CLÍMAX: O momento que você entendeu a verdade
4. SOLUÇÃO: O que você faz diferente agora
5. CTA: Chamada para ação natural

IMPORTANTE: Gere 7 VARIAÇÕES DE HOOKS diferentes!

Responda APENAS em JSON válido:
{
  "hooks": [
    { "type": "Provocativo", "text": "Afirmação polêmica", "emoji": "🔥" },
    { "type": "Número Específico", "text": "Hook com dados", "emoji": "📊" },
    { "type": "Pergunta que Dói", "text": "Pergunta que questiona", "emoji": "❓" },
    { "type": "Anti-guru", "text": "Vai contra o senso comum", "emoji": "🚫" },
    { "type": "História Pessoal", "text": "Vulnerabilidade", "emoji": "📖" },
    { "type": "Segredo", "text": "Promete exclusividade", "emoji": "🤫" },
    { "type": "Resultado Impossível", "text": "Transformação incrível", "emoji": "🚀" }
  ],
  "conflito": "Eu também era assim... (2-3 frases)",
  "climax": "Até que eu percebi... (1-2 frases)",
  "solucao": "Agora eu faço X... (2-3 frases)",
  "cta": "Comenta 'PALAVRA' se você também...",
  "metadata": {
    "duration": "45 segundos",
    "tone": "confrontador mas vulnerável",
    "format": "Reels/TikTok"
  }
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Apenas POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY environment variable is not set');
        return res.status(500).json({
            error: 'OpenAI API key not configured on server',
            hint: 'Add OPENAI_API_KEY to Vercel Environment Variables'
        });
    }

    try {
        const { transcription, youtubeReferences } = req.body;

        if (!transcription) {
            return res.status(400).json({ error: 'Transcription is required' });
        }

        // Construir prompt com referências YouTube se houver
        let systemPrompt = VIRAL_SCRIPT_PROMPT;

        if (youtubeReferences && youtubeReferences.length > 0) {
            const refsText = youtubeReferences
                .map((ref: { title: string; author: string }, i: number) =>
                    `${i + 1}. "${ref.title}" por ${ref.author}`
                )
                .join('\n');

            systemPrompt += `\n\n🎬 MODO REMIX - Referências:\n${refsText}\nCombine com elementos virais desses vídeos.`;
        }

        // Gerar roteiro com GPT
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Transforme esta ideia em um roteiro viral:\n\n${transcription}`
                }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from GPT');
        }

        const script = JSON.parse(content);

        return res.status(200).json({
            success: true,
            script,
        });
    } catch (error) {
        console.error('Script generation error:', error);
        return res.status(500).json({
            error: 'Script generation failed',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
