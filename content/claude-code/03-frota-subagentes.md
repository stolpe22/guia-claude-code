---
title: "03 🤖 Frota de Subagentes"
tags: [claude-code, subagentes, agentes, ferramentas, guard-rails]
---

# FASE 3: Criando a Frota de Subagentes Especializados

[[02-cerebro-knowledge-bases|← Anterior: Knowledge Bases]] · [[README|Índice]] · [[04-hooks-seguranca|Próxima: Hooks →]]

---

> Subagentes rodam em **janelas de contexto independentes**, possuem **ferramentas restritas** e permitem desenvolvimento agêntico avançado.

## Estrutura de Pastas

```
seu-projeto/
├── .claude/
│   └── agents/
│       ├── code-reviewer.md
│       ├── architect.md
│       ├── test-writer.md
│       └── db-reader.md
```

- **Agentes de projeto:** `.claude/agents/` (raiz do projeto, vai pro Git)
- **Agentes globais:** `~/.claude/agents/` (disponíveis em todos os projetos da máquina)

## Anatomia de um Agente

```yaml
---
name: nome-do-agente            # Identificador único
description: O que ele faz      # Aparece no menu @
tools: Read, Grep, Glob, Bash   # Ferramentas PERMITIDAS
disallowedTools: Write, Edit    # Ferramentas BLOQUEADAS (guard rail)
model: sonnet                   # Modelo (sonnet, opus, haiku)
memory: project                 # Cria KB local persistente
---
System prompt em Markdown aqui.
Define o comportamento do agente.
```

**Ferramentas disponíveis:**

| Ferramenta | O que faz |
|---|---|
| `Read` | Lê conteúdo de arquivos |
| `Write` | Cria/sobrescreve arquivos |
| `Edit` | Edita partes de arquivos existentes |
| `Grep` | Busca por padrão em arquivos |
| `Glob` | Lista arquivos por padrão (ex: `*.py`) |
| `Bash` | Executa comandos no terminal |

---

## Agentes Prontos

### 🔍 Code Reviewer (Gatekeeper)

> [[code-reviewer|📋 Copiar arquivo]]

```markdown
---
name: code-reviewer
description: Especialista em revisão de código. Valida segurança, senhas expostas e qualidade.
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
model: sonnet
memory: project
---
Você é um Engenheiro de Software Sênior focado em revisão de código.

Quando invocado:
1. Rode `git diff` para ver as alterações recentes.
2. Foque em:
   - **Segurança**: criptografia, senhas/tokens vazados, SQL injection
   - **Qualidade**: complexidade ciclomática, DRY, SOLID
   - **Testes**: cobertura, edge cases
3. **NÃO conserte o código.** Apenas aponte problemas:
   - 🔴 **Crítico**: corrigir antes do merge
   - 🟡 **Avisos**: melhorias importantes
   - 🟢 **Sugestões**: nice-to-have
```

> ⚠️ `disallowedTools: Write, Edit` = se tentar escrever → **bloqueado**.

### 🏗️ Architect

> [[architect|📋 Copiar arquivo]]

```markdown
---
name: architect
description: Analisa arquitetura, propõe melhorias e documenta decisões técnicas.
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
model: opus
memory: project
---
Você é um Arquiteto de Software com 15 anos de experiência.

Quando invocado:
1. Analise a estrutura do projeto e dependências.
2. Identifique problemas (acoplamento, responsabilidades, escalabilidade).
3. Proponha melhorias usando ADRs (Architecture Decision Records).
4. Não escreva código — apenas documente decisões e diagramas.
```

### 🧪 Test Writer

> [[test-writer|📋 Copiar arquivo]]

```markdown
---
name: test-writer
description: Especialista em testes automatizados. Use após criar funcionalidades.
tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
memory: project
---
Você é um especialista em testes de software.

Quando invocado:
1. Analise o código que precisa de testes.
2. Escreva testes unitários e de integração.
3. Use pytest com fixtures e parametrize.
4. Cubra edge cases, erros de input e condições de contorno.
5. Garanta testes determinísticos e independentes.
```

### 🗄️ DB Reader (com Hook de segurança)

> [[db-reader|📋 Copiar arquivo]] — Veja a [[04-hooks-seguranca|Fase 4]] para o hook de segurança.

```markdown
---
name: db-reader
description: Executa queries de leitura no banco. Bloqueado de fazer escrita.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
Você é um analista de banco de dados com **apenas** permissão de leitura (SELECT).

Regras:
1. Nunca execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE.
2. Explique o que a query faz antes de executá-la.
3. Formate resultados em tabelas legíveis.
4. Se pedirem escrita, avise que não tem permissão.
```

---

## Criando Agentes via Terminal (Alternativa)

Sem criar arquivo na mão:

1. Abra o terminal no VS Code (dentro do container)
2. Digite `claude`
3. Digite `/agents`
4. Menu interativo: escolha escopo, ferramentas, descrição
5. O Claude gera o `.md` sozinho

---

[[02-cerebro-knowledge-bases|← Anterior: Knowledge Bases]] · [[README|Índice]] · [[04-hooks-seguranca|Próxima: Hooks →]]