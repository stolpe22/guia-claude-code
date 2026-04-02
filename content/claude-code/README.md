# 🛡️ Guia Completo: Ambiente Claude Code Seguro

> Ambiente isolado, com firewall, subagentes especializados, guard rails e metodologias SDD/TDD.

## 🔗 Repositórios Oficiais da Anthropic

| Repo                                                                                                      | O que contém                                               |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [anthropics/claude-code/.devcontainer](https://github.com/anthropics/claude-code/tree/main/.devcontainer) | Dockerfile + firewall + devcontainer.json (setup completo) |
| [anthropics/devcontainer-features](https://github.com/anthropics/devcontainer-features)                   | Dev Container Feature simplificada (sem firewall)          |

---

## 📚 Fases do Guia

| #   | Fase                                                                    | Descrição                                                    |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| 0   | [Mindset & Spec Driven Dev](./00-mindset-sdd.md)                        | O Engenheiro como Comandante, SDD e Design Upfront           |
| 1   | [Isolamento com Dev Container](./01-isolamento-devcontainer.md)         | Docker + firewall + sandbox — nunca rode IA no host          |
| 2   | [Cérebro e Knowledge Bases](./02-cerebro-knowledge-bases.md)            | CLAUDE.md hierárquico, @imports, memória por escopo, MCP     |
| 3   | [Frota de Subagentes](./03-frota-subagentes.md)                         | Agentes especializados com ferramentas restritas             |
| 4   | [Hooks de Segurança](./04-hooks-seguranca.md)                           | Scripts que interceptam e bloqueiam comandos perigosos       |
| 5   | [Orquestração Prática](./05-orquestracao-pratica.md)                    | Como comandar a frota, slash commands e --resume             |
| 6   | [settings.json — Configuração Global](./06-settings-permissoes.md)      | Permissões granulares, deny/allow, variáveis de ambiente     |
| 7   | [Hooks Avançados](./07-hooks-avancados.md)                              | PostToolUse, UserPromptSubmit, Notification, Stop            |
| 8   | [MCP — Ferramentas Externas](./08-mcp-ferramentas.md)                   | GitHub, PostgreSQL, Slack, Brave Search, KB Vetorial         |
| 9   | [Skills e Slash Commands](./09-skills-slash-commands.md)                | Comandos /customizados reutilizáveis por toda a equipe       |
| 10  | [CI/CD Não-Interativo](./10-ci-cd-nao-interativo.md)                    | --print, GitHub Actions, review automático, release notes    |

---

## 📁 Arquivos Prontos para Copiar

Todos os arquivos de configuração estão na pasta [`arquivos/`](./arquivos/). Copie para as pastas corretas:

```
arquivos/SPEC.md                        → docs/SPEC.md
arquivos/Dockerfile                     → .devcontainer/Dockerfile
arquivos/devcontainer.json              → .devcontainer/devcontainer.json
arquivos/init-firewall.sh               → .devcontainer/init-firewall.sh
arquivos/CLAUDE.md                      → ./CLAUDE.md
arquivos/settings-projeto.json          → .claude/settings.json
arquivos/settings-global.json           → ~/.claude/settings.json
arquivos/code-reviewer.md               → .claude/agents/code-reviewer.md
arquivos/architect.md                   → .claude/agents/architect.md
arquivos/test-writer.md                 → .claude/agents/test-writer.md
arquivos/db-reader.md                   → .claude/agents/db-reader.md
arquivos/validate-readonly-query.sh     → scripts/validate-readonly-query.sh
arquivos/skills/review-pr.md            → .claude/skills/review-pr.md
arquivos/skills/deploy-check.md         → .claude/skills/deploy-check.md
arquivos/skills/daily-report.md         → .claude/skills/daily-report.md
arquivos/skills/security-scan.md        → .claude/skills/security-scan.md
arquivos/skills/test-coverage.md        → .claude/skills/test-coverage.md
arquivos/skills/adr.md                  → .claude/skills/adr.md
```

---

## ✅ Checklist Final

- [ ] Docker Desktop rodando
- [ ] Extensão "Dev Containers" instalada no VS Code
- [ ] 3 arquivos na `.devcontainer/`
- [ ] VS Code reaberto no container ("Reopen in Container")
- [ ] Firewall verificado nos logs ("Firewall verification passed")
- [ ] `CLAUDE.md` criado com regras do projeto
- [ ] `~/.claude/CLAUDE.md` com regras pessoais globais
- [ ] `.claude/settings.json` com permissões e hooks do projeto
- [ ] Agentes em `.claude/agents/` com `disallowedTools` configurados
- [ ] Skills em `.claude/skills/` para fluxos repetitivos
- [ ] Hooks em `scripts/` com `chmod +x`
- [ ] Servidores MCP configurados no `settings.json`
- [ ] **Nunca** rodar `claude` fora do container
