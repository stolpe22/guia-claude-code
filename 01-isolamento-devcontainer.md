# FASE 1: Isolamento de Segurança (Dev Container)

[← Voltar ao Índice](./README.md) · [Próxima: Cérebro e KBs →](./02-cerebro-knowledge-bases.md)

---

> **Princípio fundamental:** Nunca rode a IA diretamente no seu sistema operacional raiz. O contêiner Docker cria uma barreira física entre o Claude Code e seus arquivos pessoais, credenciais SSH, variáveis de ambiente etc.

## Pré-requisitos

1. Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) e garanta que está rodando
2. Abra o **VS Code**
3. Extensões → pesquise **"Dev Containers"** (Microsoft) → **Install**

## Os 3 Arquivos Obrigatórios

Crie a pasta `.devcontainer/` na raiz do projeto. Dentro dela, 3 arquivos. Todos podem ser copiados do [repo oficial da Anthropic](https://github.com/anthropics/claude-code/tree/main/.devcontainer).

### Arquivo 1: `Dockerfile`

> [📦 Fonte oficial](https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile) · [📋 Copiar daqui](./arquivos/Dockerfile)

```dockerfile
FROM node:20

ARG TZ
ENV TZ="$TZ"

ARG CLAUDE_CODE_VERSION=latest

# Instala ferramentas de dev + iptables/ipset para firewall
RUN apt-get update && apt-get install -y --no-install-recommends \
  less git procps sudo fzf zsh man-db unzip gnupg2 gh \
  iptables ipset iproute2 dnsutils aggregate jq nano vim \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/share/npm-global && \
  chown -R node:node /usr/local/share

ARG USERNAME=node

RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

ENV DEVCONTAINER=true

RUN mkdir -p /workspace /home/node/.claude && \
  chown -R node:node /workspace /home/node/.claude

WORKDIR /workspace

ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  sudo dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

USER node

ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano

ARG ZSH_IN_DOCKER_VERSION=1.2.0
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# ⭐ Instala o Claude Code
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}

COPY init-firewall.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-firewall && \
  chmod 0440 /etc/sudoers.d/node-firewall
USER node
```

**O que faz:**
- Imagem `node:20` (Debian) como base
- Instala `iptables`, `ipset`, `dnsutils`, `aggregate` — **essenciais pro firewall**
- Instala `gh`, `jq`, `git`, `fzf`, `zsh` + Powerlevel10k
- Roda como **usuário não-root** (`node`)
- Instala `@anthropic-ai/claude-code` globalmente
- Configura `sudoers` para que **apenas** o script de firewall rode como root

---

### Arquivo 2: `devcontainer.json`

> [📦 Fonte oficial](https://github.com/anthropics/claude-code/blob/main/.devcontainer/devcontainer.json) · [📋 Copiar daqui](./arquivos/devcontainer.json)

```jsonc
{
  "name": "Claude Code Sandbox",
  "build": {
    "dockerfile": "Dockerfile",
    "args": {
      "TZ": "${localEnv:TZ:America/Sao_Paulo}",
      "CLAUDE_CODE_VERSION": "latest",
      "GIT_DELTA_VERSION": "0.18.2",
      "ZSH_IN_DOCKER_VERSION": "1.2.0"
    }
  },
  // ⚠️ ESSENCIAL: permite iptables dentro do container
  "runArgs": [
    "--cap-add=NET_ADMIN",
    "--cap-add=NET_RAW"
  ],
  "customizations": {
    "vscode": {
      "extensions": [
        "anthropic.claude-code",
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
    "source=claude-code-bashhistory-${devcontainerId},target=/commandhistory,type=volume",
    "source=claude-code-config-${devcontainerId},target=/home/node/.claude,type=volume"
  ],
  "containerEnv": {
    "NODE_OPTIONS": "--max-old-space-size=4096",
    "CLAUDE_CONFIG_DIR": "/home/node/.claude",
    "POWERLEVEL9K_DISABLE_GITSTATUS": "true"
  },
  // Monta APENAS a pasta do projeto
  "workspaceMount": "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=delegated",
  "workspaceFolder": "/workspace",
  // 🔥 Firewall roda automaticamente ao iniciar
  "postStartCommand": "sudo /usr/local/bin/init-firewall.sh",
  "waitFor": "postStartCommand"
}
```

**Detalhes de segurança:**

| Configuração | O que protege |
|---|---|
| `--cap-add=NET_ADMIN/NET_RAW` | Permite configurar firewall via `iptables` dentro do container |
| `workspaceMount` com `bind` | Container **só vê** a pasta do projeto. Zero acesso a `~/.ssh`, `~/.aws`, `~/.gitconfig` |
| `mounts` com `volume` | Histórico e config do Claude ficam em volumes Docker isolados |
| `remoteUser: "node"` | Roda como não-root |
| `postStartCommand` | Firewall ativo **antes** de qualquer interação |

---

### Arquivo 3: `init-firewall.sh`

> [📦 Fonte oficial](https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh) · [📋 Copiar daqui](./arquivos/init-firewall.sh)

```bash
#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

DOCKER_DNS_RULES=$(iptables-save -t nat | grep "127\.0\.0\.11" || true)

iptables -F && iptables -X
iptables -t nat -F && iptables -t nat -X
iptables -t mangle -F && iptables -t mangle -X
ipset destroy allowed-domains 2>/dev/null || true

if [ -n "$DOCKER_DNS_RULES" ]; then
    iptables -t nat -N DOCKER_OUTPUT 2>/dev/null || true
    iptables -t nat -N DOCKER_POSTROUTING 2>/dev/null || true
    echo "$DOCKER_DNS_RULES" | xargs -L 1 iptables -t nat
fi

# Permite DNS + SSH + localhost
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT -p udp --sport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Cria whitelist
ipset create allowed-domains hash:net

# GitHub IPs
gh_ranges=$(curl -s https://api.github.com/meta)
[ -z "$gh_ranges" ] && echo "ERROR: Failed to fetch GitHub IP ranges" && exit 1
echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null || exit 1

while read -r cidr; do
    [[ "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]] || exit 1
    ipset add allowed-domains "$cidr"
done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' | aggregate -q)

# Outros domínios essenciais
for domain in \
    "registry.npmjs.org" \
    "api.anthropic.com" \
    "sentry.io" \
    "statsig.anthropic.com" \
    "statsig.com" \
    "marketplace.visualstudio.com" \
    "vscode.blob.core.windows.net" \
    "update.code.visualstudio.com"; do
    ips=$(dig +noall +answer A "$domain" | awk '$4 == "A" {print $5}')
    [ -z "$ips" ] && echo "ERROR: Failed to resolve $domain" && exit 1
    while read -r ip; do
        ipset add allowed-domains "$ip"
    done < <(echo "$ips")
done

# Rede do host Docker
HOST_IP=$(ip route | grep default | cut -d" " -f3)
HOST_NETWORK=$(echo "$HOST_IP" | sed "s/\.[0-9]*$/.0\/24/")
iptables -A INPUT -s "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT

# 🔒 POLÍTICA PADRÃO: BLOQUEIA TUDO
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT
iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited

# Verificação
echo "Firewall configuration complete"
if curl --connect-timeout 5 https://example.com >/dev/null 2>&1; then
    echo "ERROR: Firewall FALHOU — conseguiu acessar example.com" && exit 1
else
    echo "✅ Firewall OK — example.com bloqueado"
fi
if ! curl --connect-timeout 5 https://api.github.com/zen >/dev/null 2>&1; then
    echo "ERROR: Firewall FALHOU — não consegue acessar GitHub" && exit 1
else
    echo "✅ Firewall OK — GitHub acessível"
fi
```

**Whitelist do firewall:**

| Domínio | Razão |
|---|---|
| IPs do GitHub (web, api, git) | git push/pull e GitHub API |
| `api.anthropic.com` | API do Claude (obrigatório) |
| `registry.npmjs.org` | Pacotes npm |
| `statsig.anthropic.com` / `statsig.com` | Telemetria Claude |
| `sentry.io` | Relatórios de erro |
| `marketplace.visualstudio.com` | Extensões VS Code |
| Rede local Docker | Comunicação VS Code ↔ Container |

> **Tudo fora dessa lista = BLOQUEADO.**

---

## Como Abrir o Container

1. VS Code → canto inferior esquerdo → ícone `><` (verde/azul)
2. Clique → **"Reopen in Container"**
3. Aguarde o build. Pronto — terminal isolado e com firewall ativo.

---

## Alternativa Simplificada (sem firewall)

Se não precisa do firewall, use apenas a [Dev Container Feature](https://github.com/anthropics/devcontainer-features):

```jsonc
{
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/anthropics/devcontainer-features/claude-code:1": {}
  }
}
```

> ⚠️ Essa versão **NÃO** inclui firewall. Para segurança máxima, use os 3 arquivos completos.

---

[← Voltar ao Índice](./README.md) · [Próxima: Cérebro e KBs →](./02-cerebro-knowledge-bases.md)