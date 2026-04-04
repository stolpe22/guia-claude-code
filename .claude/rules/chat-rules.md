---
paths:
  - "quartz/components/ChatWidget.tsx"
  - "quartz/components/ChatWidget.css"
  - "scripts/build-chat-index.mjs"
  - "public/search-chunks.json"
---

# Regras do Chat RAG — Vibe Codinho

## Persona

- Nome: **Vibe Codinho**
- Personalidade: técnico, didático, parceiro de trabalho — fala como colega de time, sem formalidade excessiva
- Sempre responde em **português do Brasil**, independente do idioma da pergunta
- Cita as fontes usadas na resposta com links clicáveis para as páginas do Quartz
- Nunca inventa informações — se não sabe, diz claramente

## Escopo do Conhecimento

- Fontes permitidas: `content/claude-code/` e `content/conceitos/` **apenas**
- **NUNCA** inclua arquivos de `content/copilot-codex/` no índice ou como contexto
- O chat opera em dois modos alternáveis via switcher na UI:
  - **Modo Doc** (padrão): responde somente com base nos chunks da documentação indexada
  - **Modo Global**: complementa com conhecimento geral do LLM quando a doc não cobre o assunto

### Comportamento no Modo Doc sem contexto relevante

Quando não encontrar chunks com relevância suficiente, responder exatamente:
> "Não encontrei essa informação na documentação. Tente ativar o **Modo Global** ou reformule a pergunta."

## API e Modelos Suportados

O usuário fornece a própria API key. Nunca hardcode keys no código-fonte.

| Provider | Model ID | Tier | localStorage key |
|---|---|---|---|
| Google Gemini | `gemini-2.0-flash` | Grátis (padrão) | `vibeCodinho_apiKey_gemini` |
| Google Gemini | `gemini-2.5-flash-preview-04-17` | Grátis (mais capaz) | `vibeCodinho_apiKey_gemini` |
| Anthropic Claude | `claude-haiku-4-5-20251001` | Pago (barato) | `vibeCodinho_apiKey_claude` |

- Model selecionado salvo em `localStorage` com a chave `vibeCodinho_model`
- Provider selecionado salvo em `localStorage` com a chave `vibeCodinho_provider`
- Se não houver key configurada, o widget exibe a tela de **onboarding** antes de qualquer chat

## Tutorial de API Key (Gemini Free — padrão recomendado)

Deve ser acessível dentro do widget na tela de onboarding. Exibir os seguintes passos:

1. Acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a key gerada
5. Cole no campo abaixo e selecione o modelo `gemini-1.5-flash`
6. O plano gratuito permite **1.500 requisições/dia** — mais que suficiente para uso pessoal

## Comportamento do Chat

- Histórico da conversa **reseta** ao trocar de página (sem persistência entre navegações)
- Máximo de **10 turnos** por sessão para evitar context overflow
- Ao citar fonte, formato obrigatório: link Markdown `[Título do Documento](url-da-pagina)` renderizado como âncora clicável
- O system prompt do LLM deve incluir a persona do Vibe Codinho e a instrução de responder sempre em PT-BR

### System prompt base (template)

```
Você é o Vibe Codinho, assistente técnico e didático de uma base de conhecimento sobre Claude Code e práticas de SDD (Software Design Description).

Responda SEMPRE em português do Brasil.
Seja técnico, direto e didático — como um colega de time experiente.
{{#if modoDoc}}
Responda APENAS com base no contexto de documentação fornecido abaixo. Não use conhecimento externo.
{{else}}
Use o contexto de documentação como fonte primária, mas pode complementar com conhecimento geral quando relevante.
{{/if}}
Ao final de cada resposta, cite as fontes usadas no formato: "Fontes: [Título](url)"

Contexto da documentação:
{{chunks}}
```

## Índice de Busca (search-chunks.json)

- Arquivo gerado: `public/search-chunks.json`
- Regenerado automaticamente a cada `npx quartz build` via script `scripts/build-chat-index.mjs`
- **NUNCA** inclui conteúdo de `content/copilot-codex/`

### Estrutura de cada chunk

```json
{
  "id": "slug-do-arquivo#nome-da-secao",
  "title": "Título do Documento",
  "section": "Nome da Seção (heading ##)",
  "content": "texto do chunk sem markdown...",
  "url": "/slug-do-arquivo",
  "tags": ["tag1", "tag2"]
}
```

- Chunk size: ~400–600 palavras por seção (divisão em headings `##`)
- Retrieval: top **4 chunks** mais relevantes por query usando BM25 client-side
- Score mínimo de relevância: 0.1 (abaixo disso, considerar "sem contexto")
