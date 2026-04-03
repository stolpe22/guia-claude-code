# 🛡️ Guia Completo: Ambiente GitHub Copilot / OpenAI Codex Seguro

> Ambiente isolado, com subagentes especializados, skills, hooks e guard rails — usando GitHub Copilot CLI e OpenAI Codex.

## 🔗 Documentação Oficial

| Recurso | O que contém |
|---|---|
| [GitHub Copilot CLI Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli) | Setup, uso e customização do CLI |
| [Custom Agents Config](https://docs.github.com/en/copilot/reference/custom-agents-configuration) | Referência completa de agentes |
| [Hooks Config](https://docs.github.com/en/copilot/reference/hooks-configuration) | Referência de hooks |
| [Skills Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills) | Como criar skills |
| [OpenAI Codex](https://docs.github.com/en/copilot/concepts/agents/openai-codex) | Integração Codex via Copilot |
| [awesome-copilot](https://github.com/github/awesome-copilot/tree/main/agents) | Exemplos da comunidade |

---

## 📚 Fases do Guia

| # | Fase | Descrição |
|---|---|---|
| 1 | [Isolamento com Dev Container](./01-isolamento-devcontainer.md) | Docker + sandbox — nunca rode IA no host |
| 2 | [Cérebro e Instruções](./02-cerebro-instrucoes.md) | copilot-instructions.md, AGENTS.md, skills |
| 3 | [Frota de Custom Agents](./03-frota-custom-agents.md) | Agentes especializados com ferramentas restritas |
| 4 | [Hooks de Segurança](./04-hooks-seguranca.md) | Scripts que interceptam e bloqueiam comandos perigosos |
| 5 | [Orquestração Prática](./05-orquestracao-pratica.md) | Como comandar a frota no dia a dia |

---

## 📁 Arquivos Prontos para Copiar

```
arquivos/Dockerfile                      → .devcontainer/Dockerfile
arquivos/devcontainer.json               → .devcontainer/devcontainer.json
arquivos/copilot-instructions.md         → .github/copilot-instructions.md
arquivos/code-reviewer.agent.md          → .github/agents/code-reviewer.agent.md
arquivos/architect.agent.md              → .github/agents/architect.agent.md
arquivos/test-writer.agent.md            → .github/agents/test-writer.agent.md
arquivos/db-reader.agent.md              → .github/agents/db-reader.agent.md
arquivos/hooks.json                      → .github/hooks/hooks.json
arquivos/validate-readonly-query.sh      → .github/hooks/scripts/validate-readonly-query.sh
arquivos/pre-tool-policy.sh              → .github/hooks/scripts/pre-tool-policy.sh
```

---

## ✅ Checklist Final

- [ ] Docker Desktop rodando
- [ ] Extensão "Dev Containers" instalada no VS Code
- [ ] `.devcontainer/` configurada
- [ ] VS Code reaberto no container ("Reopen in Container")
- [ ] GitHub Copilot CLI instalado (`npm install -g @anthropic-ai/claude-code` → `npm install -g @githubnext/copilot-cli` ou via extensão)
- [ ] `.github/copilot-instructions.md` criado com regras do projeto
- [ ] Agentes em `.github/agents/` com `tools` restritos
- [ ] Hooks em `.github/hooks/` configurados
- [ ] Skills em `.github/skills/` para tarefas especializadas
- [ ] **Nunca** rodar agentes fora do container em projetos sensíveis