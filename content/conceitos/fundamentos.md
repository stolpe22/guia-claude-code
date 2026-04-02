# 🧠 Fundamentos: Engenharia de Desenvolvimento com IA

[← Voltar ao Índice](../README.md)

---

> Este documento consolida os conceitos teóricos que embasam os dois guias práticos deste repositório. Leia **antes** de ir para os guias técnicos.

---

## 1. O Mindset Shift: De Codificador para Comandante

O paradigma mudou. Escrever código linha a linha **perdeu valor para os negócios** se não vier acompanhado de documentação, arquitetura e testes — porque o código por si só é descartável.

O engenheiro moderno:

| Antes (Codificador) | Agora (Comandante) |
|---|---|
| 70% digitando código | 70% entendendo o problema |
| 20% debugando | 20% definindo arquitetura e regras |
| 10% documentando | 10% revisando o que a IA produziu |

> **Você não escreve código. Você orquestra inteligência artificial para codificar — e valida o resultado com olho de engenheiro.**

---

## 2. Os 3 Níveis de Desenvolvimento com IA

### Nível 1: Vibe Coding 🎲

O nível mais básico. Uso ad-hoc de prompts sem estrutura.

- ✅ Bom para: protótipos rápidos, exploração, aprendizado
- ❌ Problemas: sem guard rails, código inseguro, sem testes, sem padrão
- 💡 Exemplo: *"Faz um CRUD de usuários aí"*

### Nível 2: Agentic Development 🤖

Desenvolvimento orquestrado. Adiciona **fricção proposital**.

- ✅ Bom para: projetos reais com equipe
- ✅ Inclui: arquitetura em camadas, agentes especializados, hooks de segurança
- 💡 Exemplo: *Agente architect analisa → agente dev implementa → agente reviewer valida*

### Nível 3: Spec-Driven Development (SDD) 📋

O nível de maior rigor. Trazido da engenharia de software clássica.

- ✅ Bom para: produção, compliance, projetos críticos
- ✅ Inclui: PRDs escritos antes do código, specs detalhadas, loops de conformidade
- 💡 Exemplo: *Humano escreve spec completa → IA implementa → IA testa contra spec → loop até 100% conforme*

```
Vibe Coding ──→ Agentic Development ──→ Spec-Driven Development
  (caos)           (orquestrado)            (engenharia pura)
```

> **Meta:** Todo time deveria estar pelo menos no Nível 2. Times maduros no Nível 3.

---

## 3. Frota de Subagentes Especializados (Agentic Fleets)

Em vez de pedir para **uma IA generalista** resolver um projeto inteiro (onde ela perde contexto), a técnica exige:

1. **Quebrar** problemas complexos em **pedaços mínimos** (*small bite chunks*)
2. **Criar múltiplos subagentes hiperespecializados**
3. **Rodar em paralelo** sob comando do humano

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Architect  │  │  Developer  │  │ Test Writer │  │  Reviewer   │
│  (read-only)│  │ (read+write)│  │ (read+write)│  │ (read-only) │
│             │  │             │  │             │  │             │
│  Analisa    │  │  Implementa │  │  Testa      │  │  Valida     │
│  estrutura  │  │  features   │  │  tudo       │  │  segurança  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                              │
                     🧑 HUMANO (Comandante)
                     Orquestra, revisa, aprova
```

**Por que funciona melhor:**
- Cada agente tem **contexto limitado** = menos alucinação
- Ferramentas **restritas por agente** = mais seguro
- **Paralelismo** = velocidade exponencial
- **Separação de concerns** = responsabilidades claras

---

## 4. O Humano como Gatekeeper

O ser humano **não escreve código**, mas atua no **gargalo da qualidade**.

É o guardião que:
- Entende os **fundamentos** para validar o que a IA produziu
- Faz e gerencia **revisão dupla** (inclusive usando IAs revisoras)
- Dá a **aprovação final** (Merge) garantindo segurança e excelência

```
IA produz código
      │
      ▼
IA revisora analisa (code-reviewer agent)
      │
      ▼
Humano faz review final
      │
   ┌──┴──┐
   │     │
Aprova  Rejeita
(Merge) (Feedback → volta pro loop)
```

> **Regra de ouro:** Se você não entende o que o código faz, **não faça merge**. O humano é a última barreira.

---

## 5. Isolamento de Ambiente (Dev Containers)

IAs autônomas podem executar comandos destrutivos:
- Apagar o banco de dados
- Vazar variáveis de ambiente (`~/.aws`, `~/.ssh`)
- Instalar pacotes maliciosos
- Fazer requests para servidores externos

**A regra:** nunca rode o agente direto na máquina host.

```
❌ ERRADO                          ✅ CORRETO
┌──────────────┐                  ┌──────────────────────────┐
│ Sua máquina  │                  │ Sua máquina              │
│              │                  │                          │
│ ~/.ssh ←exposed                │  ┌────────────────────┐  │
│ ~/.aws ←exposed                │  │ Container Docker   │  │
│ ~/docs ←exposed                │  │                    │  │
│              │                  │  │ Só vê /workspace   │  │
│ 🤖 IA roda  │                  │  │ Firewall ativo     │  │
│    AQUI      │                  │  │ 🤖 IA roda AQUI   │  │
└──────────────┘                  │  └────────────────────┘  │
                                  │                          │
                                  │ ~/.ssh = INACESSÍVEL     │
                                  │ ~/.aws = INACESSÍVEL     │
                                  └──────────────────────────┘
```

---

## 6. Design Upfront: A Arquitetura Guia a IA

A IA **não possui** o histórico ou as necessidades de longo prazo do negócio para escolher a melhor tecnologia.

O líder técnico deve:

1. **Desenhar entidades e fluxos** antes de qualquer código
2. **Documentar escolhas tecnológicas** e restrições
3. **Escrever em arquivo** (`README.md`, `CLAUDE.md`, `copilot-instructions.md`)
4. A IA usa essa documentação como **trilhos obrigatórios**

```
Sem Design Upfront:           Com Design Upfront:
IA → gera código genérico     Humano → escreve spec/arquitetura
   → padrões da internet         IA → lê regras do projeto
   → pode ser inseguro              → gera código DENTRO dos trilhos
   → refaz 5x                       → acerta de primeira
```

> **Regra:** Escreva o README de arquitetura **antes** da primeira linha de código.

---

## 7. TDD como Guard Rail

O desenvolvimento começa pelas **validações e contratos de dados**, não pelo código funcional.

```
1. Humano descreve o caso de uso
         │
         ▼
2. IA cria os TESTES primeiro
         │
         ▼
3. Testes falham (Red) ← esperado!
         │
         ▼
4. IA implementa o código funcional
         │
         ▼
5. Testes passam (Green) ← validação automática
         │
         ▼
6. Refactoring com segurança
```

**Por que funciona com IA:**
- Testes definem o **contrato** — a IA não pode divergir
- Se a IA alucinar, os testes **quebram imediatamente**
- Cobertura automática desde o início

---

## 8. Knowledge Bases (KBs) e MCP

Para evitar que a IA alucine, dê a ela o **contexto da empresa**.

```
Documentação interna    →  Scraping (N8N)  →  Banco Vetorial  →  MCP  →  Agente IA
(Confluence, Notion,       (automatizado)     (Supabase,         (protocolo)
 wikis, RFCs, ADRs)                            Qdrant,
                                               Pinecone)
```

**MCP (Model Context Protocol):** Protocolo que conecta agentes de IA a fontes de dados externas em tempo real. O agente consulta a base vetorial e recebe contexto relevante antes de gerar código.

---

## 9. Segurança com Dados Sintéticos

Para compliance e segurança, IAs **não devem acessar bancos de produção**.

A solução: **dados sintéticos** — informações falsas que mantêm os mesmos padrões e relações do banco real.

| Dado Real | Dado Sintético |
|---|---|
| CPF: 123.456.789-00 | CPF: 987.654.321-99 (válido mas falso) |
| Email: joao@empresa.com | Email: teste42@mock.dev |
| Saldo: R$ 15.432,00 | Saldo: R$ 8.721,50 |

**Mesma estrutura, mesmas relações, zero risco de vazamento.**

Use a própria IA para gerar os dados sintéticos com:
- Mesmo schema
- Mesma distribuição estatística
- Mesmas foreign keys e constraints
- Zero dados pessoais reais

---

## 10. Infraestrutura como Código (IaC)

O deploy também entra na orquestração da IA.

```
❌ ERRADO                          ✅ CORRETO
Cliques manuais no console AWS     IA gera Terraform
→ Perda de controle de custos      → Precificação antecipada
→ Acessos indevidos                → Scripts reprodutíveis
→ Não reprodutível                 → Destroy = 1 comando
→ "Quem mexeu nisso?"              → Versionado no Git
```

Peça para a IA:
1. Gerar o mapeamento em **Terraform** (ou Pulumi, CDK)
2. **Precificar** a infraestrutura antecipadamente
3. Gerar scripts de **subir** e **destruir** ambientes
4. Tudo versionado no Git como qualquer outro código

---

## 11. Desacoplamento de Interface (UX)

Separe **estritamente** a lógica de dados/back-end da interface gráfica.

```
1. Construa e valide toda a API primeiro
         │
         ▼
2. Testes de contrato (API spec) passando
         │
         ▼
3. DEPOIS delegue a interface para:
   ├── IA especializada em UI (Lovable, v0, etc.)
   ├── Designer do time
   └── Agente frontend dedicado
```

> IAs textuais geram interfaces genéricas e engessadas. Separe a engenharia da experiência visual.

---

## 12. Auditoria de Segurança

Código de IA pode carregar más práticas da internet:
- Senhas em texto puro
- Algoritmos de criptografia defasados
- `eval()` / `exec()` escondidos
- Dependências com CVEs conhecidos

**Solução:** Etapas dedicadas onde IAs auditoras (como o agente `code-reviewer`) procuram **ativamente** por vulnerabilidades no código gerado.

```
Código gerado pela IA
      │
      ▼
code-reviewer agent (automático)
      │
      ▼
SAST tools (Semgrep, Bandit, etc.)
      │
      ▼
Humano valida findings
      │
      ▼
Merge (ou volta pro loop)
```

---

## Resumo: Os 12 Pilares

| # | Pilar | Resumo |
|---|---|---|
| 1 | Mindset Shift | Comandante, não codificador |
| 2 | 3 Níveis | Vibe Coding → Agentic → SDD |
| 3 | Agentic Fleets | Agentes especializados em paralelo |
| 4 | Humano Gatekeeper | Valida, não digita |
| 5 | Isolamento | Dev Containers obrigatórios |
| 6 | Design Upfront | Arquitetura antes do código |
| 7 | TDD Guard Rail | Testes antes da implementação |
| 8 | KBs + MCP | Contexto da empresa para a IA |
| 9 | Dados Sintéticos | Zero dados reais no dev |
| 10 | IaC | Infraestrutura versionada |
| 11 | Desacoplamento UX | API first, interface depois |
| 12 | Auditoria | Segurança ativa no código gerado |

---

[← Voltar ao Índice](../README.md)