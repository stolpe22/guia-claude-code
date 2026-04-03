---
title: "SDD Guide — Spec-Driven Development com IA"
tags: [sdd, ia, claude-code, copilot, indice, fundamentos, engenharia]
aliases: [sdd-guide, indice-principal]
---

# 🧠 SDD Guide — Spec-Driven Development com IA

> Guias práticos para desenvolvimento seguro e orquestrado com agentes de IA.
> Aplicando os conceitos de **Spec-Driven Development**, **Agentic Fleets** e **Guard Rails** no mundo real.

---

## 🎯 O que é este repositório?

Um handbook corporativo para equipes que querem adotar **desenvolvimento com IA** de forma profissional — não como "Vibe Coding", mas como engenharia de verdade.

Contém dois guias práticos (um para cada ecossistema) e a base teórica por trás de ambos.

---

## 📚 Conteúdo

| Pasta                       | Ferramenta                    | Descrição                                                     |
| --------------------------- | ----------------------------- | ------------------------------------------------------------- |
| [[fundamentos\|conceitos/]] | —                             | Teoria: os 3 níveis de dev com IA, mindset shift, guard rails |
| [[README\|claude-code/]]    | Anthropic Claude Code         | Guia completo: Dev Container + firewall + subagentes + hooks  |
| `copilot-codex/`            | GitHub Copilot / OpenAI Codex | Guia completo: Custom Agents + Skills + Hooks + cloud agents  |

---

## 🗺️ Por onde começar?

```
1. Leia os fundamentos teóricos
   └── conceitos/fundamentos.md

2. Escolha seu ecossistema (ou use ambos):
   ├── claude-code/    → Se usa Anthropic Claude Code
   └── copilot-codex/  → Se usa GitHub Copilot CLI / Codex / VS Code

3. Siga as 5 fases em ordem:
   ├── Fase 1: Isolamento (Dev Container)
   ├── Fase 2: Cérebro (Instruções + KBs)
   ├── Fase 3: Frota de Agentes
   ├── Fase 4: Hooks de Segurança
   └── Fase 5: Orquestração Prática
```

---

## 🔀 Comparativo Rápido

| Conceito                | Claude Code                                                    | Copilot / Codex                                 |
| ----------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| Instruções do projeto   | `CLAUDE.md` (4 camadas + @imports)                             | `.github/copilot-instructions.md` + `AGENTS.md` |
| Subagentes              | `.claude/agents/*.md`                                          | `.github/agents/*.agent.md`                     |
| Skills / Slash commands | `.claude/skills/*.md` → `/comando`                             | `.github/skills/*/SKILL.md`                     |
| Configuração central    | `.claude/settings.json`                                        | `.github/hooks/hooks.json`                      |
| Hooks                   | 5 tipos: Pre/PostToolUse, UserPromptSubmit, Notification, Stop | PreToolUse e PostToolUse                        |
| Permissões              | `permissions.allow/deny` no settings.json                      | Apenas `tools` (lista positiva)                 |
| Bloqueio em hooks       | `exit 2`                                                       | JSON `{"permissionDecision":"deny"}`            |
| Memória persistente     | `memory: project` ou `memory: user` (nativo)                   | Não tem nativo (usar MCP)                       |
| Cloud agent             | Não (só local)                                                 | Sim (aba Agents no GitHub.com)                  |
| CI/CD não-interativo    | `claude -p "prompt"` + `--output-format json`                  | Codex CLI com `--non-interactive`               |
| Sessões persistentes    | `--resume <session-id>`                                        | Não tem                                         |
| Firewall nativo         | Sim (`init-firewall.sh`)                                       | Sandbox automático no GitHub.com                |
| Modelos                 | Sonnet, Opus, Haiku                                            | GPT-4o, o3, Claude, Gemini etc.                 |
| MCP                     | `settings.json` (global ou por projeto)                        | YAML no agente ou config do repo                |

---

## 🧱 Princípios Fundamentais

Independente da ferramenta, os princípios são os mesmos:

1. **🔒 Isolamento** — Nunca rode IA no host. Use containers.
2. **📄 Spec First** — Especifique antes de codar. A IA lê regras, não adivinha.
3. **🤖 Especialização** — Agentes hiperespecializados > um agente generalista.
4. **🛡️ Guard Rails** — Hooks, ferramentas restritas e revisão humana.
5. **👤 Humano = Gatekeeper** — Você não digita código, você valida excelência.

---

## 📖 Créditos e Referências

Conceitos baseados em:

- **Luan Moreno** — Engenharia de IA, Agentic Fleets, SDD, KBs + MCP
- **Jornada de Dados** — Isolamento, TDD como guard rail, IaC, segurança corporativa
- [Anthropic Claude Code](https://github.com/anthropics/claude-code) — Repositório oficial
- [GitHub Copilot Docs](https://docs.github.com/en/copilot) — Documentação oficial
- [awesome-copilot](https://github.com/github/awesome-copilot) — Exemplos da comunidade

---

## 🤝 Contribuindo

1. Fork este repo
2. Crie uma branch (`feat/minha-melhoria`)
3. Conventional Commits (`feat:`, `fix:`, `docs:`)
4. Abra um PR com descrição clara

---

## 📜 Licença

MIT — use, adapte e compartilhe livremente.
