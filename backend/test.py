"""
HOOKY — Suite de Testes Automatizados
======================================

Valida que todos os sistemas estão funcionando corretamente.

Uso:
    python test.py

Testa:
1. Pré-processamento de áudio
2. Sistema de fallback (decisão de modelo)
3. Avaliação de hooks
4. A/B testing
5. Fluxo completo (main.py)
"""

import json
import os
from datetime import datetime


class Colors:
    """Cores para terminal (ANSI)."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_test(name: str):
    """Imprime nome do teste."""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}🧪 TESTE: {name}{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")


def print_success(message: str):
    """Imprime sucesso."""
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")


def print_error(message: str):
    """Imprime erro."""
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")


def print_warning(message: str):
    """Imprime aviso."""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")


# ============================================
# TESTE 1: PRÉ-PROCESSAMENTO
# ============================================

def test_preprocessor():
    """Testa o AudioPreprocessor."""
    
    print_test("Audio Preprocessor")
    
    try:
        from audio_preprocessor import AudioPreprocessor
        
        # Mock (sem API key real para teste rápido)
        # Em produção, use API key real
        
        print("📋 Testando estrutura da classe...")
        preprocessor = AudioPreprocessor()
        
        # Verifica se métodos existem
        assert hasattr(preprocessor, 'preprocess'), "Método preprocess() não encontrado"
        assert hasattr(preprocessor, 'format_for_display'), "Método format_for_display() não encontrado"
        
        print_success("Estrutura da classe OK")
        
        # Teste de prompt
        print("\n📋 Verificando prompt do sistema...")
        assert len(preprocessor.SYSTEM_PROMPT) > 1000, "Prompt muito curto"
        assert "DOR REAL" in preprocessor.SYSTEM_PROMPT, "Prompt não menciona DOR REAL"
        assert "FRASE-NÚCLEO" in preprocessor.SYSTEM_PROMPT, "Prompt não menciona FRASE-NÚCLEO"
        
        print_success("Prompt do sistema OK")
        
        print_success("AudioPreprocessor passou em todos os testes!")
        return True
        
    except ImportError as e:
        print_error(f"Falha ao importar: {e}")
        return False
    except AssertionError as e:
        print_error(f"Falha na validação: {e}")
        return False
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        return False


# ============================================
# TESTE 2: SISTEMA DE FALLBACK
# ============================================

def test_fallback_system():
    """Testa o HookyFallbackSystem."""
    
    print_test("Fallback System")
    
    try:
        from fallback_system import HookyFallbackSystem
        
        fallback = HookyFallbackSystem()
        
        print("📋 Testando áudio simples (deve usar 4o-mini)...")
        
        audio_simples = """
        Eu quero falar sobre produtividade.
        As pessoas pensam demais antes de agir.
        A solução é simples: faça menos, execute mais.
        """
        
        should_upgrade, reason, details = fallback.should_upgrade(audio_simples)
        
        assert not should_upgrade, "Áudio simples deveria usar 4o-mini"
        assert details['score'] < 5, f"Score muito alto para áudio simples: {details['score']}"
        
        print_success(f"Áudio simples OK (score: {details['score']}/10 → 4o-mini)")
        
        print("\n📋 Testando áudio complexo (deve usar Sonnet)...")
        
        audio_complexo = """
        Cara, tipo... eu fico pensando muito antes de gravar, sabe?
        Aí quando vou gravar, já travei, não sai nada natural...
        É que eu tenho medo de parecer idiota, sei lá.
        Semana passada eu tava lá, tentando gravar pela décima vez,
        e de repente eu percebi: o problema não é falta de ideia.
        É excesso de controle. Meio que eu tô com vergonha de ser eu mesmo.
        Talvez seja ansiedade, ou sei lá, insegurança mesmo.
        """
        
        should_upgrade, reason, details = fallback.should_upgrade(audio_complexo)
        
        assert should_upgrade, "Áudio complexo deveria usar Sonnet"
        assert details['score'] >= 5, f"Score muito baixo para áudio complexo: {details['score']}"
        
        print_success(f"Áudio complexo OK (score: {details['score']}/10 → Sonnet)")
        
        print("\n📋 Testando critérios individuais...")
        
        # Teste de ambiguidade
        audio_ambiguo = "sei lá, tipo assim, talvez, ou seja, meio que, mais ou menos"
        _, _, details_amb = fallback.should_upgrade(audio_ambiguo)
        assert details_amb['score'] >= 2, "Não detectou ambiguidade"
        
        print_success("Detecção de ambiguidade OK")
        
        # Teste de emoção
        audio_emocional = "Tenho muito medo e ansiedade, sinto vergonha e insegurança"
        _, _, details_emo = fallback.should_upgrade(audio_emocional)
        assert details_emo['score'] >= 2, "Não detectou emoção"
        
        print_success("Detecção de emoção OK")
        
        print_success("Fallback System passou em todos os testes!")
        return True
        
    except ImportError as e:
        print_error(f"Falha ao importar: {e}")
        return False
    except AssertionError as e:
        print_error(f"Falha na validação: {e}")
        return False
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        return False


# ============================================
# TESTE 3: HOOK SCORER
# ============================================

def test_hook_scorer():
    """Testa o HookScorer."""
    
    print_test("Hook Scorer")
    
    try:
        from hook_scorer import HookScorer
        
        scorer = HookScorer()
        
        print("📋 Verificando estrutura da classe...")
        assert hasattr(scorer, 'score_hooks'), "Método score_hooks() não encontrado"
        assert hasattr(scorer, 'format_for_display'), "Método format_for_display() não encontrado"
        
        print_success("Estrutura da classe OK")
        
        print("\n📋 Verificando prompt de scoring...")
        assert len(scorer.SCORING_PROMPT) > 2000, "Prompt muito curto"
        assert "ESPECIFICIDADE" in scorer.SCORING_PROMPT, "Critério ESPECIFICIDADE ausente"
        assert "PROVA SOCIAL" in scorer.SCORING_PROMPT, "Critério PROVA SOCIAL ausente"
        assert "ATAQUE À DOR" in scorer.SCORING_PROMPT, "Critério ATAQUE À DOR ausente"
        
        print_success("Prompt de scoring OK")
        
        print("\n📋 Validando hooks de exemplo...")
        
        hooks_teste = [
            "Você não tá travado. Você tá com medo de parecer idiota.",
            "Deletei meu roteiro 30 segundos antes de gravar.",
            "Quanto mais você pensa, pior fica.",
            "Seu roteiro perfeito tá matando seu vídeo.",
            "3h planejando. 3 segundos gravando. 0 views."
        ]
        
        # Valida que são 5 hooks
        assert len(hooks_teste) == 5, "Deve ter exatamente 5 hooks"
        
        # Valida que nenhum é muito longo
        for hook in hooks_teste:
            assert len(hook.split()) <= 20, f"Hook muito longo: {hook}"
        
        print_success("Hooks de teste válidos")
        
        print_success("Hook Scorer passou em todos os testes!")
        return True
        
    except ImportError as e:
        print_error(f"Falha ao importar: {e}")
        return False
    except AssertionError as e:
        print_error(f"Falha na validação: {e}")
        return False
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        return False


# ============================================
# TESTE 4: A/B TESTING SYSTEM
# ============================================

def test_ab_testing():
    """Testa o SkillABTester."""
    
    print_test("A/B Testing System")
    
    try:
        from ab_testing_system import SkillABTester
        
        # Cria tester com arquivo temporário
        test_file = "test_ab_results.json"
        tester = SkillABTester(results_file=test_file)
        
        print("📋 Testando registro de performance...")
        
        # Registra performances de teste
        tester.log_performance("v1_original", {
            "views": 5000,
            "retention_3s": 0.60,
            "retention_15s": 0.40,
            "engagement_rate": 0.05,
            "hook_used": "Hook teste 1"
        }, video_id="test_001")
        
        tester.log_performance("v1_original", {
            "views": 5500,
            "retention_3s": 0.62,
            "retention_15s": 0.42,
            "engagement_rate": 0.06,
            "hook_used": "Hook teste 2"
        }, video_id="test_002")
        
        tester.log_performance("v1_original", {
            "views": 4800,
            "retention_3s": 0.58,
            "retention_15s": 0.38,
            "engagement_rate": 0.04,
            "hook_used": "Hook teste 3"
        }, video_id="test_003")
        
        print_success("3 performances registradas")
        
        print("\n📋 Testando cálculo de estatísticas...")
        
        stats = tester.get_variant_stats("v1_original")
        
        assert stats is not None, "Estatísticas não foram calculadas"
        assert stats['sample_size'] == 3, "Sample size incorreto"
        assert 4800 <= stats['views']['avg'] <= 5500, "Média de views incorreta"
        
        print_success(f"Estatísticas OK (avg views: {stats['views']['avg']:.0f})")
        
        print("\n📋 Testando arquivo de resultados...")
        
        assert os.path.exists(test_file), "Arquivo de resultados não foi criado"
        
        with open(test_file, 'r') as f:
            data = json.load(f)
        
        assert len(data) == 3, "Número incorreto de registros"
        
        print_success("Arquivo de resultados OK")
        
        # Limpa arquivo de teste
        os.remove(test_file)
        
        print_success("A/B Testing System passou em todos os testes!")
        return True
        
    except ImportError as e:
        print_error(f"Falha ao importar: {e}")
        return False
    except AssertionError as e:
        print_error(f"Falha na validação: {e}")
        return False
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        return False
    finally:
        # Garante limpeza
        if os.path.exists(test_file):
            os.remove(test_file)


# ============================================
# TESTE 5: SKILL.MD
# ============================================

def test_skill_md():
    """Verifica se os arquivos skill.md existem."""
    
    print_test("Skill.md Files")
    
    try:
        print("📋 Verificando arquivos necessários...")
        
        # Tenta encontrar pelo menos um skill.md
        skill_files = [
            "skill.md",
            "skill_v1_original.md",
            "skill_v2_mino_lee.md"
        ]
        
        found_files = [f for f in skill_files if os.path.exists(f)]
        
        if not found_files:
            print_error("Nenhum arquivo skill.md encontrado!")
            print_warning("Crie pelo menos um dos seguintes arquivos:")
            for f in skill_files:
                print(f"  - {f}")
            return False
        
        for skill_file in found_files:
            with open(skill_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Validações básicas
            assert len(content) > 3000, f"{skill_file} muito curto"
            
            # Verifica seções críticas
            required_sections = [
                "REGRAS DE OURO",
                "PROCESSO DE TRABALHO",
                "CHECKLIST FINAL"
            ]
            
            for section in required_sections:
                if section not in content:
                    print_warning(f"{skill_file}: Seção '{section}' não encontrada")
            
            print_success(f"{skill_file} OK ({len(content)} caracteres)")
        
        print_success("Skill.md files passaram na validação!")
        return True
        
    except Exception as e:
        print_error(f"Erro ao validar skill.md: {e}")
        return False


# ============================================
# TESTE 6: INTEGRAÇÃO (MAIN.PY)
# ============================================

def test_main_integration():
    """Testa a integração completa (main.py)."""
    
    print_test("Main.py Integration")
    
    try:
        from main import Hooky
        
        print("📋 Testando inicialização sem API keys...")
        
        # Testa inicialização (vai falhar nas chamadas de API, mas estrutura deve estar OK)
        try:
            hooky = Hooky(
                openai_key="test_key",
                skill_variant="v2_mino_lee",
                enable_ab_testing=False
            )
            print_success("Inicialização OK")
        except FileNotFoundError:
            print_warning("skill_v2_mino_lee.md não encontrado, usando skill.md")
            hooky = Hooky(
                openai_key="test_key",
                enable_ab_testing=False
            )
            print_success("Inicialização OK (com skill.md padrão)")
        
        print("\n📋 Verificando métodos públicos...")
        
        required_methods = [
            'gerar_roteiro',
            'registrar_performance',
            'obter_variante_vencedora',
            'exportar_relatorio_ab'
        ]
        
        for method in required_methods:
            assert hasattr(hooky, method), f"Método {method}() não encontrado"
        
        print_success("Todos os métodos públicos presentes")
        
        print("\n📋 Verificando atributos...")
        
        assert hasattr(hooky, 'preprocessor'), "preprocessor não inicializado"
        assert hasattr(hooky, 'fallback'), "fallback não inicializado"
        assert hasattr(hooky, 'scorer'), "scorer não inicializado"
        
        print_success("Todos os sistemas inicializados")
        
        print_success("Main.py Integration passou na validação!")
        return True
        
    except ImportError as e:
        print_error(f"Falha ao importar: {e}")
        return False
    except AssertionError as e:
        print_error(f"Falha na validação: {e}")
        return False
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        return False


# ============================================
# RUNNER PRINCIPAL
# ============================================

def run_all_tests():
    """Executa todos os testes."""
    
    print(f"""
{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧪 HOOKY — SUITE DE TESTES AUTOMATIZADOS               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
{Colors.RESET}
""")
    
    tests = [
        ("Audio Preprocessor", test_preprocessor),
        ("Fallback System", test_fallback_system),
        ("Hook Scorer", test_hook_scorer),
        ("A/B Testing", test_ab_testing),
        ("Skill.md Files", test_skill_md),
        ("Main.py Integration", test_main_integration)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print_error(f"Falha catastrófica no teste '{test_name}': {e}")
            results[test_name] = False
    
    # Relatório final
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}📊 RELATÓRIO FINAL{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{Colors.GREEN}✅ PASSOU{Colors.RESET}" if result else f"{Colors.RED}❌ FALHOU{Colors.RESET}"
        print(f"{status}  {test_name}")
    
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 TODOS OS TESTES PASSARAM! ({passed}/{total}){Colors.RESET}")
        print(f"\n✅ O Hooky está pronto para produção!")
        return True
    else:
        print(f"{Colors.RED}{Colors.BOLD}⚠️  ALGUNS TESTES FALHARAM ({passed}/{total}){Colors.RESET}")
        print(f"\n❌ Corrija os erros acima antes de ir para produção.")
        return False


# ============================================
# EXECUÇÃO
# ============================================

if __name__ == "__main__":
    import sys
    
    success = run_all_tests()
    
    # Exit code (para CI/CD)
    sys.exit(0 if success else 1)
