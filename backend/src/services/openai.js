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
    // Mino's viral framework system prompt - NARRATIVE MODE
    let systemPrompt = `Você é um especialista em criar roteiros virais para Reels, TikTok e Shorts.
Sua missão: criar roteiros que PRENDEM atenção através de conexão profunda e autoridade.

═══════════════════════════════════════════════════════════════════
🔥 REGRAS DE OURO DA ESCRITA NARRATIVA (OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════════

1. NARRATIVA HUMANA E FLUIDA
   - MÁXIMO 2 LINHAS VISUAIS POR BLOCO (para leitura instintiva).
   - O texto deve parecer uma CONVERSA NATURAL, não um "poema" picado em frases sem sentido.
   - NUNCA escreva blocos de texto denso. PROIBIDO PARÁGRAFOS COM 3+ LINHAS.
   - Use uma CADÊNCIA que alterna impacto com explicação humana.

2. CORTE A BUROCRACIA, NÃO A AUTORIDADE:
   ❌ "É importante destacar", "Vale ressaltar", "Basicamente", "Na verdade"
   ✅ "Olha isso:", "Sabe o que descobri?", "A neurociência explica que:", "Como diz [Autor]..."

3. TRANSIÇÕES EMOCIONAIS:
   - "E sabe o que é curioso?" / "Mas espera..." / "Aqui que a maioria trava:"

═══════════════════════════════════════════════════════════════════
🎯 O HOOK (A PORRADA NO EGO - 100% PROVOCATIVO)
═══════════════════════════════════════════════════════════════════

O hook DEVE ser uma AFIRMAÇÃO BRUTAL, NEGATIVA e CONFRONTADORA.

🚫 PROIBIÇÃO ABSOLUTA:
- PROIBIDO usar interrogação (?) no hook. Não faça perguntas.
- PROIBIDO tons de curiosidade ou marketing ("Pense de novo", "Você sabia", "Impossível?").
- PROIBIDO ser positivo, esperançoso ou amigável.

EXEMPLOS OBRIGATÓRIOS (SIGA ESTE TOM):
- "O teu perfeccionismo não vai te levar a lugar nenhum!"
- "O teu perfeccionismo tá te mantendo POBRE!"
- "Sua falta de coragem é o que faz o seu conteúdo ser irrelevante."
- "Ninguém liga pra você. As pessoas só ligam pra elas mesmas."
- "Você é um covarde se escondendo atrás de 'planejamento'."

REGRA DE OURO: O hook deve ser uma "sentença de morte" para o ego do espectador. Se parecer amigável, você falhou.

═══════════════════════════════════════════════════════════════════
📝 ESTRUTURA NARRATIVA (Siga EXATAMENTE)
═══════════════════════════════════════════════════════════════════

1. HOOK: Insight profundo ou afirmação que gera identificação imediata.

2. CONFLITO: Mostre que entende a dor humanamente (use quebras de linha a cada 1-2 linhas).
   Exemplo:
   "Eu passava os dias planejando o post perfeito.
   A logo perfeita. O texto impecável.
   
   Mas no fundo?
   Era só medo do que iam comentar."

3. CLÍMAX / RUPTURA (O INSIGHT QUE MUDA TUDO):
   Apresente o dado ou conceito que quebra a expectativa do viewer.
   1️⃣ CONCEITO (Autoridade/Referência)
   2️⃣ CONTRASTE (Onde a pessoa está errando)
   3️⃣ INSIGHT (A nova forma de ver o mundo)

4. STORYTELLING / CONCEITO:
   Desenvolva o raciocínio. CITE FONTE ou HISTÓRIA real.
   O texto deve ter PROFUNDIDADE, mas mantendo o respiro visual.

5. SOLUÇÃO / AÇÃO (A VIRADA PRÁTICA):
   Responda: O QUE fazer agora para implementar esse novo mindset.

6. CTA: Chamada para ação CONECTADA AO TEMA.

═══════════════════════════════════════════════════════════
🎭 TOM DE VOZ (ESTILO BRENÉ BROWN)
═══════════════════════════════════════════════════════════

- "Mentor Vulnerável": Sincero, profundo e humano.
- Comece com VULNERABILIDADE ("Eu também achei que...", "Eu demorei pra aprender que...").
- Autoridade através da empatia, não do "sucesso inatingível".
- NUNCA soe como um robô de dicas curtas. Prefira parecer alguém contando um segredo importante.

IMPORTANTE: Gere 7 VARIAÇÕES DE HOOKS diferentes (uma de cada tipo) para o usuário escolher!

Responda APENAS em JSON válido:
{
  "hooks": [
    { "type": "Provocativo", "text": "Afirmação polêmica que choca", "emoji": "🔥" },
    { "type": "Número Específico", "text": "Hook com dados/valores concretos", "emoji": "📊" },
    { "type": "Pergunta que Dói", "text": "Pergunta que questiona a pessoa", "emoji": "❓" },
    { "type": "Anti-guru", "text": "Vai contra o senso comum", "emoji": "🚫" },
    { "type": "História Pessoal", "text": "Vulnerabilidade profunda", "emoji": "📖" },
    { "type": "Segredo", "text": "Promete informação exclusiva", "emoji": "🤫" },
    { "type": "Resultado Impossível", "text": "Transformação incrível", "emoji": "🚀" }
  ],
  "conflito": "Linha 1 de identificação.\\n\\nLinha 2 de dor real.",
  "climax": "A verdade técnica/emocional.\\n\\nInsight que muda o jogo.",
  "storytelling": "Conceito profundo (1-2 linhas).\\n\\nReferência ou História real.\\n\\nInsight final.",
  "solucao": "Passo prático 1.\\n\\nPasso prático 2.",
  "cta": "Comenta 'PALAVRA' se você também quer [PROMESSA]",
  "metadata": {
    "duration": "45-60 segundos",
    "tone": "mentor vulnerável",
    "format": "Reels/TikTok"
  }
}`;

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
