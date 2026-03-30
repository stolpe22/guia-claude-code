# FASE 2: O Cérebro do Projeto e Bases de Conhecimento

[← Anterior: Dev Container](./01-isolamento-devcontainer.md) · [Índice](./README.md) · [Próxima: Subagentes →](./03-frota-subagentes.md)

---

> Para que a IA não faça "Vibe Coding" (gerar código sem rumo), ela precisa de **contexto**.

## O Arquivo `CLAUDE.md`

Na raiz do seu projeto, crie `CLAUDE.md`. É lido **automaticamente** pelo Claude Code no início de cada sessão.

> [📋 Template pronto](./arquivos/CLAUDE.md)

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

## Bases de Conhecimento (Memory)

### Método 1: Local (Nativo do Claude Code)

Quando um agente tem `memory: project` no YAML, o Claude cria automaticamente:

```
.claude/agent-memory/<nome-do-agente>/
```

A IA acumula aprendizados entre sessões:
- Padrões do código que funcionam
- Erros comuns e como evitá-los
- Decisões arquiteturais tomadas
- Preferências do time

**Não precisa configurar nada.** Basta usar `memory: project` nos seus agentes (veremos na [Fase 3](./03-frota-subagentes.md)).

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

[← Anterior: Dev Container](./01-isolamento-devcontainer.md) · [Índice](./README.md) · [Próxima: Subagentes →](./03-frota-subagentes.md)