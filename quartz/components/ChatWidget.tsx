import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/chat.inline"
import style from "./styles/chat.scss"
import { pathToRoot, joinSegments } from "../util/path"

interface ChatWidgetOptions {
  proxyUrl?: string
}

export default ((userOpts?: ChatWidgetOptions) => {
  const opts = userOpts ?? {}

  const ChatWidget: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const chunksUrl = joinSegments(baseDir, "static/search-chunks.json")

  return (
    <div id="chat-widget" data-chunks-url={chunksUrl} data-proxy-url={opts.proxyUrl ?? ""}>
      {/* Floating toggle button */}
      <button id="chat-toggle-btn" aria-label="Abrir Vibe Codinho">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="22"
          height="22"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
        <span class="chat-btn-label">Vibe Codinho</span>
      </button>

      {/* Chat modal */}
      <div id="chat-modal" role="dialog" aria-label="Vibe Codinho">
        {/* Header */}
        <div class="chat-header">
          <div class="chat-header-info">
            <span class="chat-avatar">VC</span>
            <div>
              <span class="chat-name">Vibe Codinho</span>
              <span class="chat-subtitle">Assistente técnico</span>
            </div>
          </div>
          <div class="chat-header-actions">
            {/* Doc / Global mode toggle */}
            <div class="chat-mode-wrap" title="Modo Doc: responde só com base na documentação. Modo Global: usa conhecimento geral do LLM.">
              <span>Doc</span>
              <label class="toggle-switch" aria-label="Modo global">
                <input type="checkbox" id="global-mode-toggle" />
                <span class="toggle-slider"></span>
              </label>
              <span>Global</span>
            </div>
            <button id="chat-settings-btn" title="Configurações da API">⚙</button>
            <button id="chat-close-btn" title="Fechar">✕</button>
          </div>
        </div>

        {/* Onboarding panel */}
        <div id="chat-onboarding" class="chat-panel" style="display: flex; flex-direction: column; overflow-y: auto; padding: 20px 18px;">
          <h3 id="onboarding-title">Configurar Vibe Codinho</h3>
          <p id="onboarding-desc">Para usar o chat, você precisa de uma API key gratuita.</p>

          <div class="form-group">
            <label for="provider-select">Provedor</label>
            <select id="provider-select">
              <option value="gemini">Google Gemini (Grátis)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>

          <div class="form-group">
            <label for="model-select">Modelo</label>
            <select id="model-select">
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (recomendado, grátis)</option>
              <option value="gemini-2.5-flash-preview-04-17">Gemini 2.5 Flash Preview (grátis)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="api-key-input">API Key</label>
            <input
              type="password"
              id="api-key-input"
              placeholder="Cole sua API key aqui"
              autocomplete="off"
            />
          </div>

          <details class="api-tutorial">
            <summary>Como obter uma API key do Gemini (grátis)</summary>
            <ol>
              <li>
                Acesse{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener"
                >
                  aistudio.google.com/app/apikey
                </a>
              </li>
              <li>Faça login com sua conta Google</li>
              <li>Clique em <strong>"Create API Key"</strong></li>
              <li>Copie a key e cole no campo acima</li>
              <li>Selecione <strong>Gemini Flash</strong></li>
              <li>
                <span class="tutorial-highlight">
                  Plano grátis: 1.500 requisições/dia
                </span>
              </li>
            </ol>
          </details>

          <button id="save-config-btn" class="btn-primary">
            Salvar e usar minha key →
          </button>

          <button id="use-default-btn" class="btn-default" style="display: none;">
            ↩ Usar padrão do site (sem key)
          </button>
        </div>

        {/* Chat panel */}
        <div id="chat-panel" class="chat-panel" style="display: none;">
          <div class="chat-messages">
            <div class="chat-welcome">
              <div class="welcome-avatar">VC</div>
              <p>
                Olá! Sou o <strong>Vibe Codinho</strong>.
                <br />
                Pergunte sobre Claude Code, SDD ou qualquer coisa da doc.
              </p>
            </div>
          </div>

          <div class="chat-input-area">
            <textarea
              id="chat-input"
              placeholder="Pergunte sobre Claude Code, SDD... (Ctrl+Enter envia)"
              rows={1}
            ></textarea>
            <button id="chat-send-btn" title="Enviar (Ctrl+Enter)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

  ChatWidget.css = style
  ChatWidget.afterDOMLoaded = script
  return ChatWidget
}) satisfies QuartzComponentConstructor
