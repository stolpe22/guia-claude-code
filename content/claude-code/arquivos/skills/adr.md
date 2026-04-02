---
description: Cria um ADR (Architecture Decision Record). Use: /adr <título da decisão>
---

Crie um ADR para a decisão: $ARGUMENTS

Siga o template:

# ADR-NNN: $ARGUMENTS

**Status:** Proposed
**Data:** (data de hoje)
**Autores:** (branch/usuário atual via `git config user.name`)

## Contexto
Descreva o problema ou situação que motivou esta decisão.

## Decisão
Descreva a decisão tomada de forma clara e direta.

## Consequências
### Positivas
- ...

### Negativas / Trade-offs
- ...

## Alternativas Consideradas
| Alternativa | Por que foi descartada |
|---|---|
| ... | ... |

Salve em `docs/adr/ADR-NNN-titulo-kebab-case.md`.
Incremente o número baseado nos ADRs existentes em `docs/adr/` (use `ls docs/adr/` para verificar).
Crie a pasta `docs/adr/` se não existir.
