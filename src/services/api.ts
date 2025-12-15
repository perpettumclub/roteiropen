// API Service for Hooky
// Handles communication with OpenAI APIs (Whisper + GPT)

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.warn('⚠️ VITE_OPENAI_API_KEY not set. API calls will fail.');
}

/**
 * Extract YouTube video ID from URL
 */
function extractVideoId(url: string): string | null {
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

/**
 * Fetch YouTube video info using oEmbed (no API key needed)
 */
async function fetchYouTubeInfo(url: string): Promise<{ title: string; author: string } | null> {
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
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt'); // Portuguese

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.text;
}

/**
 * Extract problem and solution from transcription
 */
export async function extractProblemSolution(transcription: string): Promise<{
    problem: string;
    solution: string;
}> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Você é um especialista em analisar ideias para conteúdo viral.
Analise a transcrição do usuário e extraia:

1. PROBLEMA/DOR: Qual é o problema ou dor que o público-alvo enfrenta? (1-2 frases)
2. SOLUÇÃO/INSIGHT: Qual é a solução ou insight principal que resolve esse problema? (1-2 frases)

Responda em JSON:
{
  "problem": "O problema/dor identificado",
  "solution": "A solução/insight proposto"
}

Se não houver um problema/solução claro, faça uma sugestão baseada no contexto.`
                },
                { role: 'user', content: transcription }
            ],
            temperature: 0.5,
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to extract problem/solution');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

/**
 * Generate viral script using GPT-4o-mini
 */
export async function generateViralScript(
    transcription: string,
    youtubeReferences?: { title: string; author: string }[]
): Promise<{
    hooks: { type: string; text: string; emoji: string }[];
    conflito: string;
    climax: string;
    solucao: string;
    cta: string;
    metadata: {
        duration: string;
        tone: string;
        format: string;
    };
}> {
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

    // Add remix instructions if YouTube references provided
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Transforme esta ideia em um roteiro viral:\n\n${transcription}` }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Script generation failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('Empty response from GPT');
    }

    return JSON.parse(content);
}

/**
 * Full pipeline: Audio → Transcription → Script (with optional YouTube remix)
 */
export async function processAudioToScript(
    audioBlob: Blob,
    youtubeLinks?: string[],
    onProgress?: (step: string) => void
): Promise<{
    transcription: string;
    script: {
        hooks: { type: string; text: string; emoji: string }[];
        conflito: string;
        climax: string;
        solucao: string;
        cta: string;
        metadata: {
            duration: string;
            tone: string;
            format: string;
        };
    };
}> {
    // Fetch YouTube video info if links provided
    let youtubeReferences: { title: string; author: string }[] = [];

    if (youtubeLinks && youtubeLinks.length > 0) {
        onProgress?.('Analisando vídeos de referência...');

        const infoPromises = youtubeLinks.map(fetchYouTubeInfo);
        const results = await Promise.all(infoPromises);
        youtubeReferences = results.filter((r): r is { title: string; author: string } => r !== null);
    }

    onProgress?.('Transcrevendo áudio...');
    const transcription = await transcribeAudio(audioBlob);

    onProgress?.(youtubeReferences.length > 0 ? 'Remixando com vídeos virais...' : 'Gerando roteiro viral...');
    const script = await generateViralScript(transcription, youtubeReferences.length > 0 ? youtubeReferences : undefined);

    return { transcription, script };
}
