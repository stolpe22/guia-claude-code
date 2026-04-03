---
title: "02 🧠 Cérebro e Knowledge Bases"
tags: [claude-code, claude-md, knowledge-base, memoria, mcp, contexto, sdd]
---

# FASE 2: O Cérebro do Projeto e Bases de Conhecimento

[[01-isolamento-devcontainer|← Anterior: Dev Container]] · [[README|Índice]] · [[03-frota-subagentes|Próxima: Subagentes →]]

---

> Para que a IA não faça "Vibe Coding" (gerar código sem rumo), ela precisa de **contexto**.

## O Arquivo `CLAUDE.md`

Na raiz do seu projeto, crie `CLAUDE.md`. É lido **automaticamente** pelo Claude Code no início de cada sessão.

> [[CLAUDE|📋 Template pronto]]

```markdown
# Regras do Projeto

## Arquitetura
- Backend: FastAPI com Python 3.12
- Banco de Dados: PostgreSQL 16 via SQLAlchemy 2.0 (async)
- Frontend: Next.js 14 com TypeScript strict
- Autenticação: JWT + OAuth2

## Convenções de Código
- Sempre use tipagem estrita (mypy strict mode)
- Docstrings em Google Style para toda função pública
- Testes com pytest; cobertura mínima de 80%
- Nunca armazene senhas em texto puro — use bcrypt

## Padrões de Segurança
- Validação de input com Pydantic v2
- Rate limiting em todos os endpoints públicos
- CORS restrito aos domínios de produção
- Variáveis sensíveis apenas via variáveis de ambiente

## Git
- Conventional Commits (feat:, fix:, docs:)
- PRs precisam de pelo menos 1 review
- Branch principal: main
```

> **💡 Dica:** Escreva um `README.md` de arquitetura **antes** de iniciar qualquer desenvolvimento. O Claude lê ambos.

---

## Hierarquia Completa do `CLAUDE.md`

Não existe apenas um `CLAUDE.md` — há **4 camadas**, lidas e combinadas automaticamente:

```
~/.claude/CLAUDE.md                ← Global: vale para TODOS os projetos da máquina
./CLAUDE.md                        ← Raiz do projeto atual
./src/CLAUDE.md                    ← Subpasta: carregado quando o Claude acessa src/
./docs/CLAUDE.md                   ← Subpasta: carregado quando o Claude acessa docs/
```

**Precedência:** subpastas sobrescrevem a raiz, que sobrescreve o global.

### `@import` — Mantendo o CLAUDE.md Modular

Em vez de um arquivo monolítico, importe arquivos específicos:

```markdown
<!-- ./CLAUDE.md -->
# Regras do Projeto

@docs/arquitetura.md
@docs/convencoes-api.md
@docs/seguranca.md
```

O Claude lê todos os arquivos importados como se fossem parte do `CLAUDE.md`. Mantenha cada arquivo focado em um tema — arquitetura, convenções, segurança, etc.

### O `~/.claude/CLAUDE.md` Global

Use para regras que se aplicam a **todos os seus projetos**:

```markdown
<!-- ~/.claude/CLAUDE.md -->
## Regras Pessoais Globais

- Sempre responda em português do Brasil
- Nunca use `any` em TypeScript sem comentário explicativo
- Prefira soluções simples a abstrações prematuras
- Em caso de dúvida arquitetural, pergunte antes de implementar
- Conventional Commits em todos os projetos
```

---

## Bases de Conhecimento (Memory)

### Método 1: Local (Nativo do Claude Code)

O campo `memory` no YAML do agente controla onde a memória é persistida:

| Escopo | Onde salva | Compartilhado com |
|---|---|---|
| `memory: project` | `.claude/agent-memory/<agente>/` | Todo o time (vai pro Git) |
| `memory: user` | `~/.claude/agent-memory/<agente>/` | Só você, em todos os projetos |
| Sem `memory` | — | Sem persistência entre sessões |

Quando configurado, o Claude cria automaticamente:

```
.claude/agent-memory/<nome-do-agente>/
```

A IA acumula aprendizados entre sessões:
- Padrões do código que funcionam
- Erros comuns e como evitá-los
- Decisões arquiteturais tomadas
- Preferências do time

**Não precisa configurar nada além do campo `memory`.** Veja a [[03-frota-subagentes|Fase 3]] para uso nos agentes.

### Gerenciando a Memória Manualmente

```bash
# Ver o que o Claude lembra da sessão
/memory

# Dentro do /memory você pode:
# - Editar entradas incorretas
# - Apagar memórias desatualizadas
# - Adicionar contexto manualmente
```

### Método 2: Externo (via MCP + Banco Vetorial)

Para conhecimentos massivos (documentação privada da empresa, RFCs, Confluence etc.):

```
Seus Dados  →  N8N (scraping)  →  Banco Vetorial  →  MCP  →  Claude Code
                                   (Supabase/Qdrant)
```

**Passo a passo:**

1. **Scraping:** Use [N8N](https://n8n.io/) (ou scripts customizados) para raspar docs, wikis, Confluence, Notion etc.
2. **Vetorização:** Salve tudo num **Banco de Dados Vetorial** (Supabase pgvector, Qdrant, Pinecone, Weaviate)
3. **Conexão MCP:** No YAML do subagente, configure:

```yaml
mcpServers:
  knowledge-base:
    command: "npx"
    args: ["-y", "@supabase/mcp-server"]
    env:
      SUPABASE_URL: "${SUPABASE_URL}"
      SUPABASE_KEY: "${SUPABASE_KEY}"
```

Assim seus agentes consultam toda a base de conhecimento da empresa em tempo real.

---

[[01-isolamento-devcontainer|← Anterior: Dev Container]] · [[README|Índice]] · [[03-frota-subagentes|Próxima: Subagentes →]]