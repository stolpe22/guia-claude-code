---
name: implement-chat-widget
description: Implementa do zero o sistema completo de chat RAG Vibe Codinho no Quartz — indexação dos MDs, widget flutuante, integração com APIs de LLM e estilos.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

Implemente o sistema **Vibe Codinho** de chat RAG no Quartz.

**Leia `.claude/rules/chat-rules.md` antes de começar.** Todas as regras de negócio estão lá.

## Etapa 1 — Script de indexação

Crie `scripts/build-chat-index.mjs`:

- Lê recursivamente todos os `.md` de `content/claude-code/` e `content/conceitos/`
- Ignora `content/copilot-codex/` completamente
- Para cada arquivo:
  - Extrai `title` e `tags` do frontmatter YAML
  - Divide o conteúdo por headings `##` em seções
  - Gera um chunk por seção com ~400–600 palavras
  - Slug do arquivo vira a URL (`/nome-do-arquivo`)
- Escreve `public/search-chunks.json`
- Log no console: quantos arquivos e chunks gerados

Adicione ao `package.json` um script `"build:index": "node scripts/build-chat-index.mjs"` e inclua-o no script `"build"` existente (antes do quartz build).

## Etapa 2 — ChatWidget.tsx

Crie `quartz/components/ChatWidget.tsx` como componente Preact. Estrutura do componente:

### Estados
- `isOpen: boolean` — modal aberto/fechado
- `messages: Message[]` — histórico da sessão (reseta na montagem)
- `input: string` — campo de texto atual
- `isLoading: boolean` — aguardando resposta da API
- `globalMode: boolean` — toggle Doc vs Global
- `apiKey: string` — lido do localStorage na montagem
- `provider: 'gemini' | 'claude'` — lido do localStorage
- `model: string` — lido do localStorage
- `showOnboarding: boolean` — true se não há apiKey

### Tela de Onboarding
Exibida quando `showOnboarding === true`. Contém:
- Título "Configurar Vibe Codinho"
- Selector de provider (Gemini / Claude)
- Campo de input para API key (type password)
- Tutorial inline com os passos do `chat-rules.md` para Gemini free
- Link direto para aistudio.google.com/app/apikey
- Botão "Salvar e começar"
- Ao salvar: persiste no localStorage e seta `showOnboarding = false`

### Header do chat
- Nome "Vibe Codinho" com ícone
- Toggle switch "Modo Doc / Modo Global"
- Botão de settings (⚙) que reabre o onboarding para trocar key/modelo
- Botão fechar (✕)

### Lógica de retrieval (BM25 simplificado)
```
função findRelevantChunks(query, chunks, topK=4):
  tokenize query em termos
  para cada chunk, calcular score TF-IDF simples
  retornar topK chunks com maior score (mínimo 0.1)
```
Implemente inline no componente ou em `quartz/components/chatUtils.ts`.

### Chamada à API

**Gemini:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
Body: { contents: [{ role, parts: [{ text }] }] }
```

**Claude:**
```
POST https://api.anthropic.com/v1/messages
Headers: x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access: true
Body: { model, max_tokens, system, messages }
```

Monte o prompt conforme template em `chat-rules.md` — com ou sem chunks dependendo do modo.

### Renderização das mensagens
- Mensagens do usuário alinhadas à direita
- Respostas do Vibe Codinho à esquerda com avatar "VC"
- Parsing simples de markdown nas respostas (bold, links, code inline)
- Links de fontes renderizados como `<a href>` clicáveis

## Etapa 3 — Registro no Quartz

1. Exporte o componente em `quartz/components/index.ts`:
   ```ts
   export { default as ChatWidget } from "./ChatWidget"
   ```

2. Importe e adicione em `quartz.layout.ts` como componente de página:
   ```ts
   afterBody: [Component.ChatWidget()],
   ```

## Etapa 4 — Estilos

Em `quartz/styles/custom.scss`, adicione seção `// === Vibe Codinho Chat ===`:

- Botão flutuante: posição `fixed`, bottom 24px, right 24px, z-index 9999
- Modal: `fixed`, bottom 90px, right 24px, width 380px, height 520px, border-radius 12px
- Suporte a `[data-theme="dark"]` e `[data-theme="light"]`
- Animação de entrada (slide-up + fade)
- Scrollbar fina e discreta no histórico de mensagens
- Code blocks dentro das respostas com background diferenciado

## Etapa 5 — Validação final

```bash
npx quartz build
```

Critérios de aceite:
- [ ] Build passa sem erros
- [ ] `public/search-chunks.json` foi gerado
- [ ] Botão 💬 aparece em todas as páginas
- [ ] Onboarding aparece quando não há key no localStorage
- [ ] Chat responde em PT-BR
- [ ] Fontes aparecem como links clicáveis
- [ ] Toggle Doc/Global funciona
- [ ] Dark e light mode sem quebra visual
