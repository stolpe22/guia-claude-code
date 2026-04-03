---
title: "06 ⚙️ Settings e Permissões"
tags: [claude-code, settings, permissoes, configuracao, hooks, seguranca]
---

# FASE 6: settings.json — Configuração Global e Permissões

[[05-orquestracao-pratica|← Anterior: Orquestração]] · [[README|Índice]] · [[07-hooks-avancados|Próxima: Hooks Avançados →]]

---

> O `settings.json` é o painel de controle central do Claude Code. Mais poderoso que hooks inline nos agentes, ele define permissões, hooks globais e comportamentos padrão de toda a instalação.

## Dois Níveis de Configuração

```
~/.claude/settings.json          ← Global: vale para TODOS os projetos da máquina
.claude/settings.json            ← Projeto: sobrescreve o global, vai para o Git
```

A hierarquia de precedência (maior sobrescreve menor):

```
Flags CLI (--dangerously-skip-permissions)
         ↓
.claude/settings.json  (projeto)
         ↓
~/.claude/settings.json (global)
         ↓
Padrões do Claude Code
```

---

## Estrutura Completa

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "Read(**)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(curl * | bash*)",
      "Bash(sudo *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "scripts/validate-commands.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "scripts/audit-writes.sh"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "scripts/inject-context.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "scripts/notify-slack.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "scripts/session-report.sh"
          }
        ]
      }
    ]
  },
  "env": {
    "ENVIRONMENT": "development",
    "LOG_LEVEL": "debug"
  }
}
```

---

## Seção `permissions`

A forma mais simples de restringir ferramentas — sem escrever scripts.

### `permissions.allow`

Lista de ferramentas e padrões **sempre aprovados automaticamente** (sem pedir confirmação):

```json
"allow": [
  "Read(**)",
  "Grep(**)",
  "Glob(**)",
  "Bash(git *)",
  "Bash(npm run *)",
  "Bash(pytest *)"
]
```

### `permissions.deny`

Lista de ferramentas e padrões **sempre bloqueados**, sem exceção:

```json
"deny": [
  "Bash(rm -rf*)",
  "Bash(curl * | bash*)",
  "Bash(wget * | sh*)",
  "Bash(sudo *)",
  "Bash(chmod 777*)",
  "WebSearch(*)"
]
```

### Sintaxe dos padrões

| Padrão | Significa |
|---|---|
| `"Bash(*)"` | Qualquer comando Bash |
| `"Bash(git *)"` | Bash começando com `git` |
| `"Read(**)"` | Leitura de qualquer arquivo |
| `"Write(src/**)"` | Escrita dentro de `src/` |
| `"Edit(*.md)"` | Edição de arquivos Markdown |

> ⚠️ `deny` tem precedência sobre `allow`. Se um padrão aparece nos dois, **é bloqueado**.

---

## Seção `env`

Variáveis de ambiente disponíveis para todos os hooks e agentes da sessão:

```json
"env": {
  "DATABASE_URL": "${DATABASE_URL}",
  "SLACK_WEBHOOK": "${SLACK_WEBHOOK}",
  "PROJECT_NAME": "meu-projeto",
  "AUDIT_LOG": "/workspace/logs/claude-audit.log"
}
```

> As variáveis do host (`${VAR}`) são expandidas automaticamente.

---

## Estratégia: Global vs Projeto

| O que configurar | Onde colocar |
|---|---|
| Bloqueios de segurança universal (`rm -rf`, `sudo`) | `~/.claude/settings.json` |
| Aprovações automáticas de ferramentas de dev | `~/.claude/settings.json` |
| Hooks específicos do projeto (audit log, DB) | `.claude/settings.json` |
| Variáveis de ambiente do projeto | `.claude/settings.json` |
| Agentes e skills do projeto | `.claude/settings.json` via agentes |

### Exemplo: settings global recomendado

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Grep(**)",
      "Glob(**)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(curl * | bash*)",
      "Bash(wget * | sh*)",
      "Bash(sudo *)",
      "Bash(* --force*)"
    ]
  }
}
```

### Exemplo: settings de projeto (API backend)

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(pytest *)",
      "Bash(ruff *)",
      "Bash(mypy *)",
      "Bash(alembic *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "scripts/validate-commands.sh"}]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{"type": "command", "command": "scripts/audit-writes.sh"}]
      }
    ]
  },
  "env": {
    "DATABASE_URL": "${DATABASE_URL}",
    "ENVIRONMENT": "development"
  }
}
```

---

## Comandos CLI de Configuração

```bash
# Ver configuração atual
claude config list

# Definir um valor global
claude config set --global preferredNotifChannel slack

# Definir valor no projeto
claude config set model opus

# Remover configuração
claude config unset model
```

---

[[05-orquestracao-pratica|← Anterior: Orquestração]] · [[README|Índice]] · [[07-hooks-avancados|Próxima: Hooks Avançados →]]
