"""
AUDIO PREPROCESSOR — Limpeza e Estruturação de Áudio
=====================================================

Transforma áudio caótico em INPUT estruturado para geração de roteiro.

O que faz:
1. Remove ruído verbal ("ãh", "né", "tipo" excessivo)
2. Identifica a DOR REAL (não a superficial)
3. Extrai a FRASE-NÚCLEO (a ideia mais poderosa)
4. Detecta emoção dominante
5. Identifica o tipo de conteúdo
6. Encontra o ângulo magnético (contradição/reviravolta)

Output: JSON estruturado pronto para gerar roteiro viral
"""

import openai
import json
from typing import Dict


class AudioPreprocessor:
    
    SYSTEM_PROMPT = """
Você é um especialista em extrair a ESSÊNCIA de áudios bagunçados.

Sua função é transformar transcrições caóticas em INPUTS limpos para geração de roteiros virais.

# REGRAS CRÍTICAS:

## 1. PRESERVAR A CENTELHA
- NÃO "arrumar" a ideia original
- NÃO forçar coerência artificial
- MANTER a energia emocional do áudio

## 2. IDENTIFICAR A DOR REAL
- O que a pessoa DISSE vs. o que ela SENTE
- Qual é a dor emocional por trás das palavras?
- Exemplo: 
  - Dito: "Eu penso demais antes de gravar"
  - Real: "Tenho medo de parecer idiota"

## 3. EXTRAIR A FRASE-NÚCLEO
- Qual é a única frase que, se virasse um tweet, viralizaria?
- Deve ser CONTRAINTUITIVA ou ESPECÍFICA
- Máximo 15 palavras

## 4. LIMPAR SEM MATAR
- Remover: "ãh", "né", "tipo" (quando excessivo)
- MANTER: ambiguidade que revela vulnerabilidade
- Exemplo:
  - Ruim: "Tipo, ãh, sei lá, né..."
  - Bom: "sei lá" (se revela insegurança autêntica)

## 5. DETECTAR EMOÇÃO DOMINANTE
Identifique UMA emoção principal:
- medo
- ansiedade
- vergonha
- raiva
- frustração
- exaustão
- empolgação
- alívio

## 6. CLASSIFICAR TIPO DE CONTEÚDO
- desabafo (pessoa compartilhando dor/luta)
- tutorial (ensinando algo específico)
- provocação (desafiando crença comum)
- história (narrativa pessoal com arco)
- análise (quebrando um conceito)

## 7. ENCONTRAR ÂNGULO MAGNÉTICO
Qual é a reviravolta inesperada ou contradição?
Exemplos:
- "Quanto MENOS você planejar, MELHOR vai ficar"
- "Deletei 47 roteiros. Views triplicaram."
- "O problema não é falta de tempo. É excesso de escolhas."

---

# OUTPUT ESPERADO (JSON ESTRITO):

Retorne APENAS o JSON, sem markdown, sem explicações:

{
  "audio_original": "transcrição completa sem alterações",
  "audio_limpo": "transcrição sem ruído verbal excessivo",
  "dor_dita": "o que a pessoa disse que é o problema",
  "dor_real": "o que ela realmente sente (inferência emocional)",
  "frase_nucleo": "a ideia mais poderosa em 1 frase (max 15 palavras)",
  "emocao_detectada": "uma palavra: medo|ansiedade|vergonha|raiva|frustração|exaustão|empolgação|alívio",
  "tipo_conteudo": "desabafo|tutorial|provocação|história|análise",
  "angulo_magnetico": "a contradição ou reviravolta inesperada",
  "contexto_especifico": "detalhes concretos mencionados (números, locais, momentos)"
}

---

# EXEMPLOS:

## EXEMPLO 1:

INPUT:
"Cara, tipo... eu fico pensando muito antes de gravar, sabe? Aí quando vou gravar, né, já travei, não sai nada natural..."

OUTPUT:
{
  "audio_original": "Cara, tipo... eu fico pensando muito antes de gravar, sabe? Aí quando vou gravar, né, já travei, não sai nada natural...",
  "audio_limpo": "Eu fico pensando muito antes de gravar. Quando vou gravar, já travei, não sai nada natural.",
  "dor_dita": "Penso demais antes de gravar",
  "dor_real": "Tenho medo de parecer idiota e ser julgado",
  "frase_nucleo": "O problema não é falta de espontaneidade. É excesso de controle.",
  "emocao_detectada": "medo",
  "tipo_conteudo": "desabafo",
  "angulo_magnetico": "Quanto mais você planeja o roteiro, mais artificial fica",
  "contexto_especifico": "processo de gravação, momento de travar na frente da câmera"
}

## EXEMPLO 2:

INPUT:
"Eu passei 3 meses criando o produto perfeito. Lancei. Zero vendas. Aí fiz uma coisa tosca em 2 dias. Faturei 5K."

OUTPUT:
{
  "audio_original": "Eu passei 3 meses criando o produto perfeito. Lancei. Zero vendas. Aí fiz uma coisa tosca em 2 dias. Faturei 5K.",
  "audio_limpo": "Passei 3 meses criando o produto perfeito. Lancei. Zero vendas. Fiz uma coisa tosca em 2 dias. Faturei 5K.",
  "dor_dita": "Produto perfeito não vendeu",
  "dor_real": "Perfeccionismo impediu validação rápida",
  "frase_nucleo": "3 meses de perfeição = 0 vendas. 2 dias de execução = 5K.",
  "emocao_detectada": "frustração",
  "tipo_conteudo": "história",
  "angulo_magnetico": "Imperfeição rápida vence perfeição lenta",
  "contexto_especifico": "3 meses vs 2 dias, zero vendas vs 5K"
}

---

IMPORTANTE:
- Retorne APENAS o JSON
- Sem ```json ou qualquer markdown
- Sem explicações adicionais
- JSON válido e bem formatado
"""

    def __init__(self, api_key: str = None):
        if api_key:
            openai.api_key = api_key
    
    def preprocess(self, audio_transcription: str) -> Dict:
        """
        Processa o áudio e retorna estrutura JSON com insights.
        
        Args:
            audio_transcription: Texto transcrito do áudio
            
        Returns:
            Dict com estrutura limpa do áudio
        """
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": self.SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": f"Processe este áudio:\n\n{audio_transcription}"
                    }
                ],
                temperature=0.3,  # Baixa criatividade (precisão)
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Validação básica
            required_fields = [
                "audio_original", "audio_limpo", "dor_dita", 
                "dor_real", "frase_nucleo", "emocao_detectada",
                "tipo_conteudo", "angulo_magnetico"
            ]
            
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Campo obrigatório ausente: {field}")
            
            return result
            
        except json.JSONDecodeError as e:
            return {
                "error": "Falha ao parsear JSON",
                "details": str(e),
                "raw_response": response.choices[0].message.content
            }
        except Exception as e:
            return {
                "error": "Falha no pré-processamento",
                "details": str(e)
            }
    
    def format_for_display(self, processed: Dict) -> str:
        """
        Formata o output para exibição bonita no terminal.
        """
        
        if "error" in processed:
            return f"❌ ERRO: {processed['error']}\n{processed.get('details', '')}"
        
        output = f"""
{'='*60}
📝 ÁUDIO PRÉ-PROCESSADO
{'='*60}

🎤 ORIGINAL:
{processed['audio_original']}

🧹 LIMPO:
{processed['audio_limpo']}

---

💭 DOR DITA:
{processed['dor_dita']}

💔 DOR REAL:
{processed['dor_real']}

---

💎 FRASE-NÚCLEO:
{processed['frase_nucleo']}

😰 EMOÇÃO:
{processed['emocao_detectada'].upper()}

📊 TIPO:
{processed['tipo_conteudo'].upper()}

🔥 ÂNGULO MAGNÉTICO:
{processed['angulo_magnetico']}

📍 CONTEXTO:
{processed.get('contexto_especifico', 'N/A')}

{'='*60}
        """.strip()
        
        return output


# ============================================
# EXEMPLO DE USO
# ============================================

if __name__ == "__main__":
    
    preprocessor = AudioPreprocessor()
    
    # TESTE 1: Áudio de bloqueio criativo
    print("="*60)
    print("TESTE 1: Bloqueio Criativo")
    print("="*60)
    
    audio1 = """
    Cara, tipo... eu fico pensando muito antes de gravar, sabe? 
    Aí quando vou gravar, né, já travei, não sai nada natural...
    É que eu tenho medo de parecer idiota, sei lá.
    """
    
    result1 = preprocessor.preprocess(audio1)
    print(preprocessor.format_for_display(result1))
    
    # TESTE 2: História de produto
    print("\n" + "="*60)
    print("TESTE 2: História de Produto")
    print("="*60)
    
    audio2 = """
    Eu passei 3 meses criando o produto perfeito. 
    Lancei. Zero vendas. 
    Aí fiz uma coisa tosca em 2 dias. Faturei 5K.
    O problema não era o produto, era eu querendo que tudo fosse perfeito.
    """
    
    result2 = preprocessor.preprocess(audio2)
    print(preprocessor.format_for_display(result2))
    
    # TESTE 3: Export JSON puro (para usar no próximo step)
    print("\n" + "="*60)
    print("JSON PURO (para integração):")
    print("="*60)
    print(json.dumps(result1, indent=2, ensure_ascii=False))
