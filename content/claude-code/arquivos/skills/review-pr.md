---
description: Revisa o PR atual — diff, segurança, testes e qualidade.
---

Analise o Pull Request atual seguindo estas etapas:

1. Rode `gh pr diff` para ver todas as mudanças
2. Rode `gh pr view` para contexto (título, descrição, labels)
3. Avalie:
   - **Segurança**: credenciais expostas, inputs não validados, SQL injection
   - **Qualidade**: DRY, SOLID, complexidade desnecessária
   - **Testes**: cobertura das mudanças, edge cases cobertos
   - **Documentação**: funções públicas documentadas
4. Gere um relatório estruturado:
   - 🔴 Bloqueadores (impedem merge)
   - 🟡 Avisos (devem ser corrigidos)
   - 🟢 Sugestões (nice-to-have)
5. Poste o review com `gh pr review --comment -b "seu relatório"`
