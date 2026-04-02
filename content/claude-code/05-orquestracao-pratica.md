# FASE 5: Comandando a Frota (Orquestração Prática)

[← Anterior: Hooks](./04-hooks-seguranca.md) · [Índice](./README.md)

---

> Agora você é o Comandante. Código e infraestrutura configurados.

## Iniciando

1. Abra o terminal no VS Code (**dentro do Dev Container**)
2. Digite `claude` e aperte Enter

## 3 Formas de Invocar Agentes

### 1. Linguagem Natural

Simplesmente escreva no prompt:

```
Use o subagente code-reviewer para analisar o módulo de login que acabei de fazer.
```

O Claude Code delega automaticamente.

### 2. Menção Direta (@)

Digite `@` no terminal do Claude Code → menu suspenso (typeahead) → selecione o agente:

```
@code-reviewer procure falhas de segurança no meu arquivo main.py
```

```
@architect analise se a estrutura do projeto segue clean architecture
```

```
@test-writer crie testes para o módulo de autenticação em src/auth/
```

### 3. Sessão Dedicada

Abre um terminal 100% focado naquele agente:

```bash
claude --agent db-reader
```

Tudo que você digitar nesse terminal vai rodar com as restrições e ferramentas daquele agente.

---

## Trabalho Paralelo (Aceleração Exponencial)

A grande vantagem: **múltiplos terminais simultâneos**.

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│    Terminal 1        │    Terminal 2        │    Terminal 3        │
│                      │                      │                      │
│  claude --agent      │  claude --agent      │  claude --agent      │
│  frontend-dev        │  db-reader           │  test-writer         │
│                      │                      │                      │
│  "Crie o componente  │  "Quais tabelas      │  "Escreva testes     │
│   de dashboard com   │   têm mais de 1M     │   para o serviço de  │
│   gráficos de        │   de registros?"     │   pagamento"         │
│   vendas"            │                      │                      │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Como fazer:**
1. No VS Code, clique no `+` no painel de terminal
2. Ou use `Ctrl+Shift+5` para dividir o terminal
3. Cada terminal = um agente independente
4. Você coordena os resultados

---

## Fluxo de Trabalho Recomendado

```
1. Você descreve a feature
         │
         ▼
2. Claude Code implementa (terminal principal)
         │
         ▼
3. @code-reviewer analisa as mudanças
         │
    ┌────┴────┐
    │         │
  Passou   Problemas
    │      encontrados
    │         │
    ▼         ▼
4. Merge   Volta pro passo 2
            com feedback
```

## Comandos CLI

| Comando | O que faz |
|---|---|
| `claude` | Inicia o Claude Code |
| `claude --agent <nome>` | Inicia com agente específico |
| `claude --resume` | Retoma a sessão mais recente |
| `claude --resume <id>` | Retoma sessão específica por ID |
| `claude --list-sessions` | Lista sessões disponíveis para retomar |
| `claude -p "prompt"` | Modo não-interativo (CI/CD) |
| `Ctrl+C` | Interrompe a execução atual |

## Slash Commands Nativos

| Comando | O que faz |
|---|---|
| `/help` | Lista todos os comandos disponíveis |
| `/agents` | Menu interativo para criar/gerenciar agentes |
| `/mcp` | Lista servidores MCP conectados e ferramentas |
| `/memory` | Ver e editar a memória persistente da sessão |
| `/permissions` | Exibe o que o agente atual pode/não pode fazer |
| `/status` | Modelo em uso, tokens consumidos, custo estimado |
| `/cost` | Custo detalhado da sessão em tokens e USD |
| `/compact` | Compacta o histórico para economizar tokens |
| `/clear` | Limpa o contexto sem encerrar a sessão |
| `/doctor` | Diagnóstico da instalação do Claude Code |
| `@<nome>` | Menciona e invoca agente inline |

> **Dica:** Use `/compact` em sessões longas antes de mudar de contexto (ex: de backend para frontend). O Claude mantém um resumo denso e libera tokens.

---

## Resumo Visual

```
┌──────────────────────────────────────────────────────┐
│                  SUA MÁQUINA (HOST)                   │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │           DEV CONTAINER (Docker)                 │ │
│  │                                                  │ │
│  │  🔥 Firewall ativo (whitelist)                   │ │
│  │  👤 Usuário não-root (node)                      │ │
│  │  📁 Só vê /workspace (seu projeto)              │ │
│  │                                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│  │  │ Reviewer │ │ Architect│ │DB Reader │        │ │
│  │  │ 🔒no     │ │ 🔒no     │ │ 🔒hook   │        │ │
│  │  │  Write   │ │  Write   │ │  SELECT  │        │ │
│  │  └──────────┘ └──────────┘ └──────────┘        │ │
│  │                                                  │ │
│  │  📄 CLAUDE.md (regras do projeto)               │ │
│  │  🧠 .claude/agent-memory/ (KBs locais)         │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Sem acesso a: ~/.ssh  ~/.aws  ~/.gitconfig  ~/      │
└──────────────────────────────────────────────────────┘
```

---

[← Anterior: Hooks](./04-hooks-seguranca.md) · [Índice](./README.md)