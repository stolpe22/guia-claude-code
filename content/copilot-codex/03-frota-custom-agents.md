# FASE 3: Criando a Frota de Custom Agents Especializados

[← Anterior: Instruções](./02-cerebro-instrucoes.md) · [Índice](./README.md) · [Próxima: Hooks →](./04-hooks-seguranca.md)

---

> Custom Agents rodam como **subagentes** com janelas de contexto independentes, ferramentas restritas e especializações definidas.

## Estrutura de Pastas

```
seu-projeto/
├── .github/
│   └── agents/
│       ├── code-reviewer.agent.md
│       ├── architect.agent.md
│       ├── test-writer.agent.md
│       └── db-reader.agent.md
```

- **Agentes de projeto:** `.github/agents/` (vai pro Git)
- **Agentes pessoais:** `~/.copilot/agents/` (disponíveis em todos os projetos)

> 📖 [Documentação oficial](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli)

## Anatomia de um Custom Agent

```markdown
---
name: nome-do-agente
description: O que ele faz e QUANDO usá-lo
tools: ["read", "search", "edit"]   # Ferramentas PERMITIDAS (omitir = todas)
model: gpt-4o                       # Modelo (opcional)
---

System prompt em Markdown aqui.
Define o comportamento do agente.
```

**Ferramentas disponíveis (aliases):**

| Alias | Aliases compatíveis | O que faz |
|---|---|---|
| `execute` | `shell`, `Bash`, `powershell` | Executa comandos no terminal |
| `read` | `Read`, `NotebookRead` | Lê conteúdo de arquivos |
| `edit` | `Edit`, `MultiEdit`, `Write`, `NotebookEdit` | Edita/cria arquivos |
| `search` | `Grep`, `Glob` | Busca arquivos e texto |
| `agent` | `custom-agent`, `Task` | Invoca outro custom agent |
| `web` | `WebSearch`, `WebFetch` | Busca na web |

> **Diferença do Claude Code:** No Copilot, não existe `disallowedTools`. Você lista **apenas** as ferramentas permitidas no campo `tools`. Se omitir, o agente tem acesso a tudo.

---

## Agentes Prontos

### 🔍 Code Reviewer (Gatekeeper)

```markdown
---
name: code-reviewer
description: >
  Especialista em revisão de código. Valida segurança, senhas expostas e qualidade.
  Use quando pedir revisão de código, code review, ou análise de segurança.
tools: ["read", "search", "execute"]
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
4. Se encontrar secrets expostos, marque como 🔴 CRÍTICO imediatamente.
```

> ⚠️ `tools` **não inclui** `edit` — o reviewer não consegue escrever código.

### 🏗️ Architect

```markdown
---
name: architect
description: >
  Analisa arquitetura, propõe melhorias e documenta decisões técnicas.
  Use quando pedir análise de arquitetura, ADRs ou design de sistema.
tools: ["read", "search"]
---

Você é um Arquiteto de Software com 15 anos de experiência.

Quando invocado:
1. Analise a estrutura do projeto e dependências.
2. Identifique problemas (acoplamento, responsabilidades, escalabilidade).
3. Proponha melhorias usando ADRs (Architecture Decision Records).
4. Não escreva código — apenas documente decisões e diagramas.
5. Considere sempre: escalabilidade, manutenibilidade, custo e segurança.
```

### 🧪 Test Writer

```markdown
---
name: test-writer
description: >
  Especialista em testes automatizados. Use após criar funcionalidades
  ou quando pedir para escrever testes.
tools: ["read", "edit", "search", "execute"]
---

Você é um especialista em testes de software.

Quando invocado:
1. Analise o código que precisa de testes.
2. Escreva testes unitários e de integração.
3. Use pytest com fixtures e parametrize.
4. Cubra edge cases, erros de input e condições de contorno.
5. Garanta testes determinísticos e independentes.
6. Rode os testes para verificar que passam antes de finalizar.
```

### 🗄️ DB Reader (Somente Leitura)

```markdown
---
name: db-reader
description: >
  Executa queries de leitura no banco. Bloqueado de fazer escrita.
  Use quando precisar consultar dados ou analisar o banco.
tools: ["execute", "read"]
---

Você é um analista de banco de dados com **apenas** permissão de leitura (SELECT).

Regras:
1. Nunca execute INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE.
2. Explique o que a query faz antes de executá-la.
3. Formate resultados em tabelas legíveis.
4. Se pedirem escrita, avise que não tem permissão.
5. Use LIMIT em queries para evitar sobrecarga.
```

> ⚠️ O guard rail de SQL real é feito via **Hook** (veja [Fase 4](./04-hooks-seguranca.md)), não apenas pelo prompt.

---

## Criando Agentes via CLI

Sem criar arquivo na mão:

1. Abra o terminal e rode `copilot`
2. Digite `/agent`
3. Selecione **"Create new agent"**
4. Escolha escopo (Project ou User)
5. Descreva o agente ou deixe o Copilot gerar
6. Reinicie a CLI para carregar

---

## Usando Codex como Agente no GitHub.com

O OpenAI Codex funciona como um **coding agent alternativo** no GitHub. Para usá-lo:

1. Habilite nas policies do repositório: [Managing policies](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies#enabling-or-disabling-third-party-agents-in-your-repositories)
2. Na aba **Agents** do repo, selecione "OpenAI Codex" no dropdown
3. Ele lê os mesmos `copilot-instructions.md`, `AGENTS.md` e custom agents
4. Roda em sandbox isolado automaticamente

---

[← Anterior: Instruções](./02-cerebro-instrucoes.md) · [Índice](./README.md) · [Próxima: Hooks →](./04-hooks-seguranca.md)