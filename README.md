# Knowledge Graph — Claude Code & SDD

Handbook corporativo de desenvolvimento com IA, renderizado como **Knowledge Graph interativo** via [Quartz](https://quartz.jzhao.xyz/). Documenta práticas de **SDD (Spec-Driven Development)** com Claude Code — isolamento, subagentes, hooks, MCP, CI/CD e muito mais.

Acesse em produção: **[stolpe22.github.io/guia-claude-code](https://stolpe22.github.io/guia-claude-code)**

---

## O que é esse projeto

É uma base de conhecimento técnica com duas camadas:

1. **Conteúdo** — arquivos Markdown em `content/` organizados por tema, interligados por wikilinks (`[[nome-do-arquivo]]`). Cada arquivo é um nó do grafo.

2. **Vibe Codinho** — assistente de chat RAG embutido no site. O usuário pergunta em linguagem natural e o Codinho responde com base nos documentos, citando as fontes com links clicáveis.

---

## Estrutura do repositório

```
.
├── content/                      ← Toda a documentação (Markdown)
│   ├── index.md                  ← Página inicial
│   ├── conceitos/                ← Fundamentos teóricos
│   ├── claude-code/              ← Guia completo Claude Code (00–10)
│   │   └── arquivos/             ← Templates prontos (.claude/, skills, agents)
│   └── copilot-codex/            ← Guia GitHub Copilot (isolado do grafo)
│
├── quartz/                       ← Engine do site (Quartz v4, não editar)
│   ├── components/
│   │   ├── ChatWidget.tsx        ← Componente do chat (Preact)
│   │   ├── scripts/
│   │   │   └── chat.inline.ts    ← Lógica do chat (BM25 + APIs + UI)
│   │   └── styles/
│   │       └── chat.scss         ← Estilos do widget
│   └── static/
│       └── search-chunks.json    ← Índice RAG gerado automaticamente
│
├── scripts/
│   └── build-chat-index.mjs      ← Gera search-chunks.json a partir dos MDs
│
├── workers/
│   └── chat-proxy/               ← Cloudflare Worker (proxy da API OpenAI)
│       ├── src/index.ts          ← Lógica do Worker
│       └── wrangler.toml         ← Configuração do Cloudflare
│
├── .claude/                      ← Configuração do Claude Code
│   ├── CLAUDE.md                 ← Instruções do projeto para o agente
│   ├── agents/                   ← Subagentes especializados
│   ├── rules/                    ← Regras por contexto
│   └── skills/                   ← Skills (slash commands)
│
├── .github/workflows/
│   ├── deploy.yml                ← Deploy do site no GitHub Pages
│   └── deploy-worker.yml         ← Deploy do Worker no Cloudflare
│
├── quartz.config.ts              ← Configuração do Quartz (tema, locale, plugins)
└── quartz.layout.ts              ← Layout das páginas (componentes, ChatWidget)
```

---

## Como o Vibe Codinho funciona (RAG)

RAG significa **Retrieval-Augmented Generation** — em vez de mandar toda a documentação para o LLM (caro e lento), o sistema busca só os trechos mais relevantes para a pergunta e manda apenas esses.

### Pipeline completo

```
1. BUILD TIME
   scripts/build-chat-index.mjs
        ↓
   Lê todos os .md de content/claude-code/ e content/conceitos/
        ↓
   Divide por seções (##) em chunks de ~500 palavras
        ↓
   Gera quartz/static/search-chunks.json
        ↓
   npx quartz build copia para public/static/search-chunks.json

2. RUNTIME (browser)
   Usuário abre o site
        ↓
   Widget carrega search-chunks.json (fetch local, sem servidor)
        ↓
   Usuário faz uma pergunta
        ↓
   BM25 (busca por relevância) encontra os 4 chunks mais relevantes
        ↓
   System prompt é montado com: persona + chunks + instrução de modo
        ↓
   POST para o Cloudflare Worker (proxy)
        ↓
   Worker chama OpenAI GPT-4o Mini com o contexto
        ↓
   Resposta aparece no chat com fontes linkadas
```

### Estrutura de um chunk

```json
{
  "id": "claude-code/03-frota-subagentes#criando-um-subagente",
  "title": "Frota de Subagentes",
  "section": "Criando um subagente",
  "content": "Para criar um subagente no Claude Code...",
  "url": "/claude-code/03-frota-subagentes",
  "tags": ["claude-code", "subagentes"]
}
```

### Modos de resposta

| Modo | Comportamento |
|---|---|
| **Doc** (padrão) | Responde só com base nos chunks da documentação |
| **Global** | Complementa com conhecimento geral do LLM |

---

## Como funciona o Cloudflare Worker

O Worker é um proxy serverless que fica entre o browser e a OpenAI. A API key **nunca fica exposta no frontend**.

```
Browser (GitHub Pages)
    │
    │  POST /  { systemPrompt, messages, model }
    │  sem nenhuma key
    ▼
Cloudflare Worker (workers.dev)
    │  verifica origin (só aceita stolpe22.github.io e localhost)
    │  aplica rate limit (30 req/min por IP)
    │  injeta OPENAI_API_KEY do ambiente seguro
    ▼
OpenAI API
    │
    ▼
{ text: "resposta..." }  →  browser  →  widget
```

### Segurança do Worker

- **CORS restrito** — só aceita requests de `stolpe22.github.io` e `localhost`
- **Rate limiting** — 30 requisições por minuto por IP (proteção de custo)
- **Modelo fixo** — só permite `gpt-4o-mini` ou `gpt-4o` (sem escalada de custo)
- **Secret seguro** — a key OpenAI fica em variável de ambiente do Cloudflare, nunca no código

### Providers suportados pelo widget

Além do proxy padrão, o usuário pode configurar a própria key:

| Provider | Modelos | Como obter |
|---|---|---|
| OpenAI (proxy, padrão) | GPT-4o Mini | Configurado pelo dono do site |
| Google Gemini | Gemini 2.0 Flash, 2.5 Flash | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — grátis |
| Anthropic Claude | Claude Haiku | [console.anthropic.com](https://console.anthropic.com) — pago |

---

## Pré-requisitos

- Node.js >= 20
- npm >= 10

---

## Instalação

```bash
npm install
```

> Se migrou entre Windows e WSL (ou vice-versa), sempre rode `rm -rf node_modules && npm install` para recompilar os binários nativos.

---

## Rodando localmente

```bash
npx quartz build --serve
```

Acesse em: **http://localhost:8080**

O servidor faz watch em `content/` e rebuilda automaticamente.

---

## Regenerar o índice RAG

O índice é regenerado automaticamente no build. Para rodar manualmente:

```bash
npm run build:index
```

Ou build completo (índice + site):

```bash
npm run build
```

---

## Deploy

### Site (GitHub Pages)

Automático via GitHub Actions ao fazer push para `main`. O workflow `.github/workflows/deploy.yml` cuida disso.

### Cloudflare Worker (proxy)

**Primeira vez (setup):**

```bash
# Instala o Wrangler globalmente
npm install -g wrangler

# Login na conta Cloudflare
wrangler login

# Entra na pasta do worker
cd workers/chat-proxy

# Instala dependências
npm install

# Adiciona a key OpenAI como secret (nunca vai pro código)
wrangler secret put OPENAI_API_KEY
# cole a key quando pedir: sk-proj-...

# Faz o deploy
wrangler deploy
# retorna a URL: https://vibe-codinho-proxy.SEU_USER.workers.dev
```

**Deploys subsequentes:**

Automático via GitHub Actions ao fazer push para `main` com mudanças em `workers/chat-proxy/`. Requer dois secrets no repositório:

| Secret GitHub | Onde pegar |
|---|---|
| `CLOUDFLARE_API_TOKEN` | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) → Create Token → "Edit Cloudflare Workers" |
| `CLOUDFLARE_ACCOUNT_ID` | [dash.cloudflare.com](https://dash.cloudflare.com) → lado direito → Account ID |

---

## Configurando a URL do Worker no site

Após o deploy do Worker, atualize `quartz.layout.ts`:

```ts
afterBody: [Component.ChatWidget({
  proxyUrl: "https://vibe-codinho-proxy.SEU_USER.workers.dev"
})],
```

---

## Adicionando conteúdo

1. Crie ou edite arquivos `.md` dentro de `content/claude-code/` ou `content/conceitos/`
2. Todo arquivo precisa de frontmatter YAML:
   ```yaml
   ---
   title: Título do Documento
   tags: [claude-code, sdd]
   ---
   ```
3. Use **wikilinks** para links internos: `[[nome-do-arquivo]]`
4. Nunca use links Markdown tradicionais `[texto](./arquivo.md)` para referências internas
5. Rode `npm run build` para validar e regenerar o índice RAG

---

## Contribuindo com documentação

- Arquivos em `content/claude-code/` e `content/conceitos/` são indexados pelo RAG
- `content/copilot-codex/` está **fora** do grafo e do índice (isolado intencionalmente)
- Mantenha documentos focados em um único conceito (melhora o grafo e o retrieval)
- Seções com `##` viram chunks individuais no índice — use headings descritivos
