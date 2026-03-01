"""
FALLBACK SYSTEM — Decisão Inteligente de Modelo
================================================

Analisa o áudio transcrito e decide automaticamente:
- GPT-4o-mini (barato/rápido) para áudios diretos
- Claude Sonnet 4.5 (caro/preciso) para áudios complexos/emocionais

Critérios de Score (0-10 pontos):
- Comprimento/densidade de ideias: até 3 pts
- Ambiguidade/contradições: até 2 pts  
- Frases incompletas: até 1 pt
- Emoção/vulnerabilidade: até 2 pts
- Storytelling pessoal: até 1 pt

SE score >= 5 → Sonnet (preserva centelha original)
SE score < 5  → 4o-mini (áudio direto, sem nuance)
"""

from typing import Dict, Tuple


class HookyFallbackSystem:
    
    def __init__(self):
        self.threshold = 5  # Score mínimo para upgrade
        
    def analyze_complexity(self, transcription: str) -> Dict:
        """
        Analisa complexidade do áudio e retorna score detalhado.
        """
        
        score = 0
        reasons = []
        
        # CRITÉRIO 1: Comprimento e densidade
        word_count = len(transcription.split())
        sentence_count = transcription.count('.') + transcription.count('?') + transcription.count('!')
        
        if word_count > 300:
            score += 2
            reasons.append(f"Áudio longo ({word_count} palavras) - risco de perder centelha")
        
        if sentence_count > 15:
            score += 1
            reasons.append(f"Múltiplas ideias ({sentence_count} frases) - síntese avançada necessária")
        
        # CRITÉRIO 2: Ambiguidade
        ambiguity_markers = [
            "mas tipo", "sei lá", "não sei se", "talvez", "tipo assim",
            "ou seja", "quer dizer", "meio que", "mais ou menos"
        ]
        
        ambiguity_count = sum(
            transcription.lower().count(marker) 
            for marker in ambiguity_markers
        )
        
        if ambiguity_count >= 3:
            score += 2
            reasons.append(f"Alta ambiguidade ({ambiguity_count}x) - 4o-mini força coerência artificial")
        
        # CRITÉRIO 3: Frases incompletas
        incomplete_markers = ["...", "tipo...", "é que...", "então..."]
        
        incomplete_count = sum(
            transcription.count(marker) 
            for marker in incomplete_markers
        )
        
        if incomplete_count >= 2:
            score += 1
            reasons.append("Frases incompletas detectadas - requer inferência implícita")
        
        # CRITÉRIO 4: Emoção/vulnerabilidade
        emotion_markers = [
            "medo", "ansiedade", "trava", "bloqueio", "vergonha", 
            "insegur", "fracass", "desespero", "cansado", "exausto"
        ]
        
        emotion_count = sum(
            1 for marker in emotion_markers 
            if marker in transcription.lower()
        )
        
        if emotion_count >= 2:
            score += 2
            reasons.append(f"Conteúdo emocional ({emotion_count} marcadores) - Sonnet lida melhor com nuance")
        
        # CRITÉRIO 5: Storytelling
        story_markers = [
            "um dia", "semana passada", "lembro que", "aconteceu que",
            "eu tava", "aí eu", "de repente", "quando eu"
        ]
        
        story_count = sum(
            1 for marker in story_markers 
            if marker in transcription.lower()
        )
        
        if story_count >= 3:
            score += 1
            reasons.append("Narrativa pessoal detectada - requer transformação em hook")
        
        return {
            "score": score,
            "threshold": self.threshold,
            "reasons": reasons,
            "recommendation": "sonnet" if score >= self.threshold else "4o-mini"
        }
    
    def should_upgrade(self, transcription: str) -> Tuple[bool, str, Dict]:
        """
        Decisão final: usar Sonnet ou 4o-mini?
        
        Returns:
            (deve_usar_sonnet: bool, justificativa: str, detalhes: dict)
        """
        
        analysis = self.analyze_complexity(transcription)
        
        if analysis["recommendation"] == "sonnet":
            justification = f"""
🔥 UPGRADE PARA SONNET RECOMENDADO

Score: {analysis["score"]}/{10} (threshold: {self.threshold})

Razões:
{chr(10).join(f"• {reason}" for reason in analysis["reasons"])}

O Sonnet vai preservar a CENTELHA original do áudio,
em vez de "arrumar demais" como o 4o-mini faria.
            """.strip()
            
            return True, justification, analysis
        
        else:
            justification = f"""
✅ 4O-MINI É SUFICIENTE

Score: {analysis["score"]}/{10} (threshold: {self.threshold})

O áudio é direto e objetivo.
O 4o-mini consegue processar sem perder valor.
            """.strip()
            
            return False, justification, analysis


# ============================================
# EXEMPLO DE USO
# ============================================

if __name__ == "__main__":
    
    fallback = HookyFallbackSystem()
    
    # TESTE 1: Áudio simples (deve usar 4o-mini)
    simple = """
    Eu quero falar sobre produtividade. 
    As pessoas pensam demais antes de agir.
    A solução é simples: faça menos, execute mais.
    """
    
    print("="*60)
    print("TESTE 1: Áudio Simples")
    print("="*60)
    
    should_upgrade, reason, details = fallback.should_upgrade(simple)
    print(reason)
    print(f"\nModelo recomendado: {'SONNET' if should_upgrade else '4O-MINI'}")
    
    # TESTE 2: Áudio complexo (deve usar Sonnet)
    complex = """
    Cara, tipo... eu fico pensando muito antes de gravar, sabe? 
    Aí quando vou gravar, já travei, não sai nada natural...
    É que eu tenho medo de parecer idiota, sei lá.
    Semana passada eu tava lá, tentando gravar pela décima vez,
    e de repente eu percebi: o problema não é falta de ideia.
    É excesso de controle. Meio que eu tô com vergonha de ser eu mesmo.
    Talvez seja ansiedade, ou sei lá, insegurança mesmo.
    """
    
    print("\n" + "="*60)
    print("TESTE 2: Áudio Complexo")
    print("="*60)
    
    should_upgrade, reason, details = fallback.should_upgrade(complex)
    print(reason)
    print(f"\nModelo recomendado: {'SONNET' if should_upgrade else '4O-MINI'}")
    print(f"\nDetalhes: {details}")
