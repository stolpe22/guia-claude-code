# FASE 1: Isolamento de Segurança (Dev Container)

[← Voltar ao Índice](./README.md) · [Próxima: Cérebro e Instruções →](./02-cerebro-instrucoes.md)

---

> **Princípio fundamental:** Nunca rode a IA diretamente no seu sistema operacional raiz. O contêiner Docker cria uma barreira física entre o agente e seus arquivos pessoais, credenciais SSH, variáveis de ambiente etc.

## Pré-requisitos

1. Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Abra o **VS Code**
3. Extensões → instale **"Dev Containers"** (Microsoft)
4. Extensões → instale **"GitHub Copilot"** + **"GitHub Copilot Chat"**

## Dev Container para Copilot CLI

### Arquivo 1: `Dockerfile`

```dockerfile
FROM node:20

ARG TZ
ENV TZ="$TZ"

# Instala ferramentas de dev
RUN apt-get update && apt-get install -y --no-install-recommends \
  less git procps sudo fzf zsh man-db unzip gnupg2 gh \
  jq nano vim curl wget \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/share/npm-global && \
  chown -R node:node /usr/local/share

ARG USERNAME=node

RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

ENV DEVCONTAINER=true

RUN mkdir -p /workspace && chown -R node:node /workspace

WORKDIR /workspace

USER node

ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano

# ⭐ Instala o GitHub Copilot CLI
RUN npm install -g @githubnext/copilot-cli
```

### Arquivo 2: `devcontainer.json`

```jsonc
{
  "name": "Copilot Sandbox",
  "build": {
    "dockerfile": "Dockerfile",
    "args": {
      "TZ": "${localEnv:TZ:America/Sao_Paulo}"
    }
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "github.copilot",
        "github.copilot-chat",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "eamodio.gitlens"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "terminal.integrated.defaultProfile.linux": "zsh"
      }
    }
  },
  "remoteUser": "node",
  "mounts": [
    "source=copilot-bashhistory-${devcontainerId},target=/commandhistory,type=volume"
  ],
  "containerEnv": {
    "NODE_OPTIONS": "--max-old-space-size=4096"
  },
  // Monta APENAS a pasta do projeto
  "workspaceMount": "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=delegated",
  "workspaceFolder": "/workspace"
}
```

**Detalhes de segurança:**

| Configuração | O que protege |
|---|---|
| `workspaceMount` com `bind` | Container **só vê** a pasta do projeto. Zero acesso a `~/.ssh`, `~/.aws`, `~/.gitconfig` |
| `mounts` com `volume` | Histórico fica em volume Docker isolado |
| `remoteUser: "node"` | Roda como não-root |

> **💡 Nota sobre Codex no GitHub.com:** O OpenAI Codex como coding agent no GitHub.com já roda em sandbox isolado automaticamente (ambiente Fireworker da GitHub). O Dev Container é mais relevante para uso **local** com a CLI ou VS Code.

---

## Como Abrir o Container

1. VS Code → canto inferior esquerdo → ícone `><`
2. Clique → **"Reopen in Container"**
3. Aguarde o build. Pronto — terminal isolado.

---

[← Voltar ao Índice](./README.md) · [Próxima: Cérebro e Instruções →](./02-cerebro-instrucoes.md)