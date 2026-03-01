"""
A/B TESTING SYSTEM — Sistema de Teste de Variantes do Skill.md
==============================================================

Testa diferentes versões do skill.md e identifica qual gera 
roteiros com maior taxa de viralidade baseado em dados reais.

Funcionalidades:
1. Gera roteiros com múltiplas variantes do skill.md
2. Registra performance real de vídeos (views, retenção, engagement)
3. Calcula estatísticas de cada variante
4. Identifica a variante vencedora

Métricas de Avaliação:
- Retenção nos 3s (40% do peso)
- Visualizações (40% do peso)
- Taxa de engagement (20% do peso)
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from statistics import mean, stdev


class SkillABTester:
    
    def __init__(self, results_file: str = "ab_test_results.json"):
        """
        Args:
            results_file: Arquivo JSON onde os resultados são salvos
        """
        self.results_file = results_file
        self.test_results = self._load_results()
    
    def _load_results(self) -> List[Dict]:
        """Carrega resultados anteriores do arquivo."""
        if os.path.exists(self.results_file):
            try:
                with open(self.results_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def _save_results(self):
        """Salva resultados no arquivo."""
        with open(self.results_file, "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
    
    def load_skill_variant(self, variant_name: str) -> str:
        """
        Carrega uma variante do skill.md do disco.
        
        IMPORTANTE: O arquivo principal é o 'hookr.md'.
        - Se variant_name == 'hookr', carrega o hookr.md original.
        - Caso contrário, carrega skill_{variant_name}.md
        
        Estrutura esperada:
        /hooky
          ├── hookr.md (Master Skill)
          ├── skill_v2_mino_lee.md
          ├── skill_v3_ultra_especifico.md
        
        Args:
            variant_name: Nome da variante (ex: "hookr" ou "v2_mino_lee")
            
        Returns:
            Conteúdo do arquivo markdown
        """
        
        if variant_name == "hookr":
            filename = "hookr.md"
        else:
            filename = f"skill_{variant_name}.md"
        
        if not os.path.exists(filename):
            raise FileNotFoundError(
                f"Variante '{filename}' não encontrada. "
                f"Certifique-se de que o arquivo existe no diretório."
            )
        
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    
    def generate_with_variant(
        self,
        audio: str,
        variant_name: str,
        model: str = "gpt-4o-mini"
    ) -> Dict:
        """
        Gera roteiro usando uma variante específica do skill.md.
        
        Args:
            audio: Áudio transcrito
            variant_name: Nome da variante (ex: "v2_mino_lee")
            model: Modelo a usar (default: gpt-4o-mini)
            
        Returns:
            Dict com roteiro gerado e metadados
        """
        
        import openai
        
        skill_content = self.load_skill_variant(variant_name)
        
        prompt = f"""
{skill_content}

---

ÁUDIO DO USUÁRIO:
{audio}

---

EXECUTE:
1. Gere os 5 hooks (um de cada tipo)
2. Construa o roteiro completo usando o hook mais forte
3. Rode o checklist final
4. Entregue apenas se passar em TODAS as verificações
"""
        
        try:
            response = openai.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": skill_content},
                    {"role": "user", "content": audio}
                ],
                temperature=0.9,
                max_tokens=800
            )
            
            return {
                "variant": variant_name,
                "model": model,
                "script": response.choices[0].message.content,
                "audio_input": audio,
                "timestamp": datetime.now().isoformat(),
                "success": True
            }
            
        except Exception as e:
            return {
                "variant": variant_name,
                "model": model,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "success": False
            }
    
    def compare_variants(
        self,
        audio: str,
        variants: List[str],
        model: str = "gpt-4o-mini"
    ) -> Dict:
        """
        Gera roteiros com múltiplas variantes e compara side-by-side.
        
        Args:
            audio: Áudio transcrito
            variants: Lista de variantes (ex: ["v1_original", "v2_mino_lee"])
            model: Modelo a usar
            
        Returns:
            Dict com comparação completa
        """
        
        results = []
        
        print(f"\n{'='*60}")
        print(f"🔄 TESTANDO {len(variants)} VARIANTES")
        print(f"{'='*60}\n")
        
        for variant in variants:
            print(f"⚙️  Gerando com: {variant}...")
            result = self.generate_with_variant(audio, variant, model)
            results.append(result)
            
            if result["success"]:
                print(f"✅ Sucesso - {len(result['script'])} caracteres gerados\n")
            else:
                print(f"❌ Erro: {result['error']}\n")
        
        return {
            "audio_input": audio,
            "model_used": model,
            "variants_tested": len(variants),
            "results": results,
            "test_date": datetime.now().isoformat()
        }
    
    def log_performance(
        self,
        variant_name: str,
        video_performance: Dict,
        video_id: Optional[str] = None
    ):
        """
        Registra a performance REAL de um vídeo gerado por uma variante.
        
        Args:
            variant_name: Nome da variante usada
            video_performance: {
                "views": 15000,
                "retention_3s": 0.72,  # 72% retiveram nos primeiros 3s
                "retention_15s": 0.45, # 45% assistiram até o final
                "engagement_rate": 0.08,  # 8% de engagement (likes+comments+shares/views)
                "hook_used": "texto do hook usado"
            }
            video_id: ID opcional do vídeo (para rastreamento)
        """
        
        # Validação básica
        required_fields = ["views", "retention_3s", "engagement_rate"]
        for field in required_fields:
            if field not in video_performance:
                raise ValueError(f"Campo obrigatório ausente: {field}")
        
        entry = {
            "variant": variant_name,
            "video_id": video_id,
            "performance": video_performance,
            "timestamp": datetime.now().isoformat()
        }
        
        self.test_results.append(entry)
        self._save_results()
        
        print(f"✅ Performance registrada: {variant_name}")
        print(f"   Views: {video_performance['views']:,}")
        print(f"   Retenção 3s: {video_performance['retention_3s']:.1%}")
        print(f"   Engagement: {video_performance['engagement_rate']:.1%}\n")
    
    def get_variant_stats(self, variant_name: str) -> Optional[Dict]:
        """
        Calcula estatísticas de uma variante específica.
        
        Returns:
            Dict com médias, desvio padrão, etc. ou None se sem dados
        """
        
        variant_data = [
            r for r in self.test_results 
            if r["variant"] == variant_name
        ]
        
        if not variant_data:
            return None
        
        views = [r["performance"]["views"] for r in variant_data]
        retention_3s = [r["performance"]["retention_3s"] for r in variant_data]
        engagement = [r["performance"]["engagement_rate"] for r in variant_data]
        
        stats = {
            "variant": variant_name,
            "sample_size": len(variant_data),
            "views": {
                "avg": mean(views),
                "median": sorted(views)[len(views)//2],
                "min": min(views),
                "max": max(views),
                "stdev": stdev(views) if len(views) > 1 else 0
            },
            "retention_3s": {
                "avg": mean(retention_3s),
                "min": min(retention_3s),
                "max": max(retention_3s),
                "stdev": stdev(retention_3s) if len(retention_3s) > 1 else 0
            },
            "engagement_rate": {
                "avg": mean(engagement),
                "min": min(engagement),
                "max": max(engagement),
                "stdev": stdev(engagement) if len(engagement) > 1 else 0
            }
        }
        
        return stats
    
    def get_winning_variant(self, min_sample_size: int = 3) -> Dict:
        """
        Analisa resultados e determina qual variante tem melhor performance.
        
        Formula de Score:
        - Retenção 3s: 40% do peso
        - Views (normalizado): 40% do peso
        - Engagement: 20% do peso
        
        Args:
            min_sample_size: Número mínimo de vídeos por variante para ser considerada
            
        Returns:
            Dict com variante vencedora e estatísticas
        """
        
        if not self.test_results:
            return {
                "error": "Nenhum teste registrado ainda",
                "suggestion": "Use log_performance() para registrar dados"
            }
        
        # Agrupa por variante
        variants = {}
        for result in self.test_results:
            variant = result["variant"]
            if variant not in variants:
                variants[variant] = []
            variants[variant].append(result["performance"])
        
        # Filtra variantes com sample size suficiente
        valid_variants = {
            v: data for v, data in variants.items() 
            if len(data) >= min_sample_size
        }
        
        if not valid_variants:
            return {
                "error": f"Nenhuma variante tem pelo menos {min_sample_size} vídeos",
                "current_counts": {v: len(data) for v, data in variants.items()}
            }
        
        # Calcula scores
        variant_scores = {}
        
        for variant, performances in valid_variants.items():
            avg_views = mean([p["views"] for p in performances])
            avg_retention = mean([p["retention_3s"] for p in performances])
            avg_engagement = mean([p["engagement_rate"] for p in performances])
            
            # Score ponderado (normaliza views dividindo por 10k)
            score = (
                avg_retention * 0.40 +  # 40% peso
                (avg_views / 10000) * 0.40 +  # 40% peso (normalizado)
                avg_engagement * 0.20  # 20% peso
            )
            
            variant_scores[variant] = {
                "score": score,
                "avg_views": avg_views,
                "avg_retention_3s": avg_retention,
                "avg_engagement": avg_engagement,
                "sample_size": len(performances)
            }
        
        # Determina vencedor
        winner_name = max(variant_scores.keys(), key=lambda v: variant_scores[v]["score"])
        winner_stats = variant_scores[winner_name]
        
        # Calcula diferença vs. segunda colocada
        sorted_variants = sorted(
            variant_scores.items(), 
            key=lambda x: x[1]["score"], 
            reverse=True
        )
        
        improvement = None
        if len(sorted_variants) > 1:
            second_place = sorted_variants[1][1]["score"]
            winner_score = winner_stats["score"]
            improvement = ((winner_score - second_place) / second_place) * 100
        
        return {
            "winner": winner_name,
            "score": winner_stats["score"],
            "stats": winner_stats,
            "improvement_vs_second": f"+{improvement:.1f}%" if improvement else "N/A",
            "all_variants": variant_scores,
            "recommendation": self._generate_recommendation(winner_name, winner_stats)
        }
    
    def _generate_recommendation(self, winner: str, stats: Dict) -> str:
        """Gera recomendação baseada nos resultados."""
        
        retention = stats["avg_retention_3s"]
        engagement = stats["avg_engagement"]
        
        if retention > 0.70 and engagement > 0.08:
            return f"🏆 EXCELENTE - '{winner}' é a variante definitiva. Use em produção."
        elif retention > 0.60:
            return f"✅ BOM - '{winner}' está performando bem. Continue coletando dados."
        else:
            return f"⚠️  MODERADO - '{winner}' está na frente mas pode melhorar. Teste nova variante."
    
    def export_report(self, filename: str = "ab_test_report.txt"):
        """
        Exporta relatório completo em texto.
        """
        
        winner = self.get_winning_variant()
        
        if "error" in winner:
            report = f"""
{'='*60}
RELATÓRIO A/B TESTING - HOOKY
{'='*60}

Status: {winner['error']}

{winner.get('suggestion', '')}

{'='*60}
"""
        else:
            report = f"""
{'='*60}
RELATÓRIO A/B TESTING - HOOKY
{'='*60}
Data: {datetime.now().strftime('%Y-%m-%d %H:%M')}

🏆 VARIANTE VENCEDORA: {winner['winner']}
Score: {winner['score']:.2f}
Melhoria vs. 2º lugar: {winner['improvement_vs_second']}

📊 ESTATÍSTICAS DO VENCEDOR:
- Views médias: {winner['stats']['avg_views']:,.0f}
- Retenção 3s: {winner['stats']['avg_retention_3s']:.1%}
- Engagement: {winner['stats']['avg_engagement']:.1%}
- Sample size: {winner['stats']['sample_size']} vídeos

💡 RECOMENDAÇÃO:
{winner['recommendation']}

{'='*60}
TODAS AS VARIANTES TESTADAS:
{'='*60}
"""
            for variant, stats in winner['all_variants'].items():
                medal = "🥇" if variant == winner['winner'] else "  "
                report += f"""
{medal} {variant}
   Score: {stats['score']:.2f}
   Views: {stats['avg_views']:,.0f}
   Retenção 3s: {stats['avg_retention_3s']:.1%}
   Engagement: {stats['avg_engagement']:.1%}
   Vídeos: {stats['sample_size']}
"""
            
            report += f"\n{'='*60}\n"
        
        with open(filename, "w", encoding="utf-8") as f:
            f.write(report)
        
        print(f"📄 Relatório exportado: {filename}")
        return report


# ============================================
# EXEMPLO DE USO COMPLETO
# ============================================

if __name__ == "__main__":
    
    tester = SkillABTester()
    
    # ==========================================
    # FASE 1: TESTE INICIAL (Comparação)
    # ==========================================
    
    print("\n" + "="*60)
    print("FASE 1: COMPARAÇÃO DE VARIANTES")
    print("="*60)
    
    audio_test = """
    Cara, eu fico travado na hora de gravar.
    Acho que é medo de parecer idiota.
    """
    
    comparison = tester.compare_variants(
        audio=audio_test,
        variants=["hookr", "v2_mino_lee"]
    )
    
    print("\n📋 SCRIPTS GERADOS:")
    for result in comparison["results"]:
        if result["success"]:
            print(f"\n{'─'*60}")
            print(f"Variante: {result['variant']}")
            print(f"{'─'*60}")
            print(result["script"][:200] + "...")  # Primeiros 200 chars
    
    # ==========================================
    # FASE 2: SIMULAÇÃO DE COLETA DE DADOS
    # ==========================================
    
    print("\n" + "="*60)
    print("FASE 2: REGISTRANDO PERFORMANCE REAL")
    print("="*60)
    
    # Simula 5 vídeos com hookr (Master)
    print("\n📊 Variante: hookr")
    tester.log_performance("hookr", {
        "views": 8500,
        "retention_3s": 0.65,
        "retention_15s": 0.42,
        "engagement_rate": 0.05,
        "hook_used": "Hook genérico"
    }, video_id="vid_001")
    
    tester.log_performance("hookr", {
        "views": 9200,
        "retention_3s": 0.68,
        "retention_15s": 0.45,
        "engagement_rate": 0.06,
        "hook_used": "Hook genérico"
    }, video_id="vid_002")
    
    tester.log_performance("hookr", {
        "views": 7800,
        "retention_3s": 0.63,
        "retention_15s": 0.40,
        "engagement_rate": 0.04,
        "hook_used": "Hook genérico"
    }, video_id="vid_003")
    
    # Simula 5 vídeos com v2_mino_lee
    print("📊 Variante: v2_mino_lee")
    tester.log_performance("v2_mino_lee", {
        "views": 15000,
        "retention_3s": 0.78,
        "retention_15s": 0.52,
        "engagement_rate": 0.09,
        "hook_used": "Você não tá travado. Você tá com medo."
    }, video_id="vid_004")
    
    tester.log_performance("v2_mino_lee", {
        "views": 18500,
        "retention_3s": 0.82,
        "retention_15s": 0.58,
        "engagement_rate": 0.11,
        "hook_used": "3h planejando. 0 views."
    }, video_id="vid_005")
    
    tester.log_performance("v2_mino_lee", {
        "views": 14200,
        "retention_3s": 0.75,
        "retention_15s": 0.50,
        "engagement_rate": 0.08,
        "hook_used": "Deletei o roteiro. Melhor vídeo."
    }, video_id="vid_006")
    
    # ==========================================
    # FASE 3: ANÁLISE E VENCEDOR
    # ==========================================
    
    print("\n" + "="*60)
    print("FASE 3: DETERMINANDO VENCEDOR")
    print("="*60)
    
    winner = tester.get_winning_variant(min_sample_size=3)
    
    if "error" not in winner:
        print(f"\n🏆 VENCEDOR: {winner['winner']}")
        print(f"Score: {winner['score']:.2f}")
        print(f"Melhoria: {winner['improvement_vs_second']}")
        print(f"\n{winner['recommendation']}")
        
        print(f"\n📊 Estatísticas completas:")
        print(json.dumps(winner['stats'], indent=2))
    else:
        print(f"\n⚠️  {winner['error']}")
    
    # ==========================================
    # FASE 4: EXPORTAR RELATÓRIO
    # ==========================================
    
    print("\n" + "="*60)
    print("FASE 4: GERANDO RELATÓRIO")
    print("="*60)
    
    report = tester.export_report("ab_test_report.txt")
    print("\n" + report)
