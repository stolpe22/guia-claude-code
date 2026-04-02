---
description: Analisa cobertura de testes e aponta gaps críticos.
---

Analise a cobertura de testes do projeto:

1. Rode `pytest --cov=. --cov-report=term-missing -q`
2. Identifique módulos com cobertura abaixo de 80%
3. Para cada módulo crítico sem cobertura, liste:
   - Funções/classes não testadas
   - Casos de borda mais prováveis
   - Complexidade ciclomática estimada
4. Priorize por risco: lógica de negócio > utils > scripts
5. Gere um plano de ação ordenado por impacto

Não escreva os testes — apenas o plano para @test-writer implementar.
