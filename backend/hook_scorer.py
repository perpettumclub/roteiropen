"""
HOOK SCORER — Sistema de Avaliação de Ganchos Virais
=====================================================

Avalia e ranqueia os 5 hooks gerados, indicando qual tem maior 
chance de viralizar com base em critérios objetivos.

Sistema de Pontuação (0-100):
- Especificidade: 30 pts
- Prova Social/Autoridade: 20 pts
- Ataque à Dor Emocional: 25 pts
- Provocação/Contradição: 15 pts
- Concisão: 10 pts

Output: Ranking completo + hook vencedor + sugestões de melhoria
"""

import openai
import json
from typing import List, Dict


class HookScorer:
    
    SCORING_PROMPT = """
Você é um especialista em viralidade de conteúdo curto (TikTok/Reels/Shorts).

Sua função é avaliar hooks (ganchos) e dar um SCORE de 0-100 para cada um,
baseado em critérios objetivos de performance viral.

# CRITÉRIOS DE AVALIAÇÃO (TOTAL: 100 pontos):

## 1. ESPECIFICIDADE (30 pontos)
Quanto mais específico e "embaraçosamente detalhado", melhor.

- 25-30 pts: Embaraçosamente específico (ex: "Perdi 3 mil seguidores em 1 semana")
- 15-24 pts: Específico mas previsível (ex: "Perdi seguidores recentemente")
- 0-14 pts: Vago/amplo (ex: "Vou falar sobre crescimento")

## 2. PROVA SOCIAL / AUTORIDADE (20 pontos)
Estabelece confiança imediata com números ou resultados.

- 15-20 pts: Números concretos + resultado (ex: "100 milhões de impressões em 2 anos")
- 8-14 pts: Sugere experiência mas sem números (ex: "Depois de anos fazendo isso")
- 0-7 pts: Sem prova social

## 3. ATAQUE À DOR EMOCIONAL (25 pontos)
Atinge a dor REAL do espectador, não a superficial.

- 20-25 pts: Ataca dor real + específica (ex: "Você grava 10x porque sabe que tá sem graça")
- 10-19 pts: Ataca dor mas é genérica (ex: "Muita gente sofre com isso")
- 0-9 pts: Não ataca dor ou é irrelevante

## 4. PROVOCAÇÃO / CONTRADIÇÃO (15 pontos)
Desafia crença popular ou cria dissonância cognitiva.

- 12-15 pts: Forte contradição (ex: "Para de escrever roteiro. Isso tá te travando.")
- 6-11 pts: Levemente contraintuitivo (ex: "Talvez você esteja fazendo errado")
- 0-5 pts: Previsível, sem provocação

## 5. CONCISÃO (10 pontos)
Pode ser dito em quanto tempo?

- 8-10 pts: 1,5-2 segundos (ideal para Shorts)
- 4-7 pts: 3-4 segundos (aceitável)
- 0-3 pts: 5+ segundos (muito longo, perde atenção)

---

# REGRAS DE AVALIAÇÃO:

1. Seja BRUTAL e HONESTO
   - Não infle scores artificialmente
   - Se o hook é ruim, dê nota baixa
   
2. Compare com BENCHMARKS reais
   - Hooks virais têm 80+ pontos
   - Hooks medianos: 50-70 pontos
   - Hooks ruins: <50 pontos

3. Forneça FEEDBACK ACIONÁVEL
   - Se o hook tem baixo score, diga EXATAMENTE como melhorar
   - Seja específico: "Adicione números" ou "Troque X por Y"

---

# OUTPUT ESPERADO (JSON ESTRITO):

Retorne APENAS o JSON, sem markdown:

{
  "hooks_ranked": [
    {
      "posicao": 1,
      "hook": "texto do hook",
      "score_total": 85,
      "breakdown": {
        "especificidade": 28,
        "prova_social": 18,
        "ataque_dor": 22,
        "provocacao": 12,
        "concisao": 5
      },
      "pontos_fortes": ["lista de 2-3 pontos fortes"],
      "pontos_fracos": ["lista de 1-2 pontos fracos"],
      "sugestao_melhoria": "como melhorar este hook específico"
    }
  ],
  "vencedor": {
    "hook": "hook com maior score",
    "score": 85,
    "por_que_venceu": "explicação em 1-2 frases",
    "como_usar": "dica de execução (tom de voz, pausa, ênfase)"
  },
  "pior_hook": {
    "hook": "hook com menor score",
    "score": 42,
    "por_que_falhou": "explicação do problema principal"
  }
}

---

# EXEMPLO:

HOOKS PARA AVALIAR:
1. "Você não tá travado. Você tá com medo de parecer idiota."
2. "Deletei meu roteiro 30 segundos antes de gravar. Melhor vídeo que fiz."
3. "Quanto mais você pensa, pior fica."
4. "Seu roteiro perfeito tá matando seu vídeo."
5. "3h planejando. 3 segundos gravando. 0 views."

OUTPUT ESPERADO:
{
  "hooks_ranked": [
    {
      "posicao": 1,
      "hook": "Você não tá travado. Você tá com medo de parecer idiota.",
      "score_total": 88,
      "breakdown": {
        "especificidade": 27,
        "prova_social": 5,
        "ataque_dor": 25,
        "provocacao": 14,
        "concisao": 17
      },
      "pontos_fortes": [
        "Ataca a dor emocional REAL (medo de julgamento)",
        "Contradição forte (não é bloqueio, é medo)",
        "Usa 'você' para conexão direta"
      ],
      "pontos_fracos": [
        "Sem prova social/números"
      ],
      "sugestao_melhoria": "Adicionar contexto: 'Depois de gravar 100 vídeos, percebi: você não tá travado...'"
    }
  ],
  "vencedor": {
    "hook": "Você não tá travado. Você tá com medo de parecer idiota.",
    "score": 88,
    "por_que_venceu": "Ataca a dor real com contradição forte. Específico e pessoal.",
    "como_usar": "Pausar após 'travado'. Enfatizar 'medo' e 'idiota'."
  },
  "pior_hook": {
    "hook": "Quanto mais você pensa, pior fica.",
    "score": 58,
    "por_que_falhou": "Vago demais. Não especifica o que 'piora' ou contexto."
  }
}

---

IMPORTANTE:
- Retorne APENAS o JSON
- Sem ```json ou markdown
- JSON válido
- Seja BRUTAL na avaliação
"""

    def __init__(self, api_key: str = None):
        if api_key:
            openai.api_key = api_key
    
    def score_hooks(
        self, 
        hooks: List[str], 
        context: Dict = None
    ) -> Dict:
        """
        Avalia lista de hooks e retorna ranking completo.
        
        Args:
            hooks: Lista de 5 hooks para avaliar
            context: Contexto opcional {
                "publico_alvo": "criadores iniciantes 18-30",
                "nicho": "produtividade",
                "dor_principal": "bloqueio criativo"
            }
            
        Returns:
            Dict com ranking completo e análise
        """
        
        if len(hooks) != 5:
            return {
                "error": "É necessário exatamente 5 hooks para avaliação",
                "received": len(hooks)
            }
        
        # Formata os hooks
        hooks_text = "\n".join([
            f"{i+1}. {hook}" 
            for i, hook in enumerate(hooks)
        ])
        
        # Adiciona contexto se disponível
        context_text = ""
        if context:
            context_text = f"""
CONTEXTO DO VÍDEO:
- Público-alvo: {context.get('publico_alvo', 'N/A')}
- Nicho: {context.get('nicho', 'N/A')}
- Dor principal: {context.get('dor_principal', 'N/A')}
- Emoção detectada: {context.get('emocao', 'N/A')}

---
"""
        
        user_message = f"""
{context_text}
HOOKS PARA AVALIAR:
{hooks_text}

Avalie cada hook e retorne o JSON completo com ranking.
"""
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": self.SCORING_PROMPT
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                temperature=0.2,  # Baixa criatividade (consistência)
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Validação básica
            if "hooks_ranked" not in result or "vencedor" not in result:
                raise ValueError("Estrutura JSON inválida retornada")
            
            return result
            
        except json.JSONDecodeError as e:
            return {
                "error": "Falha ao parsear JSON",
                "details": str(e),
                "raw_response": response.choices[0].message.content
            }
        except Exception as e:
            return {
                "error": "Falha na avaliação",
                "details": str(e)
            }
    
    def format_for_display(self, scoring_result: Dict) -> str:
        """
        Formata o resultado para exibição bonita.
        """
        
        if "error" in scoring_result:
            return f"❌ ERRO: {scoring_result['error']}\n{scoring_result.get('details', '')}"
        
        # Ranking
        output = f"""
{'='*60}
🏆 RANKING DE HOOKS
{'='*60}
"""
        
        for ranked in scoring_result["hooks_ranked"]:
            pos = ranked["posicao"]
            hook = ranked["hook"]
            score = ranked["score_total"]
            breakdown = ranked["breakdown"]
            
            medal = "🥇" if pos == 1 else "🥈" if pos == 2 else "🥉" if pos == 3 else f"#{pos}"
            
            output += f"""
{medal} HOOK {pos} — Score: {score}/100
"{hook}"

Breakdown:
  • Especificidade: {breakdown['especificidade']}/30
  • Prova Social: {breakdown['prova_social']}/20
  • Ataque à Dor: {breakdown['ataque_dor']}/25
  • Provocação: {breakdown['provocacao']}/15
  • Concisão: {breakdown['concisao']}/10

✅ Pontos Fortes:
{chr(10).join(f"   - {p}" for p in ranked['pontos_fortes'])}

❌ Pontos Fracos:
{chr(10).join(f"   - {p}" for p in ranked.get('pontos_fracos', ['Nenhum']))}

💡 Sugestão de Melhoria:
   {ranked['sugestao_melhoria']}

{'─'*60}
"""
        
        # Vencedor
        vencedor = scoring_result["vencedor"]
        output += f"""

{'='*60}
🎯 HOOK VENCEDOR (Use Este!)
{'='*60}

"{vencedor['hook']}"

Score: {vencedor['score']}/100

Por que venceu:
{vencedor['por_que_venceu']}

Como executar:
{vencedor['como_usar']}

{'='*60}
"""
        
        # Pior hook (para aprendizado)
        if "pior_hook" in scoring_result:
            pior = scoring_result["pior_hook"]
            output += f"""

⚠️  PIOR HOOK (Evite Este Padrão)
"{pior['hook']}"
Score: {pior['score']}/100
Por quê: {pior['por_que_falhou']}

{'='*60}
"""
        
        return output


# ============================================
# EXEMPLO DE USO
# ============================================

if __name__ == "__main__":
    
    scorer = HookScorer()
    
    # Hooks gerados (exemplo do Hooky)
    hooks_to_evaluate = [
        "Você não tá travado. Você tá com medo de parecer idiota.",
        "Deletei meu roteiro 30 segundos antes de gravar. Melhor vídeo que fiz.",
        "Quanto mais você pensa, pior fica.",
        "Seu roteiro perfeito tá matando seu vídeo.",
        "3h planejando. 3 segundos gravando. 0 views."
    ]
    
    # Contexto do vídeo (do preprocessor)
    context = {
        "publico_alvo": "Criadores de conteúdo iniciantes (18-30 anos)",
        "nicho": "Produtividade e criação de conteúdo",
        "dor_principal": "Bloqueio criativo e medo de parecer amador",
        "emocao": "medo"
    }
    
    print("="*60)
    print("AVALIANDO HOOKS...")
    print("="*60)
    
    # Avalia
    result = scorer.score_hooks(hooks_to_evaluate, context)
    
    # Exibe formatado
    print(scorer.format_for_display(result))
    
    # JSON puro (para integração)
    print("\n" + "="*60)
    print("JSON COMPLETO (para logs/analytics):")
    print("="*60)
    print(json.dumps(result, indent=2, ensure_ascii=False))
