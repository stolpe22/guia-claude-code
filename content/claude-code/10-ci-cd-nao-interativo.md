# FASE 10: Claude Code em CI/CD (Modo Não-Interativo)

[← Anterior: Skills](./09-skills-slash-commands.md) · [Índice](./README.md)

---

> Claude Code não é só para uso interativo. Com a flag `--print` ele vira uma ferramenta de automação — integrando com pipelines de CI/CD, scripts e GitHub Actions.

## O Modo `--print` / `-p`

```bash
# Interativo (padrão)
claude

# Não-interativo: processa e sai
claude --print "seu prompt aqui"
claude -p "seu prompt aqui"
```

Em modo `--print`:
- Não pede confirmações
- Não abre interface interativa
- Retorna o resultado no stdout e encerra
- Integra naturalmente com pipes Unix

---

## Casos de Uso Práticos

### Revisão automática de diff no push

```bash
#!/bin/bash
# scripts/ci-review.sh

DIFF=$(git diff origin/main...HEAD)

if [ -z "$DIFF" ]; then
  echo "Sem mudanças para revisar."
  exit 0
fi

echo "$DIFF" | claude -p "
Analise este diff de código quanto a:
1. Vulnerabilidades de segurança (OWASP Top 10)
2. Senhas ou tokens hardcoded
3. Erros lógicos óbvios
4. Falta de tratamento de erros

Responda ONLY com JSON no formato:
{
  \"status\": \"pass\" | \"fail\" | \"warn\",
  \"issues\": [{\"severity\": \"critical|high|medium|low\", \"description\": \"...\", \"line\": \"...\"}],
  \"summary\": \"resumo em 1 linha\"
}
" > review-result.json

STATUS=$(jq -r '.status' review-result.json)
echo "Review status: $STATUS"
jq '.issues[]' review-result.json

if [ "$STATUS" = "fail" ]; then
  exit 1
fi
```

### Geração de changelog automático

```bash
#!/bin/bash
# scripts/generate-changelog.sh

LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  COMMITS=$(git log "${LAST_TAG}..HEAD" --oneline)
else
  COMMITS=$(git log --oneline -20)
fi

echo "$COMMITS" | claude -p "
Baseado nestes commits, gere um CHANGELOG.md no formato Keep a Changelog:
- Agrupe em: Added, Changed, Fixed, Security, Deprecated
- Use linguagem de negócio, não técnica
- Versão: $1 (argumento passado)
- Data: $(date '+%Y-%m-%d')
"
```

**Uso:**
```bash
bash scripts/generate-changelog.sh 2.1.0 >> CHANGELOG.md
```

### Análise de cobertura de testes

```bash
#!/bin/bash
# Roda testes, captura saída e pede análise

COVERAGE=$(pytest --cov=. --cov-report=term-missing -q 2>&1)

echo "$COVERAGE" | claude -p "
Analise este relatório de cobertura de testes pytest.
Identifique os 3 módulos mais críticos sem cobertura adequada (<80%).
Para cada um, explique o risco e sugira 2-3 casos de teste prioritários.
Seja conciso — máximo 10 linhas por módulo.
"
```

---

## Flag `--output-format`

Controla o formato de saída para parsing programático:

```bash
# Texto simples (padrão)
claude -p "analise o projeto" --output-format text

# JSON estruturado (com metadados de tokens e custo)
claude -p "analise o projeto" --output-format json

# Stream JSON (linha por linha — bom para logs em tempo real)
claude -p "analise o projeto" --output-format stream-json
```

### Exemplo de saída JSON

```json
{
  "type": "result",
  "subtype": "success",
  "result": "Análise concluída...",
  "session_id": "abc123",
  "cost_usd": 0.0042,
  "duration_ms": 3200,
  "input_tokens": 1240,
  "output_tokens": 380
}
```

---

## Gerenciamento de Sessões

### Retomar sessão anterior

```bash
# Retomar a sessão mais recente
claude --resume

# Listar sessões disponíveis
claude --list-sessions

# Retomar sessão específica por ID
claude --resume abc123def456
```

> Útil quando uma sessão longa foi interrompida — o Claude retoma o contexto completo.

### Continuar sessão em modo não-interativo

```bash
# Criar sessão e salvar ID
SESSION=$(claude -p "implemente a feature X" --output-format json | jq -r '.session_id')

# Continuar na mesma sessão depois
claude -p "agora escreva os testes" --resume "$SESSION"
```

---

## GitHub Actions

### Review automático de PR

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          DIFF=$(git diff origin/${{ github.base_ref }}...HEAD)

          REVIEW=$(echo "$DIFF" | claude -p "
          Revise este diff de Pull Request.
          Foque em: segurança, lógica, cobertura de testes.
          Formato: Markdown com emojis 🔴🟡🟢 por severidade.
          Seja específico com linha e arquivo.
          Máximo 20 linhas.
          " --output-format text)

          gh pr comment ${{ github.event.pull_request.number }} \
            --body "## 🤖 Claude Code Review

          $REVIEW

          ---
          *Gerado automaticamente por Claude Code*"
```

### Geração de release notes

```yaml
# .github/workflows/release-notes.yml
name: Generate Release Notes

on:
  push:
    tags: ['v*']

jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Generate Notes
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "")
          if [ -n "$PREV_TAG" ]; then
            COMMITS=$(git log "${PREV_TAG}..HEAD" --oneline)
          else
            COMMITS=$(git log --oneline -30)
          fi

          NOTES=$(echo "$COMMITS" | claude -p "
          Gere release notes profissionais para a versão ${{ github.ref_name }}.
          Agrupe em: ✨ Novidades, 🐛 Correções, 🔒 Segurança, ⚡ Performance.
          Use linguagem para o usuário final, não para desenvolvedores.
          " --output-format text)

          gh release edit ${{ github.ref_name }} --notes "$NOTES"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Boas Práticas em CI/CD

| Prática | Por quê |
|---|---|
| Use `--output-format json` para parsing | Evita quebrar com mudanças no texto de saída |
| Defina timeout nos steps | Sessões longas podem travar o pipeline |
| Use `ANTHROPIC_API_KEY` como secret | Nunca hardcode no workflow |
| Combine com `permissions.deny` no settings | O Claude no CI não precisa de Bash livre |
| Prefira saídas curtas e objetivas no prompt | Reduz custo e latência no CI |
| Use `--dangerously-skip-permissions` só em ambientes isolados | Pule confirmações apenas em containers descartáveis |

### settings.json para CI

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Grep(**)",
      "Glob(**)",
      "Bash(git *)",
      "Bash(gh *)"
    ],
    "deny": [
      "Bash(rm *)",
      "Bash(sudo *)",
      "Write(**)",
      "Edit(**)"
    ]
  }
}
```

---

## Resumo dos Flags Principais

| Flag | Uso |
|---|---|
| `-p` / `--print` | Modo não-interativo — processa e sai |
| `--output-format text\|json\|stream-json` | Formato de saída |
| `--resume` | Retoma sessão anterior |
| `--resume <id>` | Retoma sessão específica |
| `--list-sessions` | Lista sessões disponíveis |
| `--dangerously-skip-permissions` | Pula confirmações (só em ambientes isolados) |
| `--model <modelo>` | Especifica o modelo (sonnet, opus, haiku) |
| `--agent <nome>` | Inicia com subagente específico |

---

[← Anterior: Skills](./09-skills-slash-commands.md) · [Índice](./README.md)
