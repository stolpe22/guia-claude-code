---
paths:
  - "quartz.config.ts"
  - "quartz.layout.ts"
  - "quartz/**/*.tsx"
  - "quartz/**/*.scss"
  - "quartz/**/*.ts"
---

# Regras de Configuração e Customização do Quartz

- **Nunca altere o core do Quartz** (pasta `quartz/`) sem justificativa explícita. Prefira customizações via `quartz.config.ts`, `quartz.layout.ts` e `quartz/styles/custom.scss`.
- **Graph View é prioridade.** Qualquer alteração de layout deve manter o Graph View visível e funcional.
- **Preservar SPA.** O `enableSPA: true` nunca deve ser desabilitado.
- **Dark mode é o padrão.** Sempre teste as cores em dark mode primeiro.
- **Performance:** Não adicione fontes externas pesadas. Prefira fontes com subset otimizado ou system fonts como fallback.
- **Acessibilidade:** Contraste mínimo AA (4.5:1) em textos. Links devem ter indicação visual além de cor.
- **Após qualquer edição em arquivos Quartz**, rode `npx quartz build` para validar.
- **Não instale plugins do Quartz** sem antes verificar compatibilidade com a versão atual.
