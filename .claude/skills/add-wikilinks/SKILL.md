---
name: add-wikilinks
description: Varre os arquivos Markdown do projeto e adiciona wikilinks onde conceitos de outros documentos são mencionados, enriquecendo o Knowledge Graph.
disable-model-invocation: true
allowed-tools: Read, Edit, Grep, Glob
---

Enriqueça o Knowledge Graph com wikilinks automáticos.

1. **Liste todos os arquivos** `.md` em `content/claude-code/` e `content/conceitos/`.
2. **Extraia os títulos** (do frontmatter `title:`) e nomes de arquivo de cada documento.
3. **Para cada arquivo**, procure no corpo do texto menções a títulos ou conceitos de outros arquivos.
4. **Onde encontrar uma menção** que ainda não é um wikilink, converta para `[[nome-do-arquivo]]`.
5. **Regras:**
   - Não force links onde não faz sentido semântico.
   - Não linke um arquivo para ele mesmo.
   - Máximo de 1 wikilink por conceito por arquivo (não repita o mesmo link várias vezes).
   - **IGNORE** `content/copilot-codex/` completamente.
6. **Ao final**, liste quantos links foram adicionados e em quais arquivos.
