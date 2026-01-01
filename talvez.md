# 🎙️ AudioPen Prime - Análise de Features

> Referência para implementar funcionalidades similares ao AudioPen Prime no RoteiroOpen/Hooky

---

## 💰 Modelo de Preços AudioPen

| Plano | Preço | Período |
|-------|-------|---------|
| **Free** | $0 | Indefinido |
| **Yearly Pass** | $99 | 1 ano (não recorrente) |
| **2 Year Pass** | $159 | 2 anos (não recorrente) |

> **Nota:** Pagamento único, sem assinatura recorrente. Notas salvas permanecem mesmo após expirar.

---

## 📊 Comparativo: RoteiroOpen vs AudioPen Prime

| Feature AudioPen Prime | Já Temos? | Lib Necessária | Status |
|------------------------|-----------|----------------|--------|
| Gravação de áudio | ✅ Sim | Web API nativa | Implementado |
| Visualização de áudio | ✅ Sim | Web API nativa | Implementado |
| Transcrição (Whisper) | ✅ Sim | `openai` já instalada | Implementado |
| Gravações longas (15 min) | ⚠️ Parcial | Nenhuma | Expandir limite |
| Upload de arquivos de áudio | ❌ Não | Nenhuma (Drag & Drop nativo) | A implementar |
| Armazenamento ilimitado | ❌ Não | `@supabase/supabase-js` já instalada | A implementar |
| Combinar notas (SuperSummaries) | ❌ Não | Nenhuma | A implementar |
| Reestilar notas existentes | ❌ Não | GPT já configurado | A implementar |
| Upload de texto | ❌ Não | Nenhuma | A implementar |

---

## ✅ Libs Já Instaladas (Suficientes!)

```json
{
  "@supabase/supabase-js": "^2.87.1",  // Storage + Auth + DB
  "openai": "^6.13.0",                  // Whisper + GPT
  "framer-motion": "^12.23.26",         // Animações
  "lucide-react": "^0.561.0",           // Ícones
  "react": "^19.2.0"
}
```

**Conclusão: NÃO precisamos instalar novas libs!**

---

## 🛠️ Features a Implementar

### 1. Upload de Arquivos de Áudio
```typescript
// Usar input[type="file"] + drag and drop nativo
// Processar com OpenAI Whisper igual à gravação
```

### 2. Armazenamento no Supabase
```typescript
// Migrar de localStorage para Supabase
// Usar Supabase Storage para arquivos de áudio
// Sincronizar notas entre dispositivos
```

### 3. SuperSummaries (Combinar Notas)
```typescript
// Selecionar múltiplos scripts
// Concatenar conteúdo
// Enviar para GPT com prompt de resumo
```

### 4. Restyle (Reescrever com Outro Tom)
```typescript
// Pegar script existente
// Novo prompt com tom diferente (formal, casual, etc)
// Salvar nova versão
```

### 5. Upload de Texto
```typescript
// Input de texto ou cole direto
// Pular etapa de transcrição
// Ir direto para geração de script
```

---

## 📝 Notas Técnicas

### Limite de Áudio (Whisper)
- OpenAI Whisper aceita até **25MB** por arquivo
- ~15 minutos em formato WebM é bem menor que isso
- Nosso limite atual é apenas de UX, não técnico

### Storage Supabase
- Já temos `@supabase/supabase-js` instalado
- Criar bucket `audio-files` no Supabase
- RLS policies para acesso apenas ao próprio usuário

### Modelo de Negócio Sugerido
- **Free:** 3 scripts/mês (já temos)
- **Premium Anual:** R$ 297 (lifetime scripts)
- **Premium 2 Anos:** R$ 497 (desconto)

---

## 🎯 Prioridade de Implementação

1. 🔴 **Alta:** Migrar localStorage → Supabase DB
2. 🔴 **Alta:** Upload de arquivos de áudio
3. 🟡 **Média:** Restyle de notas existentes
4. 🟡 **Média:** Upload de texto direto
5. 🟢 **Baixa:** SuperSummaries

---

# ⚡ Glaido - Análise de Features

> Referência para implementar ditado em tempo real com limpeza automática de texto

---

## 💰 Modelo de Preços Glaido

| Plano | Preço | Período |
|-------|-------|---------|
| **Free Trial** | $0 | 1 mês |
| **Pro** | $20/mês | Mensal |

---

## 📊 Comparativo: RoteiroOpen vs Glaido

| Feature Glaido | Já Temos? | Lib Necessária | Status |
|----------------|-----------|----------------|--------|
| Transcrição de voz | ✅ Sim | `openai` já instalada | Implementado |
| Transcrição em tempo real (streaming) | ❌ Não | `@deepgram/sdk` (opcional) | Futuro |
| Remoção de filler words ("um", "tipo") | ❌ Não | GPT já configurado | A implementar |
| Correção gramatical automática | ❌ Não | GPT já configurado | A implementar |
| 100+ idiomas | ✅ Sim | Whisper já suporta | Implementado |
| Lightning mode (ultra-rápido) | ❌ Não | Deepgram ou Whisper streaming | Futuro |
| Funciona em qualquer app | ❌ N/A | Electron/Tauri (desktop) | Escopo diferente |

---

## ⚠️ Diferença de Arquitetura

| Aspecto | Glaido | RoteiroOpen |
|---------|--------|-------------|
| **Tipo** | App Desktop Nativo | Web App |
| **Funciona em** | Qualquer app do PC | Apenas no browser |
| **Hotkey global** | ✅ Sim | ❌ Não possível na web |

> **Nota:** Para replicar Glaido 100%, seria necessário criar um app desktop com Electron ou Tauri. Isso é um projeto separado.

---

## 🛠️ Features Glaido a Implementar (Web)

### 1. Limpeza de Filler Words
```typescript
// Prompt para limpar transcrição
const cleanTranscription = async (rawText: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `Limpe o texto removendo:
        - Palavras de preenchimento (um, tipo, assim, né, então, sabe)
        - Repetições desnecessárias
        - Corrija gramática e pontuação
        Mantenha o sentido e tom original. Retorne apenas o texto limpo.`
    }, {
      role: 'user',
      content: rawText
    }]
  });
  return response.choices[0].message.content;
};
```

### 2. Transcrição Streaming (Opcional - Futuro)
```bash
# Se quiser transcrição INSTANTÂNEA enquanto fala
npm install @deepgram/sdk
```

```typescript
// Deepgram permite transcrição em tempo real via WebSocket
// Mais complexo, mas dá feedback instantâneo
```

---

## 📝 Notas Técnicas Glaido

### Whisper vs Deepgram

| Aspecto | OpenAI Whisper | Deepgram |
|---------|----------------|----------|
| **Modo** | Batch (grava tudo, depois transcreve) | Streaming (transcreve enquanto fala) |
| **Latência** | 2-5 segundos após fim | ~300ms em tempo real |
| **Custo** | $0.006/min | $0.0043/min |
| **Qualidade** | Excelente | Muito boa |
| **Libs instaladas** | ✅ Já temos | ❌ Precisaria instalar |

### Recomendação
Para o fluxo atual do RoteiroOpen (gravar → processar → exibir), **Whisper é suficiente**.
Streaming só faz sentido para ditado em tempo real tipo Glaido.

---

## 🎯 Prioridade Atualizada

### AudioPen Features
1. 🔴 **Alta:** Migrar localStorage → Supabase DB
2. 🔴 **Alta:** Upload de arquivos de áudio
3. 🟡 **Média:** Restyle de notas existentes
4. 🟡 **Média:** Upload de texto direto
5. 🟢 **Baixa:** SuperSummaries

### Glaido Features
6. 🟡 **Média:** Limpeza de filler words (GPT pós-processamento)
7. 🟡 **Média:** Correção gramatical automática
8. 🟢 **Baixa:** Transcrição streaming (Deepgram)

---

*Análise criada em: 2026-01-01*
