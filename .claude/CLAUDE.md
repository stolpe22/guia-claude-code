# Instruções do Projeto: Knowledge Graph Quartz & SDD

Este repositório contém a base de conhecimento sobre o uso do Claude Code e práticas de SDD (Software Design Description), renderizada via Quartz.

---

## 🚀 Bootstrap do Quartz (Setup Inicial)

Se o projeto **ainda não tiver o Quartz configurado** (sem `quartz.config.ts`, sem `quartz.layout.ts`, sem `package.json` com `@jackyzha0/quartz`), você **DEVE** inicializar o projeto completo antes de qualquer outra tarefa.

### Passo a passo obrigatório:

1. **Clonar o Quartz na raiz do projeto:**

   ```bash
   git clone https://github.com/jackyzha0/quartz.git .quartz-temp
   ```

   Copie os arquivos essenciais do Quartz para a raiz (sem sobrescrever a pasta `content/` existente) e remova `.quartz-temp`.

2. **Instalar dependências:**

   ```bash
   npm i
   ```

3. **Preservar o conteúdo existente:**
   - A pasta `content/` já contém arquivos Markdown do projeto. **NUNCA** sobrescreva, apague ou mova esses arquivos.
   - O Quartz deve ser configurado para usar a pasta `content/` existente como fonte.

4. **Configurar `quartz.config.ts`** com:
   - `pageTitle`: "Knowledge Graph — Claude Code & SDD"
   - `locale`: "pt-BR"
   - `baseUrl`: configurável (deixe comentado para deploy futuro)
   - `theme`: esquema de cores moderno e legível (dark mode como padrão)
   - `enableSPA`: true
   - `analytics`: null (desabilitado por padrão)

5. **Configurar `quartz.layout.ts`** com layout que inclua:
   - **Graph View** (visualização do Knowledge Graph) — visível e destacado
   - **Table of Contents** nas páginas
   - **Backlinks** no rodapé de cada página
   - **Explorer** (sidebar com árvore de arquivos) colapsável
   - **Search** funcional
   - **Darkmode toggle**
   - **Tag listing** e páginas de tag

6. **Customização Visual (OBRIGATÓRIO):**
   - Paleta de cores profissional e moderna (inspiração: Obsidian Publish, Notion)
   - Tipografia limpa: use fontes como Inter, JetBrains Mono para código
   - O **Graph View deve ser o destaque visual** — grande, interativo, com cores por pasta/tag
   - Links hover com preview (popover)
   - Responsivo para mobile
   - Espaçamento generoso, sem poluição visual

7. **Customização do Graph View:**
   - Nós coloridos por pasta (`claude-code` = uma cor, `conceitos` = outra)
   - `copilot-codex` deve aparecer com opacidade reduzida ou ser excluído do grafo
   - Zoom e drag habilitados
   - Profundidade de links: pelo menos 2 níveis
   - Tamanho dos nós proporcional à quantidade de backlinks

8. **CSS customizado** em `quartz/styles/custom.scss`:
   - Estilize callouts/admonitions (tip, warning, note, important)
   - Code blocks com syntax highlighting bonito
   - Wikilinks com estilo diferenciado (cor ou sublinhado sutil)
   - Scrollbar customizada
   - Animações suaves em transições de página (SPA)

9. **Validar o build:**
   ```bash
   npx quartz build --serve
   ```
   O site deve compilar sem erros e ser navegável em `localhost:8080`.

### Critérios de "Pronto":

- [ ] `npx quartz build` roda sem erros
- [ ] Todos os `.md` de `content/` aparecem no site
- [ ] Graph View renderiza com nós interligados
- [ ] Backlinks funcionam
- [ ] Search funciona
- [ ] Dark mode funciona
- [ ] Responsivo no mobile
- [ ] Nenhum arquivo de `content/` foi perdido

---

## 📁 Estrutura do Conteúdo

```
content/
├── claude-code/
│   ├── varios.md
│   ├── arquivos/
│   │   └── skills/
│   │       └── varios.md
│   └── assets/
│       └── outros.md
├── conceitos/
│   └── varios.md
├── copilot-codex/        ← IGNORAR nos wikilinks (fora do grafo)
│   └── ...
└── index.md
```

---

## 🔗 Padrões de Markdown e Grafo de Conhecimento

- Todos os arquivos de conteúdo devem estar estritamente dentro de `content/`.
- Use **Wikilinks** no formato `[[nome-do-arquivo]]` para links internos. **Isso é obrigatório** para que o Quartz gere o Knowledge Graph corretamente.
- Nunca use links Markdown tradicionais `[texto](url.md)` para referências internas.
- Todo arquivo deve ter um frontmatter YAML com `title`, `tags` e `aliases` (se aplicável).
- Mantenha parágrafos curtos e crie nós (arquivos) focados em um único conceito para enriquecer o grafo.
- **NUNCA** crie wikilinks apontando para arquivos dentro de `content/copilot-codex/`. Essa pasta está fora do escopo do grafo.

---

## 📐 Padrões SDD (Software Design Description)

- Documentos SDD devem focar no "Por quê" e no "Como".
- Use cabeçalhos padronizados: `## Contexto`, `## Decisão`, `## Consequências`.

---

## ⚙️ Comandos Comuns

- Build do Quartz: `npx quartz build`
- Servidor de desenvolvimento: `npx quartz build --serve`
- Sincronização: `npx quartz sync`

---

## 💬 Chat RAG — Vibe Codinho

O projeto possui um assistente de chat conversacional integrado ao Quartz chamado **Vibe Codinho**. Ele usa RAG (Retrieval-Augmented Generation) com os arquivos de `content/` como base de conhecimento.

- Regras completas de negócio: veja @.claude/rules/chat-rules.md
- Agente especializado: `chat-rag-builder` (`.claude/agents/chat-rag-builder.md`)
- Skill de implementação: `/implement-chat-widget`

### Componentes do sistema

| Arquivo | Função |
|---|---|
| `scripts/build-chat-index.mjs` | Gera `public/search-chunks.json` no build |
| `quartz/components/ChatWidget.tsx` | Widget flutuante de chat (Preact) |
| `public/search-chunks.json` | Índice de chunks para retrieval |

### Regras rápidas

- Copilot-codex **fora** do índice
- API key sempre no `localStorage`, nunca no código
- Respostas sempre em PT-BR (hardcoded no system prompt)
- Index regenera automaticamente a cada `npx quartz build`

---

## 🔄 Workflows

- Regras de edição de conteúdo: veja @.claude/rules/content-rules.md

---

## ⚠️ Regras Gerais

- **Antes de qualquer tarefa de conteúdo**, verifique se o Quartz está configurado. Se não estiver, execute o Bootstrap acima primeiro.
- **Nunca delete arquivos** de `content/` sem confirmação explícita.
- **Sempre rode o build** depois de mudanças estruturais para validar.
- **O Graph View é a feature principal** deste projeto. Todas as decisões de layout e conteúdo devem priorizar a riqueza e navegabilidade do grafo.
