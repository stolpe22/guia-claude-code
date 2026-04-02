# FASE 9: Skills e Slash Commands

[← Anterior: MCP](./08-mcp-ferramentas.md) · [Índice](./README.md) · [Próxima: CI/CD →](./10-ci-cd-nao-interativo.md)

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

> [📋 Copiar arquivo](./arquivos/skills/review-pr.md)

```markdown
---
description: Revisa o PR atual — diff, segurança, testes e qualidade.
---

Analise o Pull Request atual seguindo estas etapas:

1. Rode `gh pr diff` para ver todas as mudanças
2. Rode `gh pr view` para contexto (título, descrição, labels)
3. Avalie:
   - **Segurança**: credenciais expostas, inputs não validados, SQL injection
   - **Qualidade**: DRY, SOLID, complexidade desnecessária
   - **Testes**: cobertura das mudanças, edge cases cobertos
   - **Documentação**: funções públicas documentadas
4. Gere um relatório estruturado:
   - 🔴 Bloqueadores (impedem merge)
   - 🟡 Avisos (devem ser corrigidos)
   - 🟢 Sugestões (nice-to-have)
5. Poste o review com `gh pr review --comment -b "seu relatório"`
```

**Como usar:**
```
/review-pr
```

---

### 🚀 /deploy-check

> [📋 Copiar arquivo](./arquivos/skills/deploy-check.md)

```markdown
---
description: Checklist completo antes de um deploy em produção.
---

Execute o checklist de pre-deploy:

1. **Testes:** `pytest --tb=short -q` — reporte falhas
2. **Lint:** `ruff check . && mypy .` — reporte erros de tipo
3. **Migrations pendentes:** `alembic history` — verifique se há migrations não aplicadas
4. **Variáveis de ambiente:** verifique se `.env.production` tem todas as variáveis do `.env.example`
5. **Changelog:** leia `git log origin/main..HEAD --oneline` — liste o que será deployado
6. **Dependências:** `pip list --outdated` — alerte sobre deps com CVEs conhecidos

Gere um relatório GO/NO-GO com justificativa clara.
```

**Como usar:**
```
/deploy-check
```

---

### 📊 /daily-report

> [📋 Copiar arquivo](./arquivos/skills/daily-report.md)

```markdown
---
description: Gera relatório diário de atividade do repositório.
---

Gere o relatório de atividade do dia:

1. `git log --since="24 hours ago" --oneline --all` — commits do dia
2. `gh pr list --state open` — PRs aguardando review
3. `gh issue list --assignee @me --state open` — issues abertas para você
4. `gh run list --limit 5` — últimas execuções de CI/CD

Formate em Markdown pronto para colar no Slack:
- ✅ O que foi concluído
- 🔄 Em progresso
- 🚧 Bloqueios
- 📋 Próximos passos
```

**Como usar:**
```
/daily-report
```

---

### 🧪 /test-coverage

> [📋 Copiar arquivo](./arquivos/skills/test-coverage.md)

```markdown
---
description: Analisa cobertura de testes e aponta gaps críticos.
---

Analise a cobertura de testes do projeto:

1. Rode `pytest --cov=. --cov-report=term-missing -q`
2. Identifique módulos com cobertura abaixo de 80%
3. Para cada módulo crítico sem cobertura, liste:
   - Funções/classes não testadas
   - Casos de borda mais prováveis
   - Complexidade ciclomática estimada
4. Priorize por risco: lógica de negócio > utils > scripts
5. Gere um plano de ação ordenado por impacto

Não escreva os testes — apenas o plano para @test-writer implementar.
```

**Como usar:**
```
/test-coverage
```

---

### 🔒 /security-scan

> [📋 Copiar arquivo](./arquivos/skills/security-scan.md)

```markdown
---
description: Scan de segurança completo do repositório.
---

Execute uma auditoria de segurança completa:

1. **Dependências:** `pip-audit` ou `npm audit` — CVEs conhecidos
2. **Segredos expostos:** busque por `password`, `secret`, `api_key`, `token` em arquivos de código (excluindo `.env` e testes)
3. **SQL Injection:** busque por queries com concatenação de string em vez de parâmetros
4. **Variáveis de ambiente:** verifique se há valores hardcoded que deveriam ser envs
5. **Permissões de arquivo:** `find . -name "*.sh" -perm /o+w` — scripts world-writable
6. **Headers de segurança:** se for API web, verifique CORS, CSRF, rate limiting

Classifique tudo em Crítico / Alto / Médio / Baixo com remediação recomendada.
```

**Como usar:**
```
/security-scan
```

---

### 🏗️ /adr (Architecture Decision Record)

> [📋 Copiar arquivo](./arquivos/skills/adr.md)

```markdown
---
description: Cria um ADR (Architecture Decision Record) para uma decisão técnica. Use: /adr <título>
---

Crie um ADR para a decisão: $ARGUMENTS

Siga o template:

# ADR-NNN: $ARGUMENTS

**Status:** Proposed
**Data:** (data de hoje)
**Autores:** (branch/usuário atual)

## Contexto
Descreva o problema ou situação que motivou esta decisão.

## Decisão
Descreva a decisão tomada de forma clara e direta.

## Consequências
### Positivas
- ...

### Negativas / Trade-offs
- ...

## Alternativas Consideradas
| Alternativa | Por que foi descartada |
|---|---|
| ... | ... |

Salve em `docs/adr/ADR-NNN-titulo-kebab-case.md`.
Incremente o número baseado nos ADRs existentes em `docs/adr/`.
```

**Como usar:**
```
/adr Migrar de REST para GraphQL na API de produtos
```

---

## Combinando Skills com Agentes

Skills invocam o Claude principal, mas você pode direcionar para um agente:

```markdown
---
description: Review de PR usando o code-reviewer especializado.
---

@code-reviewer revise o PR atual:
1. `gh pr diff` para ver as mudanças
2. Foque especialmente em segurança e testes
3. Seja rigoroso — este PR vai para produção
```

---

## Dica: `/compact` em Sessões Longas

Quando a sessão acumula muito contexto (implementações longas, muitos arquivos lidos):

```
/compact
```

O Claude cria um resumo denso do que foi feito e descarta o histórico bruto. O trabalho continua, mas com tokens liberados. Use antes de:
- Pedir uma nova feature grande
- Trocar de contexto (de backend para frontend)
- Sessões que passam de 1-2 horas

---

[← Anterior: MCP](./08-mcp-ferramentas.md) · [Índice](./README.md) · [Próxima: CI/CD →](./10-ci-cd-nao-interativo.md)
