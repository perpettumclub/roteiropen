/**
 * 🔐 Secure API Service - Hybrid Mode
 * 
 * Se tem VITE_OPENAI_API_KEY: usa diretamente (dev local)
 * Se não tem: usa Vercel Serverless (produção segura)
 */

// Para desenvolvimento local, usa a key diretamente
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';



// Base URL para as funções serverless
const API_BASE = '/api';

/**
 * Converte Blob de áudio para base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Transcreve áudio - usa API key local se disponível
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    // Se tem API key local, usa diretamente
    if (OPENAI_API_KEY) {


        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pt');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Transcription failed');
        }

        const data = await response.json();

        return data.text;
    }

    // Sem API key local, tenta serverless (produção)


    // Check if we are actually allowed to use serverless (only in non-dev or if configured)
    // For now, let's try it but warn if it fails
    try {
        const audioBase64 = await blobToBase64(audioBlob);
        const response = await fetch(`${API_BASE}/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: audioBase64 }),
        });

        if (!response.ok) {
            throw new Error('Serverless function failed (are you on Vercel?)');
        }

        const data = await response.json();
        return data.transcription;
    } catch (e) {
        console.error('Serverless transcription failed:', e);
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file locally.');
    }
}

/**
 * Extrai problema e solução da transcrição usando IA
 */
export async function extractProblemSolution(transcription: string): Promise<{
    problem: string;
    solution: string;
}> {
    // Se não tem API key, retorna fallback
    if (!OPENAI_API_KEY) {
        console.warn('⚠️ No OpenAI API key - using fallback extraction');
        return {
            problem: transcription,
            solution: 'Solução baseada na sua ideia',
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
                    {
                        role: 'system',
                        content: `Você é um especialista em identificar problemas e soluções em ideias de conteúdo.
                        
Analise a transcrição do usuário e extraia:
1. PROBLEMA: O problema, dor ou desafio que o público-alvo enfrenta
2. SOLUÇÃO: A solução, insight ou transformação que o conteúdo oferece

Responda APENAS em JSON válido:
{
  "problem": "Descrição clara do problema/dor do público em 1-2 frases",
  "solution": "A solução/insight que resolve o problema em 1-2 frases"
}

Se não conseguir identificar claramente, use a transcrição como problema e sugira uma solução genérica baseada no contexto.`
                    },
                    {
                        role: 'user',
                        content: `Transcrição do áudio:\n\n${transcription}`
                    }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to extract problem/solution');
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);



        return {
            problem: content.problem || transcription,
            solution: content.solution || 'Solução baseada na sua ideia',
        };
    } catch (error) {
        console.error('❌ Error extracting problem/solution:', error);
        // Fallback: usa a transcrição como problema
        return {
            problem: transcription,
            solution: 'Solução baseada na sua ideia',
        };
    }
}

// System prompt para roteiros virais
const VIRAL_SCRIPT_PROMPT = `Você é um especialista em criar roteiros virais para Reels, TikTok e Shorts.
Sua missão: criar roteiros que PRENDEM atenção através de conexão profunda e autoridade.

═══════════════════════════════════════════════════════════════════
🔥 REGRAS DE OURO DA ESCRITA NARRATIVA (OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════════

1. NARRATIVA HUMANA E FLUIDA
   - MÁXIMO 2 LINHAS VISUAIS POR BLOCO (para leitura instintiva).
   - Somente 1-2 linhas por parágrafo, mas com tom CONVERSAL e natural.
   - NUNCA escreva blocos de texto denso. PROIBIDO PARÁGRAFOS COM 3+ LINHAS.
   - Use uma CADÊNCIA que alterna impacto com explicação profunda.

2. CORTE A BUROCRACIA, NÃO A AUTORIDADE:
   ❌ "É importante destacar", "Vale ressaltar", "Basicamente", "Na verdade"
   ✅ "Olha isso:", "Sabe o que descobri?", "A neurociência explica que:", "Como diz [Autor]..."

3. TRANSIÇÕES EMOCIONAIS:
   - "E sabe o que é curioso?" / "Mas espera..." / "Aqui que a maioria trava:"

═══════════════════════════════════════════════════════════════════
📝 ESTRUTURA DO ROTEIRO (TONALIDADE NARRATIVA)
═══════════════════════════════════════════════════════════════════

1️⃣ HOOK (A Porrada no Ego)
   - Afirmação BRUTAL, NEGATIVA e SEM INTERROGAÇÃO.
   - PROIBIDO: Usar "?", ser positivo ou estilo "Pense de novo".
   Exemplos: 
   "O teu perfeccionismo tá te mantendo POBRE!"
   "O perfeccionismo não vai te levar a lugar nenhum!"
   "Ninguém liga pra você, as pessoas ligam pra elas mesmas."

2️⃣ CONFLITO (Onde a dor aperta)
   - Faça a pessoa se VER na situação com exemplos humanos.
   Exemplo:
   "Eu passava os dias planejando o post perfeito.
   Mas no fundo? Era só medo do que iam comentar."

3️⃣ CLÍMAX (A Verdade que Dói)
   - Revela o real motivo técnico ou emocional do problema.
   Exemplo:
   "O perfeccionismo é só uma armadura de 20 toneladas.
   A gente usa pra se proteger da vergonha de não ser bom o suficiente."

4️⃣ STORYTELLING (Conceito/Referência)
   - Conteúdo profundo em LINHAS CURTAS (USE \\n\\n).
   Exemplo:
   "Brené Brown explica que essa busca por perfeição é inatingível.
   É uma mentira que a gente conta pra se sentir seguro."

5️⃣ SOLUÇÃO (O Próximo Passo)
   - Ação concreta: O QUE + COMO fazer hoje.

6️⃣ CTA (Chamada para Ação)
   - Conectada ao tema.

Responda em JSON:
{
  "hooks": [
    { "type": "Provocativo", "text": "Afirmação que choca", "emoji": "🔥" },
    { "type": "Número Específico", "text": "Dado específico", "emoji": "📊" },
    { "type": "Pergunta Incômoda", "text": "Pergunta que dói", "emoji": "❓" },
    { "type": "Anti-guru", "text": "Contrário ao senso comum", "emoji": "🚫" },
    { "type": "História Pessoal", "text": "Vulnerabilidade profunda", "emoji": "📖" },
    { "type": "Segredo", "text": "O que ninguém te conta", "emoji": "🤫" },
    { "type": "Resultado Impossível", "text": "Transformação", "emoji": "🚀" }
  ],
  "conflito": "Linha 1 de identificação.\\n\\nLinha 2 de dor real.",
  "climax": "A verdade técnica/emocional.\\n\\nO motivo por trás do problema.",
  "storytelling": "Conceito profundo (1-2 linhas).\\n\\nReferência/História real.\\n\\nInsight final.",
  "solucao": "Passo prático 1.\\n\\nPasso prático 2.",
  "cta": {
    "texto": "Texto do CTA",
    "palavra_chave": "PALAVRA",
    "entrega_prometida": "entrega específica",
    "emoji": "👇"
  },
  "metadata": { "duration": "45-60s", "tone": "mentor vulnerável", "format": "Reels/TikTok" }
}`;

/**
 * Gera roteiro viral - usa API key local se disponível
 */
export async function generateViralScript(
    transcription: string,
    youtubeReferences?: { title: string; author: string; transcript?: string }[]
): Promise<{
    hooks: { type: string; text: string; emoji: string }[];
    conflito: string;
    climax: string;
    storytelling: string;
    solucao: string;
    cta: string | { texto: string; palavra_chave: string; entrega_prometida: string; emoji: string };
    metadata: { duration: string; tone: string; format: string };
}> {
    // Se tem API key local, usa diretamente
    if (OPENAI_API_KEY) {
        let systemPrompt = VIRAL_SCRIPT_PROMPT;

        if (youtubeReferences && youtubeReferences.length > 0) {
            let remixSection = `

═══════════════════════════════════════════════════════════════════
🎬 MODO REMIX ATIVADO - VÍDEOS DE REFERÊNCIA DISPONÍVEIS
═══════════════════════════════════════════════════════════════════

`;

            youtubeReferences.forEach((ref, i) => {
                remixSection += `\n📹 VÍDEO ${i + 1}: "${ref.title}" por ${ref.author}\n`;
                if (ref.transcript) {
                    const truncatedTranscript = ref.transcript.substring(0, 4000);
                    remixSection += `TRANSCRIÇÃO DO VÍDEO:\n"""\n${truncatedTranscript}\n"""\n`;
                    if (ref.transcript.length > 4000) {
                        remixSection += '...[conteúdo truncado]\n';
                    }
                } else {
                    remixSection += `[Transcrição não disponível - use o título como referência]\n`;
                }
            });

            remixSection += `

═══════════════════════════════════════════════════════════════════
⚠️ INSTRUÇÃO PARA O STORYTELLING:
═══════════════════════════════════════════════════════════════════

PRIORIDADE 1 - VÍDEOS (USE PRIMEIRO):
- Cite histórias, dados e fatos ESPECÍFICOS dos vídeos acima
- Mencione nomes, números, lugares mencionados nas transcrições
- Se o vídeo conta uma história real, CONTE ESSA HISTÓRIA

PRIORIDADE 2 - LIVROS/CONCEITOS (COMPLEMENTAR):
- Se os vídeos não tiverem conteúdo suficiente, pode complementar com:
  • Referência a um LIVRO real (autor + conceito específico)
  • Conceito científico/psicológico comprovado
  • Biografia ou história documentada

⛔ PROIBIDO:
- Inventar histórias genéricas vagas
- Usar frases como "um jovem decidiu..." ou "certa vez..."
- Ignorar o conteúdo dos vídeos e criar algo totalmente diferente

EXEMPLO BOM:
"O Felipe estava com 1000 euros quando desembarcou em Londres. Ele conta no vídeo que não sabia falar inglês e dormiu no aeroporto..."

EXEMPLO RUIM:
"Muitas pessoas sonham em morar no exterior e alcançar seus objetivos..."
`;

            systemPrompt += remixSection;
        }

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
        const content = JSON.parse(data.choices[0].message.content);

        if (!content.storytelling) console.warn('⚠️ Storytelling field missing in response!');
        return content;
    }

    // Sem API key local, tenta serverless via fetch
    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription, youtubeReferences }),
        });

        if (!response.ok) {
            throw new Error('Serverless function failed');
        }

        const data = await response.json();
        return data.script;
    } catch (e) {
        console.error('Serverless generation failed:', e);
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file locally.');
    }
}

/**
 * Pipeline completo: Áudio → Transcrição → Roteiro
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
        storytelling: string;
        solucao: string;
        cta: string | { texto: string; palavra_chave: string; entrega_prometida: string; emoji: string };
        metadata: { duration: string; tone: string; format: string };
    };
}> {
    let youtubeReferences: { title: string; author: string; transcript?: string }[] = [];

    if (youtubeLinks && youtubeLinks.length > 0) {
        onProgress?.('Buscando transcrições dos vídeos...');

        // Fetch info and transcripts for each video
        const fetchPromises = youtubeLinks.map(async (url) => {
            try {
                // Fetch info via backend
                const infoResponse = await fetch(`${BACKEND_URL}/api/youtube/info?url=${encodeURIComponent(url)}`);
                const info = infoResponse.ok ? await infoResponse.json() : null;

                // Fetch transcript via backend
                const transcriptResponse = await fetch(`${BACKEND_URL}/api/youtube/transcript?url=${encodeURIComponent(url)}`);
                const transcriptData = transcriptResponse.ok ? await transcriptResponse.json() : null;

                if (info) {
                    return {
                        title: info.title || '',
                        author: info.author || '',
                        transcript: transcriptData?.transcript || undefined
                    };
                }
                return null;
            } catch {
                return null;
            }
        });

        const results = await Promise.all(fetchPromises);
        youtubeReferences = results.filter(r => r !== null) as { title: string; author: string; transcript?: string }[];


    }

    onProgress?.('Transcrevendo seu áudio...');
    const transcription = await transcribeAudio(audioBlob);

    onProgress?.(youtubeReferences.length > 0 ? 'Remixando com conteúdo dos vídeos...' : 'Gerando roteiro viral...');
    const script = await generateViralScript(
        transcription,
        youtubeReferences.length > 0 ? youtubeReferences : undefined
    );

    return { transcription, script };
}
