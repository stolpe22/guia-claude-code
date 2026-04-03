---
name: Estrutura do Projeto e Configuração do Grafo
description: Pastas de conteúdo no escopo do grafo, configuração do Quartz (CrawlLinks, ignorePatterns) e padrão de links obrigatório
type: project
---

O projeto usa Quartz 4 para renderizar um Knowledge Graph a partir de `content/`.

Pastas no escopo do grafo:
- `content/claude-code/` — guia principal (fases 0–10, arquivos de configuração, assets)
- `content/conceitos/` — fundamentos e conceitos transversais

Pasta excluída do grafo (ignorePatterns no quartz.config.ts): `copilot-codex`. Nunca criar wikilinks apontando para ela.

Configuração crítica do Quartz:
- `markdownLinkResolution: "shortest"` em `Plugin.CrawlLinks` — resolve links pelo nome mais curto do arquivo, sem considerar caminho relativo completo
- `Plugin.ObsidianFlavoredMarkdown` habilitado — suporta wikilinks `[[ ]]`

Padrão de links obrigatório (per CLAUDE.md e content-rules.md):
- Usar wikilinks `[[nome-do-arquivo]]` para links internos (sem extensão .md)
- NUNCA usar links Markdown relativos `[texto](./arquivo.md)` para navegação interna
- Todo arquivo deve ter frontmatter YAML com `title` e `tags`

Tags mais usadas: claude-code, sdd, seguranca, devcontainer, agentes, hooks, mcp, skills, memoria, contexto

**Why:** O Quartz com `markdownLinkResolution: "shortest"` resolve wikilinks corretamente mas pode ter comportamento inconsistente com caminhos relativos `./` em links Markdown tradicionais — especialmente para arquivos sem extensão .md (Dockerfile, .sh, .json) que não são roteados pelo Quartz.

**How to apply:** Sempre sugerir conversão de `[texto](./arquivo.md)` para `[[nome-do-arquivo|texto]]` nos documentos de `content/claude-code/` e `content/conceitos/`.
