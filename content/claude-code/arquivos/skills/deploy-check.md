---
description: Checklist completo antes de um deploy em produção.
---

Execute o checklist de pre-deploy:

1. **Testes:** `pytest --tb=short -q` — reporte falhas
2. **Lint:** `ruff check . && mypy .` — reporte erros de tipo
3. **Migrations pendentes:** `alembic history` — verifique se há migrations não aplicadas
4. **Variáveis de ambiente:** verifique se `.env.production` tem todas as variáveis do `.env.example`
5. **Changelog:** leia `git log origin/main..HEAD --oneline` — liste o que será deployado
6. **Dependências:** `pip list --outdated` — alerte sobre deps com CVEs conhecidos

Gere um relatório GO/NO-GO com justificativa clara.
