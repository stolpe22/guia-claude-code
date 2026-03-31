# 🛡️ Guia Completo: Ambiente Claude Code Seguro

> Ambiente isolado, com firewall, subagentes especializados e guard rails.

## 🔗 Repositórios Oficiais da Anthropic

| Repo | O que contém |
|---|---|
| [anthropics/claude-code/.devcontainer](https://github.com/anthropics/claude-code/tree/main/.devcontainer) | Dockerfile + firewall + devcontainer.json (setup completo) |
| [anthropics/devcontainer-features](https://github.com/anthropics/devcontainer-features) | Dev Container Feature simplificada (sem firewall) |

---

## 📚 Fases do Guia

| # | Fase | Descrição |
|---|---|---|
| 1 | [Isolamento com Dev Container](./01-isolamento-devcontainer.md) | Docker + firewall + sandbox — nunca rode IA no host |
| 2 | [Cérebro e Knowledge Bases](./02-cerebro-knowledge-bases.md) | CLAUDE.md, memória de agentes, MCP com banco vetorial |
| 3 | [Frota de Subagentes](./03-frota-subagentes.md) | Agentes especializados com ferramentas restritas |
| 4 | [Hooks de Segurança](./04-hooks-seguranca.md) | Scripts que interceptam e bloqueiam comandos perigosos |
| 5 | [Orquestração Prática](./05-orquestracao-pratica.md) | Como comandar a frota no dia a dia |

---

## 📁 Arquivos Prontos para Copiar

Todos os arquivos de configuração estão na pasta [`arquivos/`](./arquivos/). Copie para as pastas corretas do seu projeto:

```
arquivos/Dockerfile                → .devcontainer/Dockerfile
arquivos/devcontainer.json         → .devcontainer/devcontainer.json
arquivos/init-firewall.sh          → .devcontainer/init-firewall.sh
arquivos/CLAUDE.md                 → ./CLAUDE.md  (raiz do projeto)
arquivos/code-reviewer.md          → .claude/agents/code-reviewer.md
arquivos/architect.md              → .claude/agents/architect.md
arquivos/test-writer.md            → .claude/agents/test-writer.md
arquivos/db-reader.md              → .claude/agents/db-reader.md
arquivos/validate-readonly-query.sh → scripts/validate-readonly-query.sh
```

---

## ✅ Checklist Final

- [ ] Docker Desktop rodando
- [ ] Extensão "Dev Containers" instalada no VS Code
- [ ] 3 arquivos na `.devcontainer/`
- [ ] VS Code reaberto no container ("Reopen in Container")
- [ ] Firewall verificado nos logs ("Firewall verification passed")
- [ ] `CLAUDE.md` criado com regras do projeto
- [ ] Agentes em `.claude/agents/` com `disallowedTools` configurados
- [ ] Hooks em `scripts/` com `chmod +x`
- [ ] **Nunca** rodar `claude` fora do container