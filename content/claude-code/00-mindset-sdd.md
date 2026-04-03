---
title: "00 🧠 Mindset & SDD"
tags: [claude-code, sdd, mindset, especificacao, design-upfront]
---

# FASE 0: Mindset Shift e Spec Driven Development (SDD)

[[README|Índice]] · [[01-isolamento-devcontainer|Próxima: Isolamento →]]

---

> **A Regra de Ouro:** A IA não adivinha regras de negócio. O código de produção só deve ser gerado após a aprovação de uma especificação rigorosa escrita por um humano.

## O Engenheiro como Comandante

Escrever código linha a linha é passado. O foco agora é **orquestração, arquitetura e segurança**.
Você não "digita" mais; você especifica, delega para a frota de subagentes e atua como o **Gatekeeper** (revisor final) garantindo a excelência técnica.

## Spec Driven Development (SDD) & Design Upfront

Antes de abrir o terminal para o Claude Code, o líder técnico precisa definir os "trilhos". Se a IA tiver que tomar decisões arquiteturais do zero, ocorrerá o _Vibe Coding_ (tentativa e erro descontrolada).

### O Arquivo `SPEC.md`

Crie o hábito de escrever um documento de especificação (PRD/Spec) para cada nova feature complexa. A IA lerá este documento para implementar a solução exata.

> Copie de `arquivos/SPEC.md` no repositório

**O que uma Spec deve conter:**

1. **Regras de Negócio:** O que o sistema deve fazer e o que _não_ deve fazer.
2. **Contratos de Dados (Interfaces):** Esquemas de entrada e saída (JSONs esperados, Pydantic models).
3. **Casos de Borda (Edge Cases):** Como tratar erros e limites.
4. **Decoupling (Separação de UI):** Backend (APIs) deve ser agnóstico. A UI é delegada para outro processo.

## TDD como Guard Rail da IA

O Test-Driven Development deixa de ser apenas uma boa prática e vira um **limite de segurança (Guard Rail)**.

1. O humano passa a `SPEC.md` para a IA.
2. O agente `@test-writer` gera os testes _antes_ do código.
3. Você revisa os testes.
4. O Claude implementa o código _até os testes passarem_.

Isso impede que a IA alucine funcionalidades extras ou fuja do escopo estabelecido.
