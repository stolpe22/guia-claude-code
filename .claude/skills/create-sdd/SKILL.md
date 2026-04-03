---
name: create-sdd
description: Gera um novo documento estruturado de Software Design Description (SDD) no formato exigido pelo Quartz.
disable-model-invocation: true
allowed-tools: Read, Edit, Bash
---

Crie um novo documento SDD com o título e escopo baseados em: $ARGUMENTS.

1. Crie o arquivo em `content/claude-code/` usando `kebab-case.md`.
2. Insira o frontmatter YAML com `title`, a tag `sdd`, e a data atual.
3. Estruture o documento com as seções: `## Contexto`, `## Decisão`, `## Consequências`.
4. Procure no projeto (em `content/claude-code/` e `content/conceitos/`) por pelo menos 2 outros documentos relevantes e adicione wikilinks (`[[ ]]`) na seção `## Arquivos Relacionados`.
5. **NUNCA** referencie arquivos de `content/copilot-codex/`.
