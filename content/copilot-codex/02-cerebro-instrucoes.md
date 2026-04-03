# FASE 2: O Cérebro do Projeto e Instruções Customizadas

[← Anterior: Dev Container](./01-isolamento-devcontainer.md) · [Índice](./README.md) · [Próxima: Custom Agents →](./03-frota-custom-agents.md)

---

> O GitHub Copilot tem **3 camadas** de instruções customizadas. Todas trabalham juntas para dar contexto ao agente.

## Camada 1: `copilot-instructions.md` (Equivalente ao CLAUDE.md)

Na raiz do seu projeto, crie `.github/copilot-instructions.md`. É lido **automaticamente** pelo Copilot em todas as interações.

> 📖 [Documentação oficial](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)

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

## Build & Test
- Sempre rode `npm install` antes de buildar
- Para testes: `pytest --cov=src --cov-report=term-missing`
- Lint: `ruff check .` e `mypy src/`
```

> **💡 Dica PRO:** Você pode pedir ao próprio Copilot Coding Agent para gerar esse arquivo! Use o prompt da [documentação oficial](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) na aba Agents do GitHub.

---

## Camada 2: `AGENTS.md` (Instruções para Agentes)

Crie um arquivo `AGENTS.md` na raiz do repositório (ou em subdiretórios). O agente mais próximo no directory tree prevalece.

> 📖 [Spec completa do AGENTS.md](https://github.com/agentsmd/agents.md)

```markdown
# Instruções para Agentes de IA

## Contexto do Projeto
Este é um sistema de e-commerce B2B. O agente deve considerar:
- Multi-tenancy: cada empresa é um tenant isolado
- Compliance: LGPD para dados pessoais
- Performance: endpoints devem responder em < 200ms

## Regras de Trabalho
1. Nunca modifique arquivos em `infra/` sem aprovação explícita
2. Sempre crie testes para código novo
3. Use Conventional Commits
4. Documente decisões arquiteturais como ADRs em `docs/adr/`

## Padrões Proibidos
- ❌ Hardcoded secrets
- ❌ `eval()` ou `exec()` em qualquer linguagem
- ❌ `SELECT *` em queries de produção
- ❌ Dependências com vulnerabilidades conhecidas
```

> **Diferença importante:** `copilot-instructions.md` é lido em **toda** interação. `AGENTS.md` é lido especificamente por **agentes** (coding agent, Codex, CLI).

---

## Camada 3: Instruções por Caminho (Path-Specific)

Para instruções que só se aplicam a partes do projeto:

```
.github/
└── instructions/
    ├── backend.instructions.md
    ├── frontend.instructions.md
    └── database.instructions.md
```

Exemplo `.github/instructions/backend.instructions.md`:

```markdown
---
applyTo: "src/api/**/*.py,src/services/**/*.py"
---

# Instruções para Backend Python

- Use async/await em todo handler FastAPI
- Valide TODOS os inputs com Pydantic BaseModel
- Retorne sempre ResponseModel tipado
- Erros devem usar HTTPException com códigos corretos
- Logs estruturados com structlog
```

---

## Skills (Habilidades Especializadas)

Skills são pacotes de instruções + scripts que o Copilot carrega **sob demanda** quando relevante.

```
.github/
└── skills/
    ├── debug-actions/
    │   └── SKILL.md
    ├── database-migration/
    │   ├── SKILL.md
    │   └── migrate.sh
    └── security-audit/
        ├── SKILL.md
        └── checklist.md
```

Exemplo `.github/skills/database-migration/SKILL.md`:

```markdown
---
name: database-migration
description: Guia para criar e executar migrações de banco de dados. Use quando pedirem para criar, alterar ou migrar tabelas.
---

Para criar migrações neste projeto:

1. Use Alembic: `alembic revision --autogenerate -m "descrição"`
2. Revise o arquivo gerado em `alembic/versions/`
3. Aplique: `alembic upgrade head`
4. Teste rollback: `alembic downgrade -1`
5. Nunca delete colunas sem criar migration de dados primeiro
6. Sempre adicione `nullable=True` em colunas novas de tabelas existentes
```

> **Skills vs Instructions:** Use instruções para regras gerais (padrão de código). Use skills para procedimentos detalhados que o agente só precisa quando está fazendo aquela tarefa específica.

---

## Knowledge Bases Externas (via MCP)

Mesma abordagem do Claude Code — MCP conecta o agente a bases de conhecimento externas:

```
Seus Dados  →  N8N (scraping)  →  Banco Vetorial  →  MCP  →  Copilot
                                   (Supabase/Qdrant)
```

No agente ou na config do repo, configure MCP servers:

```yaml
mcp-servers:
  knowledge-base:
    type: local
    command: "npx"
    args: ["-y", "@supabase/mcp-server"]
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

[← Anterior: Dev Container](./01-isolamento-devcontainer.md) · [Índice](./README.md) · [Próxima: Custom Agents →](./03-frota-custom-agents.md)