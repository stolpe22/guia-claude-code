---
title: "04 🔒 Hooks de Segurança"
tags: [claude-code, hooks, seguranca, bash, guard-rails, pre-tool-use, banco-de-dados]
---

# FASE 4: Scripts de Segurança Ativa (Hooks)

[[03-frota-subagentes|← Anterior: Subagentes]] · [[README|Índice]] · [[05-orquestracao-pratica|Próxima: Orquestração →]]

---

> Para agentes com acesso ao terminal (`Bash`) que precisam ser limitados. Ex: agente de banco de dados que só pode `SELECT`, nunca `DROP`.

## Como Hooks Funcionam

```
Agente tenta rodar comando Bash
         │
         ▼
   Hook PreToolUse intercepta
         │
         ▼
   Script analisa o comando
         │
    ┌────┴────┐
    │         │
 exit 0    exit 2
 (libera)  (bloqueia)
    │         │
    ▼         ▼
 Executa   "Bloqueado:
 comando    Apenas SELECT
             permitido."
```

## O Script de Validação

> Copie de `arquivos/validate-readonly-query.sh` no repositório

Crie em `scripts/validate-readonly-query.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if [ -z "$COMMAND" ]; then exit 0; fi

if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then 
    echo "Bloqueado: Apenas queries SELECT são permitidas." >&2 
    exit 2 
fi
exit 0
```

**Torne executável:**

```bash
chmod +x ./scripts/validate-readonly-query.sh
```

## Conectando o Hook ao Agente

No YAML do agente (ex: `db-reader.md`):

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
```

## Códigos de Saída

| Exit Code | Significado |
|---|---|
| `0` | Comando **liberado** — pode executar |
| `2` | Comando **bloqueado** — não executa, mostra mensagem de erro |

## Exemplos de Hooks Customizados

### Bloquear `rm -rf`

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if [ -z "$COMMAND" ]; then exit 0; fi

if echo "$COMMAND" | grep -iE 'rm\s+(-[a-zA-Z]*f|-[a-zA-Z]*r|--force|--recursive)' > /dev/null; then
    echo "Bloqueado: Comandos destrutivos de remoção não são permitidos." >&2
    exit 2
fi
exit 0
```

### Bloquear acesso a diretórios sensíveis

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if [ -z "$COMMAND" ]; then exit 0; fi

if echo "$COMMAND" | grep -iE '(\/etc\/|\/root\/|~\/\.ssh|~\/\.aws|~\/\.env)' > /dev/null; then
    echo "Bloqueado: Acesso a diretórios sensíveis não é permitido." >&2
    exit 2
fi
exit 0
```

---

## Onde Configurar Hooks

Os hooks da Fase 4 mostram configuração inline no YAML do agente. Mas a forma mais robusta é via `settings.json`:

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "scripts/validate-readonly-query.sh"}]
      }
    ]
  }
}
```

Isso aplica o hook a **todos os agentes** do projeto, não só ao `db-reader`.

> Veja a [[06-settings-permissoes|Fase 6]] para configuração completa do `settings.json` e a [[07-hooks-avancados|Fase 7]] para os outros 4 tipos de hook além do `PreToolUse`.

---

[[03-frota-subagentes|← Anterior: Subagentes]] · [[README|Índice]] · [[05-orquestracao-pratica|Próxima: Orquestração →]]