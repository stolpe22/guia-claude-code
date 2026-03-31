# FASE 4: Scripts de Segurança Ativa (Hooks)

[← Anterior: Subagentes](./03-frota-subagentes.md) · [Índice](./README.md) · [Próxima: Orquestração →](./05-orquestracao-pratica.md)

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

> [📋 Copiar arquivo](./arquivos/validate-readonly-query.sh)

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

[← Anterior: Subagentes](./03-frota-subagentes.md) · [Índice](./README.md) · [Próxima: Orquestração →](./05-orquestracao-pratica.md)