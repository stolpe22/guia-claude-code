---
name: Problemas Recorrentes no Grafo de Conhecimento
description: Padrões de erro encontrados: links Markdown relativos, frontmatter ausente, links para arquivos não-.md
type: project
---

Problemas identificados na análise de 2026-04-02:

1. **Links Markdown relativos em vez de wikilinks** — arquivos como `01-isolamento-devcontainer.md` e `00-mindset-sdd.md` usam `[texto](./arquivo.md)` para navegação entre páginas. O Quartz com `markdownLinkResolution: "shortest"` pode não resolver esses caminhos corretamente, causando 404.

2. **Arquivos sem frontmatter YAML** — vários arquivos não têm bloco `---` de frontmatter. Isso viola `content-rules.md` e impede que o Quartz indexe título e tags corretamente. Arquivos afetados: 00-mindset-sdd.md, 01-isolamento-devcontainer.md, 00-mindset-sdd.md, 03-frota-subagentes.md, 04-hooks-seguranca.md, 05-orquestracao-pratica.md, arquivos/architect.md, arquivos/code-reviewer.md, arquivos/db-reader.md, arquivos/test-writer.md, assets/estrutura-pastas.md.

3. **Links para arquivos não-.md** — o arquivo `01-isolamento-devcontainer.md` referencia `./arquivos/Dockerfile`, `./arquivos/devcontainer.json` e `./arquivos/init-firewall.sh`. Esses arquivos existem no filesystem mas não são processados pelo Quartz (não são .md), então os links geram 404 no site.

**Why:** O Quartz só serve arquivos .md como páginas navegáveis. Links para outros tipos de arquivo não têm rota válida.

**How to apply:** Para arquivos de configuração referenciados (Dockerfile, .json, .sh), sugerir criar páginas .md wrapper que exibam o conteúdo, ou remover os links diretos substituindo por menção ao caminho sem link clicável.
