---
description: Scan de segurança completo do repositório.
---

Execute uma auditoria de segurança completa:

1. **Dependências:** `pip-audit` ou `npm audit` — CVEs conhecidos
2. **Segredos expostos:** busque por `password`, `secret`, `api_key`, `token` em arquivos de código (excluindo `.env` e testes)
3. **SQL Injection:** busque por queries com concatenação de string em vez de parâmetros
4. **Variáveis de ambiente:** verifique se há valores hardcoded que deveriam ser envs
5. **Permissões de arquivo:** `find . -name "*.sh" -perm /o+w` — scripts world-writable
6. **Headers de segurança:** se for API web, verifique CORS, CSRF, rate limiting

Classifique tudo em Crítico / Alto / Médio / Baixo com remediação recomendada.
