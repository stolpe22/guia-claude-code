# SDD Guide — Spec-Driven Development com IA

Handbook corporativo para desenvolvimento com IA usando **Claude Code** e **GitHub Copilot/Codex**, com foco em isolamento, segurança, subagentes especializados e guard rails.

Renderizado via **[Quartz](https://quartz.jzhao.xyz/)** como Knowledge Graph interativo.

---

## Pré-requisitos

- Node.js >= 20
- npm >= 10

---

## Instalação

```bash
npm install
```

---

## Rodando localmente

```bash
npx quartz build --serve
```

Acesse em: **http://localhost:8080**

O servidor detecta mudanças nos arquivos de `content/` automaticamente e faz rebuild.

---

## Só gerar o build (sem servidor)

```bash
npx quartz build
```

Os arquivos estáticos são gerados em `public/`.

---

## Estrutura do conteúdo

```
content/
├── index.md               ← Página inicial
├── conceitos/
│   └── fundamentos.md     ← Teoria: os 3 níveis de dev com IA
├── claude-code/           ← Guia completo para Anthropic Claude Code
│   ├── README.md          ← Índice do guia
│   ├── 00 🧠 Mindset & SDD
│   ├── 01 🐳 Isolamento (Dev Container)
│   ├── 02 🧠 Cérebro e Knowledge Bases
│   ├── 03 🤖 Frota de Subagentes
│   ├── 04 🔒 Hooks de Segurança
│   ├── 05 🎯 Orquestração Prática
│   ├── 06 ⚙️ Settings e Permissões
│   ├── 07 🪝 Hooks Avançados
│   ├── 08 🔌 MCP e Ferramentas Externas
│   ├── 09 ⚡ Skills e Slash Commands
│   ├── 10 🔄 CI/CD Não-Interativo
│   └── arquivos/          ← Templates prontos para copiar
└── copilot-codex/         ← Guia para GitHub Copilot / OpenAI Codex
```

---

## Contribuindo

1. Edite ou crie arquivos `.md` dentro de `content/`
2. Use **wikilinks** `[[nome-do-arquivo|texto]]` para links internos — nunca `[texto](./arquivo.md)`
3. Todo arquivo deve ter frontmatter YAML com `title` e `tags`
4. Rode `npx quartz build` para validar antes de commitar

---
