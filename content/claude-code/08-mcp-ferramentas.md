---
title: "08 🔌 MCP e Ferramentas Externas"
tags: [claude-code, mcp, integracao, ferramentas, github, postgresql, slack, knowledge-base]
---

# FASE 8: MCP — Conectando Ferramentas Externas

[[07-hooks-avancados|← Anterior: Hooks Avançados]] · [[README|Índice]] · [[09-skills-slash-commands|Próxima: Skills →]]

---

> MCP (Model Context Protocol) é o padrão aberto da Anthropic que permite ao Claude Code se conectar a sistemas externos — banco de dados, GitHub, Slack, APIs — como se fossem ferramentas nativas.

## O que é MCP

```
Claude Code
    │
    │  (protocolo MCP)
    │
    ├── MCP Server: GitHub ────── lê PRs, issues, commits
    ├── MCP Server: PostgreSQL ── executa queries seguras
    ├── MCP Server: Slack ──────── lê canais, envia mensagens
    ├── MCP Server: Filesystem ── acesso controlado a arquivos
    └── MCP Server: KB Vetorial ─ busca semântica nos seus docs
```

Cada servidor MCP expõe **ferramentas** que o Claude usa nativamente. É transparente: o Claude chama `mcp__github__list_pull_requests()` da mesma forma que chama `Read()`.

---

## Onde Configurar

```json
// .claude/settings.json  (projeto) ou  ~/.claude/settings.json  (global)
{
  "mcpServers": {
    "nome-do-servidor": {
      "command": "npx",
      "args": ["-y", "@pacote/mcp-server"],
      "env": {
        "VARIAVEL": "${VARIAVEL_DO_HOST}"
      }
    }
  }
}
```

> Os servidores MCP iniciam automaticamente quando você abre o Claude Code.

---

## Servidores MCP Essenciais

### 🐙 GitHub

Lê e interage com repositórios, PRs, issues e Actions.

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

**Ferramentas disponíveis:**
- Listar/criar/atualizar issues e PRs
- Ler diffs de commits
- Pesquisar código no repositório
- Criar comentários em revisões

**Como usar:**
```
Liste os PRs abertos com label "bug" e resumo das mudanças.
```

---

### 🗄️ PostgreSQL

Executa queries diretamente no banco — com controle total de permissões via credenciais.

```json
"postgres": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"]
}
```

> Use um usuário de banco **somente-leitura** para máxima segurança. Combine com o hook `validate-readonly-query.sh` da [[04-hooks-seguranca|Fase 4]].

**Como usar:**
```
Quais são os 10 usuários com mais pedidos nos últimos 30 dias?
```

---

### 💬 Slack

Lê canais, threads e histórico. Pode enviar mensagens (configure com cuidado).

```json
"slack": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
    "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
  }
}
```

**Como usar:**
```
Resuma as últimas discussões do canal #incidents das últimas 24h.
```

---

### 📁 Filesystem (Acesso Controlado)

Expõe diretórios específicos como ferramentas, com controle de escopo mais fino que as ferramentas nativas.

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/workspace/docs",
    "/workspace/specs"
  ]
}
```

> Útil para dar acesso a pastas específicas a subagentes com ferramentas nativas restritas.

---

### 🔍 Brave Search

Busca na web sem expor o prompt do usuário ao Google.

```json
"brave-search": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "${BRAVE_API_KEY}"
  }
}
```

**Como usar:**
```
Pesquise sobre as últimas vulnerabilidades no FastAPI reportadas em 2025.
```

---

### 🎭 Puppeteer (Browser Automation)

Permite ao Claude navegar em páginas web, tirar screenshots e interagir com UIs.

```json
"puppeteer": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
}
```

**Como usar:**
```
Abra http://localhost:3000 e verifique se o dashboard carrega sem erros.
```

---

### 🧠 Base de Conhecimento Vetorial (Supabase)

Para documentação interna, RFCs, Confluence — a KB da empresa.

```json
"knowledge-base": {
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server"],
  "env": {
    "SUPABASE_URL": "${SUPABASE_URL}",
    "SUPABASE_KEY": "${SUPABASE_SERVICE_KEY}"
  }
}
```

> Veja [[02-cerebro-knowledge-bases|Fase 2]] para o fluxo completo de ingestão de dados (N8N → banco vetorial → MCP).

**Como usar:**
```
Qual é o processo de aprovação de deploy em produção segundo as nossas políticas internas?
```

---

## MCP em Subagentes Específicos

Você pode restringir servidores MCP a agentes específicos — o YAML do agente herda apenas os MCPs que você declarar:

```yaml
---
name: github-analyst
description: Analisa PRs, issues e métricas do repositório GitHub.
tools: Read, Grep
mcpServers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}"
---
Você é um analista de repositório GitHub.

Quando invocado:
1. Use as ferramentas MCP do GitHub para listar PRs, issues e commits recentes.
2. Identifique padrões: quais áreas têm mais bugs? Quais PRs estão travados?
3. Gere um relatório semanal em Markdown.
```

---

## Gerenciando MCP no Terminal

```bash
# Ver todos os servidores MCP conectados
/mcp

# Saída esperada:
# ✅ github       — conectado (12 ferramentas)
# ✅ postgres     — conectado (4 ferramentas)
# ❌ slack        — erro de conexão (verifique SLACK_BOT_TOKEN)
```

---

## Fluxo Completo: MCP + Subagentes + Hooks

```
Você: "@github-analyst analise os PRs da última semana"
         │
         ▼
  Subagente github-analyst inicia
         │
         ▼
  MCP GitHub autentica com GITHUB_TOKEN
         │
         ▼
  Ferramenta mcp__github__list_pull_requests() chamada
         │
         ▼
  PreToolUse hook verifica (se configurado)
         │
         ▼
  Dados retornam → Claude analisa → Relatório gerado
```

---

## Onde Encontrar Mais Servidores MCP

- Catálogo oficial: `modelcontextprotocol.io/servers`
- Repositórios oficiais: `github.com/modelcontextprotocol`
- Servidores da comunidade: Linear, Jira, Notion, Datadog, Sentry, AWS, Kubernetes

---

[[07-hooks-avancados|← Anterior: Hooks Avançados]] · [[README|Índice]] · [[09-skills-slash-commands|Próxima: Skills →]]
