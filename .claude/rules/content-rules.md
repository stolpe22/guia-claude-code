---
paths:
  - "content/claude-code/**/*.md"
  - "content/conceitos/**/*.md"
  - "content/index.md"
---

# Regras de Criação e Edição de Conteúdo (Quartz)

- **Frontmatter Obrigatório:** Todo arquivo modificado ou criado deve conter o cabeçalho YAML. Exemplo:

  ```yaml
  ---
  title: Título do Documento
  tags: [claude-code, sdd, tutorial]
  ---
  ```

- **Densidade de Links:** Sempre tente conectar o conceito atual a outros documentos existentes nas pastas `content/claude-code/` e `content/conceitos/` usando `[[ ]]`.

- **Pasta Excluída:** **NUNCA** crie links para ou a partir de arquivos em `content/copilot-codex/`. Essa pasta é isolada do grafo.

- **Nomenclatura de Arquivos:** Use `kebab-case` para nomes de arquivos (ex: `como-usar-sdd.md`).

- **Resolução de Links:** Ao referenciar um arquivo, use o nome exato do arquivo sem a extensão `.md` dentro do wikilink. Ex: `[[padroes-arquiteturais]]`.
