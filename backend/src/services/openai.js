import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Transcribe audio using Whisper
 */
export async function transcribeAudio(buffer, mimeType) {
    // Write buffer to temp file (OpenAI SDK requires file path)
    const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempPath, buffer);

    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: 'whisper-1',
            language: 'pt'
        });

        return transcription.text;
    } finally {
        // Clean up temp file
        fs.unlinkSync(tempPath);
    }
}

/**
 * Generate embedding for semantic search
 */
export async function generateEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
    });

    return response.data[0].embedding;
}

/**
 * Generate viral script with optional YouTube references and knowledge context
 */
export async function generateViralScript(transcription, youtubeReferences, knowledgeContext) {
    // Mino's viral framework system prompt
    let systemPrompt = `Você é um especialista em criar roteiros virais para Reels, TikTok e Shorts.
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
- "Se você ainda precisa da aprovação dos outros pra tomar decisão, empreender não é pra você."
- "Seu perfeccionismo não é qualidade. É só medo de ser julgado disfarçado de padrão alto."
- "Você não precisa de mais um curso. Você só precisa ter coragem de começar com o que já sabe."
- "A real é essa: você tá se escondendo atrás de 'planejamento' porque tem medo de colocar a cara."

REGRAS DO HOOK:
- Escreva em português brasileiro natural e conversacional
- Use "VOCÊ" falando diretamente com a pessoa
- A frase tem que fazer sentido gramatical completo
- Seja direto e claro, não enigmático
- Tom de amigo sincero, não de guru misterioso
- Máximo 2 frases curtas

═══════════════════════════════════════════════════════════
📝 ESTRUTURA OBRIGATÓRIA (Preencha TODAS as seções)
═══════════════════════════════════════════════════════════

Você DEVE preencher TODAS as 5 seções. Nenhuma pode ficar vazia.

1. HOOK: Afirmação provocativa que choca (1-2 frases)

2. CONFLITO: Mostre que você entende a dor da pessoa
   Exemplo: "Eu também era assim. Ficava planejando o dia perfeito e no final não fazia nada. Parecia que quanto mais eu estudava, menos eu agia."

3. CLÍMAX: O momento que você entendeu a verdade
   Exemplo: "Até que eu percebi uma coisa: eu tava usando informação como desculpa. Eu já sabia o suficiente, só tava com medo de errar."

4. SOLUÇÃO: O que você faz diferente agora
   Exemplo: "Agora toda vez que eu sinto vontade de 'pesquisar mais', eu paro e faço a coisa mais simples que eu consigo. Mesmo que fique ruim. Porque feito imperfeito ganha de perfeito adiado."

5. CTA: Chamada para ação natural
   Exemplo: "Se você também quer parar de travar, comenta 'AÇÃO' aqui que eu te mando o passo a passo."

═══════════════════════════════════════════════════════════
🎭 TOM DE VOZ
═══════════════════════════════════════════════════════════

- Fale como um amigo sincero que quer te ajudar
- Português brasileiro coloquial e natural
- Frases que fazem sentido completo
- Sem enrolação ou frases cortadas
- Pode ser direto mas não agressivo demais`;

    // Add knowledge context if provided
    if (knowledgeContext && knowledgeContext.length > 0) {
        systemPrompt += `

📚 CONTEXTO:
${knowledgeContext.map((k, i) => `${i + 1}. ${k.content.substring(0, 200)}...`).join('\n')}`;
    }

    // Add YouTube remix if provided
    if (youtubeReferences && youtubeReferences.length > 0) {
        const refsText = youtubeReferences
            .map((ref, i) => `${i + 1}. "${ref.title}" por ${ref.author}`)
            .join('\n');

        systemPrompt += `

🎬 MODO REMIX - Referências:
${refsText}
Combine com elementos virais desses vídeos.`;
    }

    systemPrompt += `

IMPORTANTE: Gere 7 VARIAÇÕES DE HOOKS diferentes (uma de cada tipo) para o usuário escolher!

Responda APENAS em JSON válido:
{
  "hooks": [
    { "type": "Provocativo", "text": "Afirmação polêmica que choca", "emoji": "🔥" },
    { "type": "Número Específico", "text": "Hook com dados/valores concretos", "emoji": "📊" },
    { "type": "Pergunta que Dói", "text": "Pergunta que questiona a pessoa", "emoji": "❓" },
    { "type": "Anti-guru", "text": "Vai contra o senso comum", "emoji": "🚫" },
    { "type": "História Pessoal", "text": "Vulnerabilidade e fracasso próprio", "emoji": "📖" },
    { "type": "Segredo", "text": "Promete informação exclusiva", "emoji": "🤫" },
    { "type": "Resultado Impossível", "text": "Transformação incrível", "emoji": "🚀" }
  ],
  "conflito": "Eu também era assim... (2-3 frases mostrando a dor/problema)",
  "climax": "Até que eu percebi... (1-2 frases com o insight)",
  "solucao": "Agora eu faço X... (2-3 frases com a solução prática)",
  "cta": "Comenta 'PALAVRA' se você também...",
  "metadata": {
    "duration": "45 segundos",
    "tone": "confrontador mas vulnerável",
    "format": "Reels/TikTok"
  }
}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Transforme esta ideia em um roteiro viral:\n\n${transcription}` }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
}
