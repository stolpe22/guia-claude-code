# FASE 5: Comandando a Frota (Orquestração Prática)

[← Anterior: Hooks](./04-hooks-seguranca.md) · [Índice](./README.md)

---

> Agora você é o Comandante. A infraestrutura está configurada.

## 3 Ambientes de Trabalho

### 1. GitHub Copilot CLI (Terminal Local)

```bash
# Inicia o Copilot CLI
copilot

# Inicia com agente específico
copilot --agent code-reviewer

# Com prompt direto
copilot --agent test-writer --prompt "Crie testes para src/auth/"
```

### 2. VS Code (Agent Mode / Chat)

1. Abra o Copilot Chat no VS Code
2. Selecione o agente no dropdown (aparece seus custom agents)
3. Interaja naturalmente

### 3. GitHub.com (Coding Agent + Codex)

1. Vá na aba **Agents** do repositório
2. Selecione o agente (Copilot, Codex, Claude, ou custom)
3. Descreva a tarefa
4. O agente cria um PR automaticamente

---

## 4 Formas de Invocar Agentes

### 1. Linguagem Natural

```
Use o agente code-reviewer para analisar o módulo de login.
```

### 2. Slash Command

```
/agent
→ Selecione code-reviewer
→ "Analise o arquivo main.py"
```

### 3. Programaticamente

```bash
copilot --agent db-reader --prompt "Quais tabelas têm mais de 1M registros?"
```

### 4. Via GitHub.com (Issue ou Agents Tab)

Atribua uma issue ao Copilot coding agent com um custom agent selecionado. Ele trabalha em background e abre um PR.

---

## Trabalho Paralelo

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│    Terminal 1        │    Terminal 2        │    Terminal 3        │
│                      │                      │                      │
│  copilot --agent     │  copilot --agent     │  copilot --agent     │
│  test-writer         │  db-reader           │  code-reviewer       │
│                      │                      │                      │
│  "Escreva testes     │  "Quais tabelas      │  "Revise as          │
│   para o serviço de  │   têm mais de 1M     │   mudanças do        │
│   pagamento"         │   de registros?"     │   último commit"     │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

No GitHub.com, você pode rodar **múltiplas sessões de agentes simultaneamente** na aba Agents — cada uma trabalhando em uma issue/feature diferente.

---

## Fluxo de Trabalho Recomendado

```
1. Você descreve a feature (com spec/PRD idealmente)
         │
         ▼
2. Copilot/Codex implementa (cria PR)
         │
         ▼
3. code-reviewer analisa automaticamente (ou via trigger)
         │
    ┌────┴────┐
    │         │
  Passou   Problemas
    │      encontrados
    │         │
    ▼         ▼
4. Merge   Volta pro passo 2
            com feedback no PR
```

---

## Comandos Úteis (CLI)

| Comando | O que faz |
|---|---|
| `copilot` | Inicia o Copilot CLI |
| `copilot --agent <nome>` | Inicia com agente específico |
| `copilot --agent <nome> --prompt "..."` | Executa direto com prompt |
| `/agent` | Menu interativo de agentes (dentro do CLI) |
| `/skills list` | Lista skills disponíveis |
| `/skills` | Toggle skills on/off |
| `/help` | Lista todos os comandos |
| `Ctrl+C` | Interrompe a execução atual |

---

## Resumo Visual

```
┌──────────────────────────────────────────────────────┐
│                  SUA MÁQUINA (HOST)                   │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │           DEV CONTAINER (Docker)                 │ │
│  │                                                  │ │
│  │  👤 Usuário não-root (node)                      │ │
│  │  📁 Só vê /workspace (seu projeto)              │ │
│  │                                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│  │  │ Reviewer │ │ Architect│ │DB Reader │        │ │
│  │  │ 🔒no     │ │ 🔒no     │ │ 🔒hook   │        │ │
│  │  │  edit    │ │  edit    │ │  SELECT  │        │ │
│  │  └──────────┘ └──────────┘ └──────────┘        │ │
│  │                                                  │ │
│  │  📄 .github/copilot-instructions.md             │ │
│  │  📄 AGENTS.md                                   │ │
│  │  📦 .github/skills/                             │ │
│  │  🔒 .github/hooks/hooks.json                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ──── OU ────                                        │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │          GITHUB.COM (Cloud Sandbox)              │ │
│  │                                                  │ │
│  │  🤖 Copilot Coding Agent                        │ │
│  │  🤖 OpenAI Codex Agent                          │ │
│  │  🤖 Anthropic Claude Agent                      │ │
│  │                                                  │ │
│  │  Lêem: copilot-instructions.md + AGENTS.md      │ │
│  │  Usam: Custom Agents + Hooks + Skills           │ │
│  │  Criam: Pull Requests automaticamente           │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Sem acesso a: ~/.ssh  ~/.aws  ~/.gitconfig  ~/      │
└──────────────────────────────────────────────────────┘
```

---

## Comparativo Final: Claude Code vs Copilot/Codex

| Aspecto | Claude Code | GitHub Copilot / Codex |
|---|---|---|
| **Onde roda** | Terminal local (dentro de container) | Terminal local (CLI) + VS Code + GitHub.com |
| **Instruções globais** | `CLAUDE.md` | `.github/copilot-instructions.md` + `AGENTS.md` |
| **Agentes** | `.claude/agents/*.md` | `.github/agents/*.agent.md` |
| **Restrição de tools** | `tools` + `disallowedTools` | Apenas `tools` (lista positiva) |
| **Skills** | Não tem conceito separado | `.github/skills/*/SKILL.md` |
| **Hooks** | YAML inline no agente | `.github/hooks/hooks.json` (centralizado) |
| **Bloqueio em hooks** | `exit 2` | JSON `{"permissionDecision":"deny"}` |
| **Memória persistente** | `memory: project` (nativo) | Não tem nativo (usar MCP) |
| **Cloud agent** | Não (só local) | Sim (aba Agents no GitHub.com) |
| **Multi-agente cloud** | Não | Sim (múltiplas sessões paralelas) |
| **Firewall nativo** | Sim (init-firewall.sh) | Não (sandbox do GitHub.com é automático) |
| **Modelos** | Sonnet, Opus, Haiku | GPT-4o, o3, Claude, Gemini etc. |
| **MCP** | YAML no agente | YAML no agente ou config do repo |

---

[← Anterior: Hooks](./04-hooks-seguranca.md) · [Índice](./README.md)