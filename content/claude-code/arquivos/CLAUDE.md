# Regras do Projeto

## Arquitetura
- Backend: FastAPI com Python 3.12
- Banco de Dados: PostgreSQL 16 via SQLAlchemy 2.0 (async)
- Frontend: Next.js 14 com TypeScript strict
- Autenticação: JWT + OAuth2

## Convenções de Código
- Sempre use tipagem estrita (mypy strict mode)
- Docstrings em Google Style para toda função pública
- Testes com pytest; cobertura mínima de 80%
- Nunca armazene senhas em texto puro — use bcrypt

## Padrões de Segurança
- Validação de input com Pydantic v2
- Rate limiting em todos os endpoints públicos
- CORS restrito aos domínios de produção
- Variáveis sensíveis apenas via variáveis de ambiente

## Git
- Conventional Commits (feat:, fix:, docs:)
- PRs precisam de pelo menos 1 review
- Branch principal: main