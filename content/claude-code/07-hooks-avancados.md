---
title: "07 🪝 Hooks Avançados"
tags: [claude-code, hooks, seguranca, automacao, audit-log, notificacao, ci-cd]
---

# FASE 7: 07 🪝 Hooks Avançados

[[06-settings-permissoes|← Anterior: Settings]] · [[README|Índice]] · [[08-mcp-ferramentas|Próxima: MCP →]]

---

> A [[04-hooks-seguranca|Fase 4]] cobriu `PreToolUse` para bloqueio defensivo. Aqui você aprende os outros 4 tipos de hook — para logging, injeção de contexto, notificações e relatórios pós-sessão.

## Os 5 Tipos de Hook

```
┌─────────────────────────────────────────────────────────────┐
│                    Ciclo de vida de uma sessão               │
│                                                             │
│  [Usuário digita prompt]                                    │
│          │                                                  │
│          ▼                                                  │
│  ① UserPromptSubmit ── injeta contexto ou bloqueia prompt  │
│          │                                                  │
│          ▼                                                  │
│  [Claude processa e decide usar uma ferramenta]             │
│          │                                                  │
│          ▼                                                  │
│  ② PreToolUse ──────── intercepta e bloqueia (exit 2)      │
│          │                                                  │
│          ▼                                                  │
│  [Ferramenta executa]                                       │
│          │                                                  │
│          ▼                                                  │
│  ③ PostToolUse ─────── audit log, validações pós-execução  │
│          │                                                  │
│          ▼                                                  │
│  [Claude quer notificar o usuário]                          │
│          │                                                  │
│          ▼                                                  │
│  ④ Notification ────── dispara alerta externo (Slack etc.) │
│          │                                                  │
│          ▼                                                  │
│  [Claude termina de responder]                              │
│          │                                                  │
│          ▼                                                  │
│  ⑤ Stop ───────────── relatório pós-sessão                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ① UserPromptSubmit — Interceptar o Prompt do Usuário

Dispara **antes** do prompt chegar ao Claude. Use para:
- Injetar contexto automático (data, branch atual, env)
- Bloquear palavras ou padrões proibidos
- Logar todas as interações

### Injetar contexto automático

Crie `scripts/inject-context.sh`:

```bash
#!/bin/bash
# Lê o prompt que o usuário enviou (via stdin em JSON)
INPUT=$(cat)

# Injeta informações do ambiente como contexto adicional
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
DATE=$(date '+%Y-%m-%d %H:%M')
ENV=${ENVIRONMENT:-development}

# Retorna JSON com contexto adicional a ser injetado no prompt
cat <<EOF
{
  "context": "Contexto automático:\n- Branch: ${BRANCH}\n- Data: ${DATE}\n- Ambiente: ${ENV}\n- Diretório: $(pwd)\n"
}
EOF
```

> O Claude lê o campo `"context"` e inclui no raciocínio, sem poluir a conversa.

### Bloquear prompts com informações sensíveis

```bash
#!/bin/bash
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# Bloqueia se o usuário tentar passar chaves/tokens diretamente
if echo "$PROMPT" | grep -iE '(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[A-Z0-9]{16})' > /dev/null; then
    echo "Bloqueado: Credenciais detectadas no prompt. Use variáveis de ambiente." >&2
    exit 2
fi
exit 0
```

### Configuração no settings.json

```json
"UserPromptSubmit": [
  {
    "hooks": [
      {"type": "command", "command": "scripts/inject-context.sh"},
      {"type": "command", "command": "scripts/block-credentials.sh"}
    ]
  }
]
```

---

## ② PreToolUse — Bloquear Antes de Executar

Coberto na [[04-hooks-seguranca|Fase 4]]. Resumo dos exit codes:

| Exit Code | Efeito |
|---|---|
| `0` | Libera — ferramenta executa normalmente |
| `2` | Bloqueia — ferramenta não executa, mensagem stderr mostrada ao Claude |

---

## ③ PostToolUse — Auditoria e Validação Pós-Execução

Dispara **após** a ferramenta executar. Não pode cancelar — serve para logging e ações reativas.

### Audit log de arquivos escritos

Crie `scripts/audit-writes.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
USER=${USER:-claude}

if [ -n "$FILE" ]; then
    echo "${TIMESTAMP} | ${TOOL} | ${FILE} | ${USER}" >> "${AUDIT_LOG:-/workspace/logs/claude-audit.log}"
fi
exit 0
```

### Rodar lint automático após edição

```bash
#!/bin/bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE" == *.py ]]; then
    ruff check "$FILE" --fix --quiet 2>/dev/null || true
elif [[ "$FILE" == *.ts || "$FILE" == *.tsx ]]; then
    npx eslint "$FILE" --fix --quiet 2>/dev/null || true
fi
exit 0
```

### Configuração no settings.json

```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [
      {"type": "command", "command": "scripts/audit-writes.sh"},
      {"type": "command", "command": "scripts/auto-lint.sh"}
    ]
  },
  {
    "matcher": "Bash",
    "hooks": [
      {"type": "command", "command": "scripts/log-commands.sh"}
    ]
  }
]
```

---

## ④ Notification — Alertas Externos

Dispara quando o Claude envia uma notificação (ex: "tarefa concluída", "preciso de sua atenção").

### Alerta no Slack

Crie `scripts/notify-slack.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // empty')
WEBHOOK=${SLACK_WEBHOOK:-""}

if [ -z "$WEBHOOK" ] || [ -z "$MESSAGE" ]; then exit 0; fi

curl -s -X POST "$WEBHOOK" \
  -H 'Content-type: application/json' \
  --data "{\"text\": \"🤖 Claude Code: ${MESSAGE}\"}" \
  > /dev/null 2>&1

exit 0
```

### Notificação no terminal (beep + mensagem)

```bash
#!/bin/bash
INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // empty')

# Envia beep e mostra mensagem no terminal
printf '\007'
echo "🔔 Claude: ${MESSAGE}" > /dev/tty

exit 0
```

### Configuração no settings.json

```json
"Notification": [
  {
    "hooks": [
      {"type": "command", "command": "scripts/notify-slack.sh"}
    ]
  }
]
```

---

## ⑤ Stop — Relatório Pós-Sessão

Dispara quando o Claude **termina de responder** (fim de cada turno). Use para métricas, relatórios e cleanup.

### Relatório de sessão

Crie `scripts/session-report.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
COST=$(echo "$INPUT" | jq -r '.cost_usd // "N/A"')
TOKENS=$(echo "$INPUT" | jq -r '.total_tokens // "N/A"')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

cat >> "${AUDIT_LOG:-/workspace/logs/sessions.log}" <<EOF
---
Sessão: ${SESSION_ID}
Timestamp: ${TIMESTAMP}
Custo: $${COST}
Tokens: ${TOKENS}
EOF

exit 0
```

### Configuração no settings.json

```json
"Stop": [
  {
    "hooks": [
      {"type": "command", "command": "scripts/session-report.sh"}
    ]
  }
]
```

---

## settings.json com Todos os Hooks Ativos

Exemplo completo de `.claude/settings.json` corporativo:

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf*)",
      "Bash(sudo *)",
      "Bash(curl * | bash*)"
    ]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {"type": "command", "command": "scripts/inject-context.sh"},
          {"type": "command", "command": "scripts/block-credentials.sh"}
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {"type": "command", "command": "scripts/validate-commands.sh"}
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {"type": "command", "command": "scripts/audit-writes.sh"},
          {"type": "command", "command": "scripts/auto-lint.sh"}
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {"type": "command", "command": "scripts/notify-slack.sh"}
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {"type": "command", "command": "scripts/session-report.sh"}
        ]
      }
    ]
  },
  "env": {
    "AUDIT_LOG": "/workspace/logs/claude-audit.log",
    "SLACK_WEBHOOK": "${SLACK_WEBHOOK}"
  }
}
```

---

## Tabela Resumo

| Hook | Quando | Pode bloquear? | Uso principal |
|---|---|---|---|
| `UserPromptSubmit` | Antes do prompt chegar ao Claude | ✅ exit 2 | Injetar contexto, bloquear credenciais |
| `PreToolUse` | Antes da ferramenta executar | ✅ exit 2 | Bloquear comandos perigosos |
| `PostToolUse` | Após a ferramenta executar | ❌ | Audit log, lint automático |
| `Notification` | Quando Claude notifica | ❌ | Alertas Slack/Discord |
| `Stop` | Fim de cada turno do Claude | ❌ | Métricas, relatórios de sessão |

---

[[06-settings-permissoes|← Anterior: Settings]] · [[README|Índice]] · [[08-mcp-ferramentas|Próxima: MCP →]]
