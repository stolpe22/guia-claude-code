---
description: Gera relatório diário de atividade do repositório.
---

Gere o relatório de atividade do dia:

1. `git log --since="24 hours ago" --oneline --all` — commits do dia
2. `gh pr list --state open` — PRs aguardando review
3. `gh issue list --assignee @me --state open` — issues abertas para você
4. `gh run list --limit 5` — últimas execuções de CI/CD

Formate em Markdown pronto para colar no Slack:
- ✅ O que foi concluído
- 🔄 Em progresso
- 🚧 Bloqueios
- 📋 Próximos passos
