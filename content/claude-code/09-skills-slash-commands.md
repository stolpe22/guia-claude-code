---
title: "09 ⚡ Skills e Slash Commands"
tags: [claude-code, skills, slash-commands, produtividade, automacao, fluxo-de-trabalho]
---

# FASE 9: Skills e Slash Commands

[[08-mcp-ferramentas|← Anterior: MCP]] · [[README|Índice]] · [[10-ci-cd-nao-interativo|Próxima: CI/CD →]]

---

> Skills são slash commands customizados — prompts reutilizáveis que você invoca com `/nome`. São a forma de padronizar fluxos repetitivos e garantir que toda a equipe execute as mesmas etapas.

## Slash Commands Nativos

Antes de criar skills customizadas, conheça os nativos:

| Comando | O que faz |
|---|---|
| `/help` | Lista todos os comandos disponíveis |
| `/agents` | Menu interativo para criar/gerenciar agentes |
| `/mcp` | Lista servidores MCP conectados e suas ferramentas |
| `/memory` | Ver, editar e limpar a memória persistente da sessão |
| `/permissions` | Exibe o que o agente atual pode e não pode fazer |
| `/status` | Modelo em uso, tokens consumidos, custo estimado |
| `/cost` | Custo detalhado da sessão atual em tokens e USD |
| `/compact` | Compacta o histórico para economizar tokens (mantém resumo) |
| `/clear` | Limpa o contexto sem encerrar a sessão |
| `/doctor` | Diagnóstico da instalação (versão, autenticação, MCP) |
| `/resume` | Retoma a sessão anterior |

> **Dica:** `/compact` é essencial em sessões longas. O Claude compacta automaticamente quando o contexto chega em ~80%, mas você pode acionar antes.

---

## Skills Customizadas

### Estrutura de Pastas

```
~/.claude/skills/              ← Global: disponível em todos os projetos
.claude/skills/                ← Projeto: vai pro Git, compartilhado com time
```

Cada skill é um arquivo `.md` — o nome do arquivo vira o comando:

```
.claude/skills/review-pr.md    →  /review-pr
.claude/skills/deploy-check.md →  /deploy-check
.claude/skills/daily-report.md →  /daily-report
```

### Anatomia de uma Skill

```markdown
---
description: Breve descrição (aparece no autocomplete do /)
---

Prompt completo da skill em Markdown.
O Claude executa este prompt ao invocar /nome-da-skill.

Você pode usar $ARGUMENTS para capturar o que o usuário digitar após o comando:
Ex: /review-pr 123  →  $ARGUMENTS = "123"
```

---

## Skills Prontas para Usar

### 📋 /review-pr

Revisa o PR atual com foco em segurança, qualidade e testes.

```markdown
---
description: Revisa o PR atual — diff, segurança, testes e qualidade.
---

Analise o Pull Request atual seguindo estas etapas:

1. Rode `gh pr diff` para ver todas as mudanças
2. Rode `gh pr view` para contexto (título, descrição, labels)
3. Avalie segurança, qualidade, testes e documentação
4. Gere relatório com 🔴 Bloqueadores, 🟡 Avisos, 🟢 Sugestões
5. Poste com `gh pr review --comment -b "seu relatório"`
```

**Como usar:** `/review-pr`

---

### 🚀 /deploy-check

Checklist completo antes de um deploy em produção.

```markdown
---
description: Checklist completo antes de um deploy em produção.
---

Execute o checklist de pre-deploy:

1. **Testes:** `pytest --tb=short -q`
2. **Lint:** `ruff check . && mypy .`
3. **Migrations:** `alembic history` — pendentes?
4. **Envs:** `.env.production` tem todas as vars do `.env.example`?
5. **Changelog:** `git log origin/main..HEAD --oneline`
6. **Deps:** `pip list --outdated` — CVEs conhecidos?

Gere relatório GO/NO-GO com justificativa.
```

**Como usar:** `/deploy-check`

---

### 📊 /daily-report

Relatório diário de atividade do repositório pronto para Slack.

```markdown
---
description: Gera relatório diário de atividade do repositório.
---

Gere o relatório de atividade do dia:

1. `git log --since="24 hours ago" --oneline --all`
2. `gh pr list --state open`
3. `gh issue list --assignee @me --state open`
4. `gh run list --limit 5`

Formate em Markdown:
- ✅ Concluído, 🔄 Em progresso, 🚧 Bloqueios, 📋 Próximos passos
```

**Como usar:** `/daily-report`

---

### 🔒 /security-scan

Auditoria de segurança completa do repositório.

```markdown
---
description: Scan de segurança completo do repositório.
---

Auditoria completa:

1. **Dependências:** `pip-audit` ou `npm audit`
2. **Segredos expostos:** busca por `password`, `secret`, `api_key`, `token`
3. **SQL Injection:** queries com concatenação de string?
4. **Envs hardcoded:** valores que deveriam ser variáveis de ambiente?
5. **Permissões:** `find . -name "*.sh" -perm /o+w`
6. **Headers:** CORS, CSRF, rate limiting configurados?

Classifique: Crítico / Alto / Médio / Baixo + remediação.
```

**Como usar:** `/security-scan`

---

### 🧪 /test-coverage

Analisa cobertura e aponta gaps críticos para o [[03-frota-subagentes|@test-writer]] implementar.

```markdown
---
description: Analisa cobertura de testes e aponta gaps críticos.
---

Analise a cobertura de testes:

1. `pytest --cov=. --cov-report=term-missing -q`
2. Módulos com cobertura < 80%
3. Para cada módulo crítico: funções não testadas, edge cases, complexidade
4. Priorize: lógica de negócio > utils > scripts
5. Plano de ação por impacto (não escreva os testes — gere o plano para @test-writer)
```

**Como usar:** `/test-coverage`

---

### 🏗️ /adr

Cria um ADR (Architecture Decision Record) formatado.

```markdown
---
description: Cria um ADR (Architecture Decision Record). Use: /adr <título>
---

Crie um ADR para: $ARGUMENTS

Template:

# ADR-NNN: $ARGUMENTS

**Status:** Proposed | **Data:** hoje | **Autores:** `git config user.name`

## Contexto
## Decisão
## Consequências (Positivas / Negativas)
## Alternativas Consideradas

Salve em `docs/adr/ADR-NNN-titulo-kebab-case.md`.
Consulte `ls docs/adr/` para o próximo número.
```

**Como usar:** `/adr Migrar de REST para GraphQL`

---

## Combinando Skills com Agentes

Skills invocam o Claude principal, mas você pode direcionar para um agente:

```markdown
---
description: Review de PR usando o agente especializado.
---

@code-reviewer revise o PR atual:
1. `gh pr diff` para ver as mudanças
2. Foque em segurança e testes
3. Seja rigoroso — este PR vai para produção
```

---

## Dica: `/compact` em Sessões Longas

Quando a sessão acumula muito contexto (implementações longas, muitos arquivos lidos):

```
/compact
```

O Claude cria um resumo denso e descarta o histórico bruto. Use antes de:
- Pedir uma nova feature grande
- Trocar de contexto (de backend para frontend)
- Sessões que passam de 1-2 horas

---

[[08-mcp-ferramentas|← Anterior: MCP]] · [[README|Índice]] · [[10-ci-cd-nao-interativo|Próxima: CI/CD →]]
