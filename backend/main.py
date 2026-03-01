"""
HOOKY — Sistema Completo de Geração de Roteiros Virais
=======================================================

Fluxo Integrado:
1. Recebe áudio transcrito
2. Pré-processa (limpa e extrai insights)
3. Decide modelo (4o-mini vs Sonnet)
4. Gera 5 hooks usando skill.md
5. Avalia e ranqueia hooks
6. Gera roteiro final com hook vencedor
7. (Opcional) Registra performance para A/B testing

Uso:
    from main import Hooky
    
    hooky = Hooky(openai_key="...", anthropic_key="...")
    resultado = hooky.gerar_roteiro(audio_transcrito)
"""

import openai
import anthropic
import json
from typing import Dict, Optional, List
from datetime import datetime

# Importa os sistemas
from audio_preprocessor import AudioPreprocessor
from fallback_system import HookyFallbackSystem
from hook_scorer import HookScorer
from ab_testing_system import SkillABTester


class Hooky:
    """
    Motor principal do Hooky - Integra todos os sistemas.
    """
    
    def __init__(
        self,
        openai_key: str,
        anthropic_key: Optional[str] = None,
        skill_variant: str = "v2_mino_lee",
        enable_ab_testing: bool = False
    ):
        """
        Args:
            openai_key: Chave API OpenAI
            anthropic_key: Chave API Anthropic (opcional, só se usar Sonnet)
            skill_variant: Variante do skill.md a usar (default: v2_mino_lee)
            enable_ab_testing: Ativar sistema de A/B testing
        """
        
        # Configura APIs
        openai.api_key = openai_key
        if anthropic_key:
            self.anthropic_client = anthropic.Anthropic(api_key=anthropic_key)
        else:
            self.anthropic_client = None
        
        # Inicializa sistemas
        self.preprocessor = AudioPreprocessor(openai_key)
        self.fallback = HookyFallbackSystem()
        self.scorer = HookScorer(openai_key)
        self.ab_tester = SkillABTester() if enable_ab_testing else None
        
        # Configurações
        self.skill_variant = skill_variant
        self.skill_content = self._load_skill()
        
        print(f"✅ Hooky inicializado")
        print(f"   Skill variant: {skill_variant}")
        print(f"   A/B testing: {'ON' if enable_ab_testing else 'OFF'}")
    
    def _load_skill(self) -> str:
        """Carrega o skill.md da variante escolhida."""
        try:
            filename = f"skill_{self.skill_variant}.md"
            with open(filename, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            print(f"⚠️  skill_{self.skill_variant}.md não encontrado")
            print(f"   Usando skill.md padrão")
            with open("skill.md", "r", encoding="utf-8") as f:
                return f.read()
    
    def _gerar_com_4o_mini(self, audio_limpo: str, context: Dict) -> str:
        """Gera roteiro com GPT-4o-mini."""
        
        prompt = f"""
{self.skill_content}

---

CONTEXTO DO ÁUDIO (PRÉ-PROCESSADO):
- Dor Real: {context.get('dor_real', 'N/A')}
- Emoção: {context.get('emocao_detectada', 'N/A')}
- Tipo: {context.get('tipo_conteudo', 'N/A')}
- Ângulo Magnético: {context.get('angulo_magnetico', 'N/A')}

---

ÁUDIO DO USUÁRIO (LIMPO):
{audio_limpo}

---

EXECUTE:
1. Gere os 5 hooks (um de cada tipo)
2. Construa o roteiro completo usando o hook mais forte
3. Rode o checklist final
4. Entregue apenas se passar em TODAS as verificações

IMPORTANTE: Use a DOR REAL e o ÂNGULO MAGNÉTICO no hook principal.
"""
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": self.skill_content},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    
    def _gerar_com_sonnet(self, audio_limpo: str, context: Dict) -> str:
        """Gera roteiro com Claude Sonnet 4.5."""
        
        if not self.anthropic_client:
            raise ValueError(
                "Anthropic API key não configurada. "
                "Passe anthropic_key no __init__ para usar Sonnet."
            )
        
        prompt = f"""
{self.skill_content}

---

CONTEXTO DO ÁUDIO (PRÉ-PROCESSADO):
- Dor Real: {context.get('dor_real', 'N/A')}
- Emoção: {context.get('emocao_detectada', 'N/A')}
- Tipo: {context.get('tipo_conteudo', 'N/A')}
- Ângulo Magnético: {context.get('angulo_magnetico', 'N/A')}

---

ÁUDIO DO USUÁRIO (LIMPO):
{audio_limpo}

---

EXECUTE:
1. Gere os 5 hooks (um de cada tipo)
2. Construa o roteiro completo usando o hook mais forte
3. Rode o checklist final
4. Entregue apenas se passar em TODAS as verificações

IMPORTANTE: PRESERVE A CENTELHA ORIGINAL. Use a DOR REAL e o ÂNGULO MAGNÉTICO.
"""
        
        response = self.anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.content[0].text
    
    def _extrair_hooks(self, script_completo: str) -> List[str]:
        """
        Extrai os 5 hooks do script gerado.
        (Assume que o modelo lista os hooks antes do roteiro final)
        """
        
        # Estratégia 1: Procura por seção "HOOKS:" ou similar
        hooks = []
        lines = script_completo.split('\n')
        
        in_hooks_section = False
        for line in lines:
            # Detecta início da seção de hooks
            if any(keyword in line.lower() for keyword in ['hooks:', 'ganchos:', 'hook 1', 'gancho 1']):
                in_hooks_section = True
                continue
            
            # Detecta fim da seção de hooks
            if in_hooks_section and any(keyword in line.lower() for keyword in ['roteiro', 'script', 'ato i']):
                break
            
            # Extrai hooks (linhas numeradas ou com marcadores)
            if in_hooks_section:
                cleaned = line.strip()
                # Remove numeração
                for prefix in ['1.', '2.', '3.', '4.', '5.', '•', '-', '*']:
                    if cleaned.startswith(prefix):
                        cleaned = cleaned[len(prefix):].strip()
                        break
                
                # Remove formatação markdown
                cleaned = cleaned.replace('**', '').replace('*', '').strip('"').strip()
                
                if cleaned and len(cleaned) > 10:  # Hook válido tem pelo menos 10 chars
                    hooks.append(cleaned)
                    if len(hooks) == 5:
                        break
        
        # Fallback: se não encontrou 5 hooks, retorna lista vazia
        if len(hooks) != 5:
            print(f"⚠️  Apenas {len(hooks)}/5 hooks extraídos. Usando script completo.")
            return []
        
        return hooks
    
    def gerar_roteiro(
        self,
        audio_transcrito: str,
        force_model: Optional[str] = None,
        verbose: bool = True
    ) -> Dict:
        """
        Fluxo completo de geração de roteiro.
        
        Args:
            audio_transcrito: Texto do áudio transcrito
            force_model: Forçar modelo ("4o-mini" ou "sonnet"). Se None, decide automaticamente.
            verbose: Mostrar logs detalhados
            
        Returns:
            Dict com roteiro final + metadados completos
        """
        
        timestamp_start = datetime.now()
        
        if verbose:
            print("\n" + "="*60)
            print("🎬 HOOKY — GERAÇÃO DE ROTEIRO INICIADA")
            print("="*60)
        
        # ==========================================
        # ETAPA 1: PRÉ-PROCESSAMENTO
        # ==========================================
        
        if verbose:
            print("\n[1/5] 🧹 Pré-processando áudio...")
        
        processed = self.preprocessor.preprocess(audio_transcrito)
        
        if "error" in processed:
            return {
                "success": False,
                "error": "Falha no pré-processamento",
                "details": processed
            }
        
        if verbose:
            print(f"   ✅ Dor Real: {processed['dor_real']}")
            print(f"   ✅ Emoção: {processed['emocao_detectada']}")
            print(f"   ✅ Ângulo: {processed['angulo_magnetico']}")
        
        # ==========================================
        # ETAPA 2: DECISÃO DE MODELO
        # ==========================================
        
        if verbose:
            print("\n[2/5] 🤔 Decidindo modelo ideal...")
        
        if force_model:
            usar_sonnet = (force_model.lower() == "sonnet")
            model_choice = force_model
            fallback_reason = f"Modelo forçado pelo usuário: {force_model}"
        else:
            usar_sonnet, fallback_reason, fallback_details = self.fallback.should_upgrade(
                audio_transcrito
            )
            model_choice = "sonnet" if usar_sonnet else "4o-mini"
        
        if verbose:
            print(f"   ✅ Modelo escolhido: {model_choice.upper()}")
            if not force_model:
                print(f"   📊 Score de complexidade: {fallback_details['score']}/10")
        
        # ==========================================
        # ETAPA 3: GERAÇÃO DO SCRIPT
        # ==========================================
        
        if verbose:
            print(f"\n[3/5] ⚙️  Gerando script com {model_choice}...")
        
        try:
            if usar_sonnet:
                script_completo = self._gerar_com_sonnet(
                    processed['audio_limpo'],
                    processed
                )
            else:
                script_completo = self._gerar_com_4o_mini(
                    processed['audio_limpo'],
                    processed
                )
            
            if verbose:
                print(f"   ✅ Script gerado ({len(script_completo)} caracteres)")
        
        except Exception as e:
            return {
                "success": False,
                "error": "Falha na geração do script",
                "details": str(e)
            }
        
        # ==========================================
        # ETAPA 4: EXTRAÇÃO E AVALIAÇÃO DE HOOKS
        # ==========================================
        
        if verbose:
            print("\n[4/5] 🎯 Extraindo e avaliando hooks...")
        
        hooks_extraidos = self._extrair_hooks(script_completo)
        
        hook_ranking = None
        hook_vencedor = None
        
        if len(hooks_extraidos) == 5:
            context_scoring = {
                "publico_alvo": "criadores de conteúdo",
                "nicho": processed['tipo_conteudo'],
                "dor_principal": processed['dor_real'],
                "emocao": processed['emocao_detectada']
            }
            
            hook_ranking = self.scorer.score_hooks(hooks_extraidos, context_scoring)
            
            if "error" not in hook_ranking:
                hook_vencedor = hook_ranking['vencedor']
                if verbose:
                    print(f"   ✅ Hook vencedor (score {hook_vencedor['score']}/100):")
                    print(f"      \"{hook_vencedor['hook']}\"")
            else:
                if verbose:
                    print(f"   ⚠️  Erro ao avaliar hooks: {hook_ranking['error']}")
        else:
            if verbose:
                print(f"   ⚠️  Não foi possível extrair 5 hooks do script")
        
        # ==========================================
        # ETAPA 5: FINALIZAÇÃO
        # ==========================================
        
        timestamp_end = datetime.now()
        tempo_total = (timestamp_end - timestamp_start).total_seconds()
        
        if verbose:
            print(f"\n[5/5] ✅ Roteiro gerado com sucesso!")
            print(f"   ⏱️  Tempo total: {tempo_total:.1f}s")
            print("="*60)
        
        # ==========================================
        # OUTPUT FINAL
        # ==========================================
        
        resultado = {
            "success": True,
            "timestamp": timestamp_end.isoformat(),
            "tempo_geracao_segundos": tempo_total,
            
            # Dados do pré-processamento
            "audio": {
                "original": audio_transcrito,
                "limpo": processed['audio_limpo'],
                "dor_dita": processed['dor_dita'],
                "dor_real": processed['dor_real'],
                "emocao": processed['emocao_detectada'],
                "tipo_conteudo": processed['tipo_conteudo'],
                "angulo_magnetico": processed['angulo_magnetico']
            },
            
            # Decisão de modelo
            "modelo": {
                "escolhido": model_choice,
                "razao": fallback_reason,
                "foi_forcado": force_model is not None
            },
            
            # Script gerado
            "script_completo": script_completo,
            
            # Hooks
            "hooks": {
                "extraidos": hooks_extraidos,
                "ranking": hook_ranking,
                "vencedor": hook_vencedor
            },
            
            # Metadados
            "skill_variant": self.skill_variant
        }
        
        return resultado
    
    def registrar_performance(
        self,
        video_id: str,
        views: int,
        retention_3s: float,
        retention_15s: float,
        engagement_rate: float,
        hook_usado: str
    ):
        """
        Registra performance de um vídeo para A/B testing.
        
        Args:
            video_id: ID do vídeo (ex: "tiktok_12345")
            views: Total de visualizações
            retention_3s: % que assistiu primeiros 3s (0.0 a 1.0)
            retention_15s: % que assistiu até final (0.0 a 1.0)
            engagement_rate: (likes + comments + shares) / views
            hook_usado: Texto do hook que foi usado
        """
        
        if not self.ab_tester:
            print("⚠️  A/B testing não está ativado. Inicie Hooky com enable_ab_testing=True")
            return
        
        self.ab_tester.log_performance(
            variant_name=self.skill_variant,
            video_performance={
                "views": views,
                "retention_3s": retention_3s,
                "retention_15s": retention_15s,
                "engagement_rate": engagement_rate,
                "hook_used": hook_usado
            },
            video_id=video_id
        )
    
    def obter_variante_vencedora(self, min_sample: int = 5) -> Dict:
        """
        Retorna qual variante do skill.md está performando melhor.
        """
        
        if not self.ab_tester:
            return {
                "error": "A/B testing não está ativado"
            }
        
        return self.ab_tester.get_winning_variant(min_sample_size=min_sample)
    
    def exportar_relatorio_ab(self, filename: str = "hooky_ab_report.txt"):
        """
        Exporta relatório de A/B testing.
        """
        
        if not self.ab_tester:
            print("⚠️  A/B testing não está ativado")
            return
        
        return self.ab_tester.export_report(filename)


# ============================================
# FUNÇÕES DE UTILIDADE
# ============================================

def exemplo_completo():
    """
    Exemplo de uso completo do Hooky.
    """
    
    # Inicializa o Hooky
    hooky = Hooky(
        openai_key="sua-key-openai",
        anthropic_key="sua-key-anthropic",  # Opcional
        skill_variant="v2_mino_lee",
        enable_ab_testing=True
    )
    
    # Áudio de exemplo
    audio = """
    Cara, tipo... eu fico pensando muito antes de gravar, sabe? 
    Aí quando vou gravar, já travei, não sai nada natural...
    É que eu tenho medo de parecer idiota, sei lá.
    Semana passada eu tava tentando gravar pela décima vez,
    e de repente eu percebi: o problema não é falta de ideia.
    É excesso de controle.
    """
    
    # Gera o roteiro
    resultado = hooky.gerar_roteiro(
        audio_transcrito=audio,
        verbose=True
    )
    
    # Exibe resultado
    if resultado["success"]:
        print("\n" + "="*60)
        print("📜 ROTEIRO FINAL:")
        print("="*60)
        print(resultado["script_completo"])
        
        if resultado["hooks"]["vencedor"]:
            print("\n" + "="*60)
            print("🏆 HOOK VENCEDOR:")
            print("="*60)
            print(f"\"{resultado['hooks']['vencedor']['hook']}\"")
            print(f"\nScore: {resultado['hooks']['vencedor']['score']}/100")
            print(f"Como usar: {resultado['hooks']['vencedor']['como_usar']}")
        
        # Salva resultado completo em JSON
        with open("resultado_hooky.json", "w", encoding="utf-8") as f:
            json.dump(resultado, f, indent=2, ensure_ascii=False)
        
        print("\n✅ Resultado salvo em: resultado_hooky.json")
    
    else:
        print(f"\n❌ Erro: {resultado['error']}")
        print(f"Detalhes: {resultado.get('details', 'N/A')}")
    
    # ==========================================
    # DEPOIS QUE O VÍDEO FOR POSTADO (24-48h)
    # ==========================================
    
    # Registra performance real
    hooky.registrar_performance(
        video_id="tiktok_abc123",
        views=15000,
        retention_3s=0.78,
        retention_15s=0.52,
        engagement_rate=0.09,
        hook_usado=resultado["hooks"]["vencedor"]["hook"]
    )
    
    # Verifica vencedora (após ~15-20 vídeos)
    vencedora = hooky.obter_variante_vencedora(min_sample=5)
    
    if "error" not in vencedora:
        print(f"\n🏆 Variante vencedora: {vencedora['winner']}")
        print(f"Melhoria: {vencedora['improvement_vs_second']}")


# ============================================
# EXEMPLO DE USO
# ============================================

if __name__ == "__main__":
    
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎬 HOOKY — Sistema de Roteiros Virais                  ║
║   Áudio Caótico → Roteiro de 15s com Hook Forte          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Para rodar o exemplo completo, descomente:
    # exemplo_completo()
    
    # Exemplo básico rápido:
    hooky = Hooky(
        openai_key="YOUR_OPENAI_KEY",  # Substitua
        skill_variant="v2_mino_lee"
    )
    
    audio_teste = """
    Eu fico travado na hora de gravar.
    Acho que é medo de parecer idiota mesmo.
    """
    
    resultado = hooky.gerar_roteiro(audio_teste)
    
    if resultado["success"]:
        print("\n✅ ROTEIRO GERADO:\n")
        print(resultado["script_completo"])
    else:
        print(f"\n❌ Erro: {resultado['error']}")
