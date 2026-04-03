# FASE 4: Scripts de Segurança Ativa (Hooks)

[← Anterior: Custom Agents](./03-frota-custom-agents.md) · [Índice](./README.md) · [Próxima: Orquestração →](./05-orquestracao-pratica.md)

---

> Hooks permitem interceptar e validar ações do agente **antes** ou **depois** da execução. São o guard rail real.

## Como Hooks Funcionam no Copilot

```
Agente tenta rodar ferramenta
         │
         ▼
   Hook preToolUse intercepta
         │
         ▼
   Script analisa o comando
         │
    ┌────┴────┐
    │         │
 (nada)    JSON deny
 (libera)  (bloqueia)
    │         │
    ▼         ▼
 Executa   "Bloqueado:
 comando    razão aqui."
```

> 📖 [Documentação oficial de Hooks](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks)

## Diferença do Claude Code

| Aspecto | Claude Code | GitHub Copilot |
|---|---|---|
| Formato config | YAML no agente `.md` | JSON em `.github/hooks/hooks.json` |
| Código de bloqueio | `exit 2` | Output JSON `{"permissionDecision":"deny"}` |
| Código de liberação | `exit 0` (sem output) | `exit 0` (sem output) |
| Hooks disponíveis | `PreToolUse` | `preToolUse`, `postToolUse`, `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `errorOccurred`, `agentStop`, `subagentStop` |

## Configuração: `hooks.json`

Crie `.github/hooks/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "./.github/hooks/scripts/validate-readonly-query.sh",
        "comment": "Bloqueia queries de escrita no banco"
      },
      {
        "type": "command",
        "bash": "./.github/hooks/scripts/pre-tool-policy.sh",
        "comment": "Políticas gerais de segurança"
      }
    ],
    "userPromptSubmitted": [
      {
        "type": "command",
        "bash": "./.github/hooks/scripts/log-prompt.sh",
        "comment": "Auditoria de prompts"
      }
    ]
  }
}
```

## Script: Validação Read-Only SQL

Crie `.github/hooks/scripts/validate-readonly-query.sh`:

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"

TOOL_NAME="$(echo "$INPUT" | jq -r '.toolName // empty')"

# Só valida comandos bash
if [ "$TOOL_NAME" != "bash" ]; then
  exit 0
fi

TOOL_ARGS_RAW="$(echo "$INPUT" | jq -r '.toolArgs // empty')"
if ! echo "$TOOL_ARGS_RAW" | jq -e . >/dev/null 2>&1; then
  exit 0
fi

COMMAND="$(echo "$TOOL_ARGS_RAW" | jq -r '.command // empty')"
if [ -z "$COMMAND" ]; then exit 0; fi

if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
    jq -n '{
      permissionDecision: "deny",
      permissionDecisionReason: "Bloqueado: Apenas queries SELECT são permitidas."
    }'
    exit 0
fi

# Libera
exit 0
```

## Script: Política Geral de Segurança

Crie `.github/hooks/scripts/pre-tool-policy.sh`:

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"

TOOL_NAME="$(echo "$INPUT" | jq -r '.toolName // empty')"

# Só valida bash
if [ "$TOOL_NAME" != "bash" ]; then
  exit 0
fi

TOOL_ARGS_RAW="$(echo "$INPUT" | jq -r '.toolArgs // empty')"
if ! echo "$TOOL_ARGS_RAW" | jq -e . >/dev/null 2>&1; then
  exit 0
fi

COMMAND="$(echo "$TOOL_ARGS_RAW" | jq -r '.command // empty')"

# Bloqueia rm -rf
if echo "$COMMAND" | grep -iE 'rm\s+(-[a-zA-Z]*f|-[a-zA-Z]*r|--force|--recursive)' > /dev/null; then
    jq -n '{
      permissionDecision: "deny",
      permissionDecisionReason: "Bloqueado: Comandos destrutivos de remoção não são permitidos."
    }'
    exit 0
fi

# Bloqueia acesso a diretórios sensíveis
if echo "$COMMAND" | grep -iE '(\/etc\/|\/root\/|~\/\.ssh|~\/\.aws|~\/\.env)' > /dev/null; then
    jq -n '{
      permissionDecision: "deny",
      permissionDecisionReason: "Bloqueado: Acesso a diretórios sensíveis não é permitido."
    }'
    exit 0
fi

# Bloqueia privilege escalation
if echo "$COMMAND" | grep -iE '(sudo|chmod\s+777|chown\s+root)' > /dev/null; then
    jq -n '{
      permissionDecision: "deny",
      permissionDecisionReason: "Bloqueado: Escalação de privilégios não é permitida."
    }'
    exit 0
fi

exit 0
```

## Script: Auditoria de Prompts

Crie `.github/hooks/scripts/log-prompt.sh`:

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"

TIMESTAMP_MS="$(echo "$INPUT" | jq -r '.timestamp // empty')"
CWD="$(echo "$INPUT" | jq -r '.cwd // empty')"

LOG_DIR=".github/hooks/logs"
mkdir -p "$LOG_DIR"
chmod 700 "$LOG_DIR"

jq -n \
  --arg ts "$TIMESTAMP_MS" \
  --arg cwd "$CWD" \
  '{event:"userPromptSubmitted", timestampMs:$ts, cwd:$cwd}' \
  >> "$LOG_DIR/audit.jsonl"

exit 0
```

**Torne executáveis:**

```bash
chmod +x .github/hooks/scripts/*.sh
```

---

[← Anterior: Custom Agents](./03-frota-custom-agents.md) · [Índice](./README.md) · [Próxima: Orquestração →](./05-orquestracao-pratica.md)