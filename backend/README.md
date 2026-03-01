# 🎬 HOOKY — Áudio Caótico → Roteiro Viral em 15s

Sistema de IA que transforma áudios bagunçados em roteiros virais otimizados para TikTok/Reels/Shorts.

**O problema:** Criadores travam na hora de transformar ideias soltas em roteiros que convertem.

**A solução:** Grave um áudio falando livremente. O Hooky transforma em roteiro viral com hook testado.

---

## ⚡ Quick Start (5 minutos)

### 1. Instale dependências

```bash
pip install openai anthropic
```

### 2. Configure suas API keys

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."  # Opcional (só se usar Sonnet)
```

### 3. Crie os arquivos necessários

Baixe os arquivos do projeto:
```
/hooky
  ├── main.py                    # Orquestrador principal
  ├── audio_preprocessor.py      # Limpeza de áudio
  ├── fallback_system.py         # Decisão de modelo
  ├── hook_scorer.py             # Avaliação de hooks
  ├── ab_testing_system.py       # A/B testing
  └── skill.md                   # Prompt base (renomeie para skill_v2_mino_lee.md)
```

### 4. Teste agora

```python
from main import Hooky

# Inicializa
hooky = Hooky(
    openai_key="sk-...",
    skill_variant="v2_mino_lee"
)

# Seu áudio caótico
audio = """
Cara, eu fico travado na hora de gravar.
Fico pensando demais, sabe?
Acho que é medo de parecer idiota.
"""

# Gera roteiro
resultado = hooky.gerar_roteiro(audio)

# Pronto!
print(resultado["script_completo"])
print(f"Hook vencedor: {resultado['hooks']['vencedor']['hook']}")
```

**Output:**
```
🏆 Hook vencedor: "Você não tá travado. Você tá com medo de parecer idiota."
Score: 88/100

[Roteiro completo de 15s com estrutura de 5 atos]
```

---

## 🎯 O Que Você Ganha

### ✅ Sistema Inteligente de 4 Camadas

1. **Pré-processamento** → Extrai a DOR REAL do áudio caótico
2. **Fallback Automático** → Usa 4o-mini (barato) ou Sonnet (preciso) automaticamente
3. **Avaliação de Hooks** → Testa 5 hooks e escolhe o melhor (score 0-100)
4. **A/B Testing** → Descobre qual variante do skill.md performa melhor

### 📊 Métricas que Importam

O sistema avalia hooks baseado em:
- **Especificidade** (30 pts) → Quanto mais específico, melhor
- **Prova Social** (20 pts) → Números e autoridade
- **Ataque à Dor** (25 pts) → Atinge emoção REAL
- **Provocação** (15 pts) → Contradição/dissonância
- **Concisão** (10 pts) → Cabe em 1,5-2 segundos

**Hook com 80+ pontos = Viral**

---

## 🔥 Uso Avançado

### Modo 1: Forçar Modelo Específico

```python
# Força uso do Sonnet (áudio ultra complexo/emocional)
resultado = hooky.gerar_roteiro(
    audio_complexo,
    force_model="sonnet"
)
```

### Modo 2: Com A/B Testing

```python
# Inicializa com A/B testing ativo
hooky = Hooky(
    openai_key="sk-...",
    skill_variant="v2_mino_lee",
    enable_ab_testing=True  # ← Liga A/B
)

# 1. Gera roteiro
resultado = hooky.gerar_roteiro(audio)

# 2. Posta vídeo

# 3. Registra performance (24-48h depois)
hooky.registrar_performance(
    video_id="tiktok_123",
    views=15000,
    retention_3s=0.78,      # 78% assistiram 3s
    retention_15s=0.52,     # 52% assistiram até o final
    engagement_rate=0.09,   # 9% de engagement
    hook_usado=resultado["hooks"]["vencedor"]["hook"]
)

# 4. Após 15+ vídeos, veja qual skill.md vence
vencedora = hooky.obter_variante_vencedora()
print(f"🏆 Skill.md vencedor: {vencedora['winner']}")
print(f"Melhoria: {vencedora['improvement_vs_second']}")
```

### Modo 3: Testar Variantes do Skill.md

```python
# Compara 2 variantes com mesmo áudio
from ab_testing_system import SkillABTester

tester = SkillABTester()
comparison = tester.compare_variants(
    audio="seu áudio aqui",
    variants=["v1_original", "v2_mino_lee"]
)

# Veja qual gera melhor roteiro
for result in comparison["results"]:
    print(f"\n{result['variant']}:")
    print(result["script"][:200])
```

---

## 📁 Estrutura de Arquivos

```
/hooky
  ├── main.py                      # ← USE ESTE (orquestrador completo)
  │
  ├── audio_preprocessor.py        # Sistema 1: Limpa áudio caótico
  ├── fallback_system.py           # Sistema 2: Decide 4o-mini vs Sonnet
  ├── hook_scorer.py               # Sistema 3: Avalia hooks (0-100)
  ├── ab_testing_system.py         # Sistema 4: Testa variantes
  │
  ├── skill_v2_mino_lee.md         # Prompt principal (framework Mino Lee)
  ├── skill_v1_original.md         # [Opcional] Versão original
  │
  ├── ab_test_results.json         # Dados de performance (auto-gerado)
  └── resultado_hooky.json         # Último resultado (auto-gerado)
```

---

## 🎓 Como Funciona (Internamente)

### Fluxo Completo:

```
ÁUDIO CAÓTICO
    ↓
[1] Pré-processamento
    → Remove ruído verbal ("ãh", "tipo", "né")
    → Identifica DOR REAL vs. dor dita
    → Extrai FRASE-NÚCLEO
    → Detecta emoção dominante
    ↓
[2] Decisão de Modelo
    → Score de complexidade (0-10)
    → Se >= 5 → Sonnet (preserva centelha)
    → Se < 5  → 4o-mini (rápido/barato)
    ↓
[3] Geração de Script
    → Usa skill.md como sistema
    → Gera 5 hooks (tipos diferentes)
    → Constrói roteiro de 5 atos
    ↓
[4] Avaliação de Hooks
    → Pontua cada hook (0-100)
    → Escolhe vencedor
    → Sugere melhorias
    ↓
[5] Output Final
    → Roteiro completo
    → Hook vencedor + como executar
    → Metadados (tempo, modelo usado, etc)
```

### Critérios de Fallback (4o-mini → Sonnet):

| Critério | Pontos | Quando Ativa |
|----------|--------|--------------|
| Áudio longo (300+ palavras) | +2 | Risco de perder centelha |
| Múltiplas ideias (15+ frases) | +1 | Requer síntese avançada |
| Alta ambiguidade ("sei lá" 3x+) | +2 | 4o-mini força coerência |
| Frases incompletas | +1 | Requer inferência |
| Conteúdo emocional (2+ palavras) | +2 | Sonnet preserva nuance |
| Storytelling (3+ marcadores) | +1 | Transforma em hook |

**Total >= 5 → Upgrade para Sonnet**

---

## 💰 Custo Estimado

### Modo Econômico (só 4o-mini):
- **$0.02 por roteiro** (~2.000 tokens)
- 50 roteiros/dia = **$1/dia**

### Modo Híbrido (fallback inteligente):
- 70% usa 4o-mini ($0.02)
- 30% usa Sonnet ($0.10)
- Custo médio: **$0.044 por roteiro**
- 50 roteiros/dia = **$2.20/dia**

### Modo Premium (só Sonnet):
- **$0.10 por roteiro**
- 50 roteiros/dia = **$5/dia**

---

## 🐛 Troubleshooting

### Erro: "skill_v2_mino_lee.md não encontrado"

**Solução:**
```bash
# Renomeie seu skill.md
mv skill.md skill_v2_mino_lee.md
```

### Erro: "Anthropic API key não configurada"

**Solução:**
```python
# Se não quiser usar Sonnet, NÃO passe anthropic_key
hooky = Hooky(
    openai_key="sk-...",
    # anthropic_key="..."  ← Comente esta linha
)
```

O sistema vai usar só 4o-mini (mais barato).

### Hooks não estão sendo extraídos

**Solução:**
Verifique se o skill.md está gerando hooks no formato:

```
HOOKS:
1. Hook provocativo
2. Hook curioso
3. Hook identificação
4. Hook promessa
5. Hook história
```

Se o formato for diferente, ajuste a função `_extrair_hooks()` no `main.py`.

---

## 📈 Roadmap

- [x] Sistema de fallback inteligente
- [x] Pré-processamento de áudio
- [x] Avaliação de hooks (0-100)
- [x] A/B testing de variantes
- [ ] Interface web (Streamlit)
- [ ] API REST (FastAPI)
- [ ] Dashboard de analytics
- [ ] Integração direta com TikTok API

---

## 🤝 Contribuindo

PRs são bem-vindos! Áreas que precisam de ajuda:

1. **Melhorar extração de hooks** (regex mais robusto)
2. **Adicionar mais variantes de skill.md**
3. **Criar testes unitários**
4. **Otimizar prompts para reduzir tokens**

---

## 📝 Licença

MIT License - use como quiser, inclusive comercialmente.

---

## 💬 Suporte

Problemas? Abra uma issue ou me chame no Twitter: [@seu_handle]

---

**Feito com 🔥 para criadores que querem viralizar sem perder a autenticidade.**
