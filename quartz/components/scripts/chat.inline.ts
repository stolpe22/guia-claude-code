// Vibe Codinho — Chat RAG inline script

interface Chunk {
  id: string
  title: string
  section: string
  content: string
  url: string
  tags: string[]
}

interface Message {
  role: "user" | "assistant"
  content: string
}

// Module-level state — persists across SPA navigations
let chunks: Chunk[] = []
let chunksLoaded = false
let sessionMessages: Message[] = []
let siteBase = ""
let chatIsOpen = false

// ─── BM25-ish retrieval ───────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

function scoreChunk(queryTokens: string[], chunk: Chunk): number {
  const text = `${chunk.title} ${chunk.section} ${chunk.section} ${chunk.content}`
  const tokens = tokenize(text)
  const len = tokens.length || 1
  let s = 0
  for (const qt of queryTokens) {
    const tf = tokens.filter((t) => t === qt).length / len
    if (tf > 0) s += tf
  }
  return s
}

function findRelevantChunks(query: string, topK = 4): Chunk[] {
  const qt = tokenize(query)
  if (qt.length === 0 || chunks.length === 0) return []
  return chunks
    .map((c) => ({ c, s: scoreChunk(qt, c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, topK)
    .map((x) => x.c)
}

// ─── System prompt builder ────────────────────────────────────────────────────

function buildSystemPrompt(relevant: Chunk[], globalMode: boolean): string {
  const persona = `Você é o Vibe Codinho, assistente técnico e didático de uma base de conhecimento sobre Claude Code e práticas de SDD (Software Design Description).

Responda SEMPRE em português do Brasil.
Seja técnico, direto e didático — como um colega de time experiente.
Não repita a pergunta. Vá direto ao ponto.`

  if (!globalMode) {
    if (relevant.length === 0) {
      return (
        persona +
        `\n\nNão há contexto relevante na documentação. Informe o usuário educadamente que não encontrou essa informação e sugira ativar o Modo Global ou reformular a pergunta.`
      )
    }
    const ctx = relevant
      .map((c) => `### ${c.title} — ${c.section}\n${c.content}`)
      .join("\n\n---\n\n")
    return (
      persona +
      `\n\nResponda APENAS com base no contexto de documentação abaixo. Não use conhecimento externo.
Ao final da resposta, cite as fontes em Markdown: **Fontes:** [Título](url)

Contexto:
${ctx}`
    )
  }

  const ctx =
    relevant.length > 0
      ? `\n\nContexto da documentação (use como fonte primária):\n${relevant.map((c) => `### ${c.title} — ${c.section}\n${c.content}`).join("\n\n---\n\n")}\n\nAo final, cite as fontes usadas: **Fontes:** [Título](url)`
      : ""

  return persona + ctx
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function callProxy(
  proxyUrl: string,
  systemPrompt: string,
  messages: Message[],
): Promise<string> {
  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, messages, model: "gpt-4o-mini" }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(data.error ?? `Erro ${res.status} no servidor.`)
  }
  const data = await res.json() as { text?: string }
  return data.text ?? "Sem resposta."
}

async function callOpenAI(
  systemPrompt: string,
  messages: Message[],
  apiKey: string,
  model: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  })
  if (!res.ok) {
    const hints: Record<number, string> = {
      401: "API key OpenAI inválida. Verifique nas configurações (⚙).",
      429: "Quota OpenAI excedida. Tente novamente em instantes.",
    }
    throw new Error(hints[res.status] ?? `Erro ${res.status} da OpenAI.`)
  }
  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? "Sem resposta."
}

async function callGemini(
  systemPrompt: string,
  messages: Message[],
  apiKey: string,
  model: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const resBody = await res.text()
    const hints: Record<number, string> = {
      401: "API key inválida. Verifique nas configurações (⚙).",
      403: "API key sem permissão. Crie em aistudio.google.com/app/apikey.",
      404: "Modelo não encontrado. Troque o modelo nas configurações (⚙).",
      429: "Quota excedida. Crie a key em aistudio.google.com/app/apikey.",
    }
    const hint = hints[res.status]
    throw new Error(hint ?? `Erro ${res.status}: ${resBody.slice(0, 300)}`)
  }
  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sem resposta."
}

async function callClaude(
  systemPrompt: string,
  messages: Message[],
  apiKey: string,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  if (!res.ok) {
    const hints: Record<number, string> = {
      401: "API key Claude inválida. Verifique nas configurações (⚙).",
      429: "Quota Claude excedida. Tente novamente.",
    }
    throw new Error(hints[res.status] ?? `Erro ${res.status} da Anthropic.`)
  }
  const data = await res.json() as { content?: { text?: string }[] }
  return data.content?.[0]?.text ?? "Sem resposta."
}

// ─── Simple markdown renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
      const isInternal = url.startsWith("/") && !url.startsWith("//")
      if (isInternal && siteBase) {
        return `<a href="${siteBase}${url.slice(1)}">${linkText}</a>`
      }
      return `<a href="${url}" target="_blank" rel="noopener">${linkText}</a>`
    })
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function appendMessage(
  container: HTMLElement,
  role: "user" | "assistant" | "error",
  content: string,
) {
  if (role === "error") {
    const el = document.createElement("div")
    el.className = "chat-error"
    el.innerHTML = `<div class="msg-bubble">${content}</div>`
    container.appendChild(el)
    container.scrollTop = container.scrollHeight
    return
  }
  const el = document.createElement("div")
  el.className = `chat-message ${role}-message`
  const rendered = renderMarkdown(content)
  el.innerHTML = `<div class="msg-bubble"><p>${rendered}</p></div>`
  container.appendChild(el)
  container.scrollTop = container.scrollHeight
}

function showTyping(container: HTMLElement): HTMLElement {
  const el = document.createElement("div")
  el.className = "chat-typing"
  el.innerHTML = "<span></span><span></span><span></span>"
  container.appendChild(el)
  container.scrollTop = container.scrollHeight
  return el
}

// ─── Main widget setup ────────────────────────────────────────────────────────

document.addEventListener("nav", () => {
  const widget = document.getElementById("chat-widget")
  if (!widget) return

  // Load chunks once across all navigations
  if (!chunksLoaded) {
    const url = widget.dataset.chunksUrl
    if (url) {
      if (!siteBase) {
        try {
          siteBase = new URL(url, window.location.href).href.replace(/static\/search-chunks\.json$/, "")
        } catch {}
      }
      fetch(url)
        .then((r) => r.json())
        .then((data: Chunk[]) => {
          chunks = data
          chunksLoaded = true
        })
        .catch(() => {
          console.warn("[Vibe Codinho] Não foi possível carregar search-chunks.json")
        })
    }
  }

  setupWidget(widget)
})

function setupWidget(widget: HTMLElement) {
  const proxyUrl = widget.dataset.proxyUrl ?? ""
  const hasProxy = proxyUrl.length > 0

  const toggleBtn = widget.querySelector<HTMLButtonElement>("#chat-toggle-btn")
  const modal = widget.querySelector<HTMLElement>("#chat-modal")
  const closeBtn = widget.querySelector<HTMLButtonElement>("#chat-close-btn")
  const settingsBtn = widget.querySelector<HTMLButtonElement>("#chat-settings-btn")
  const onboarding = widget.querySelector<HTMLElement>("#chat-onboarding")
  const chatPanel = widget.querySelector<HTMLElement>("#chat-panel")
  const saveConfigBtn = widget.querySelector<HTMLButtonElement>("#save-config-btn")
  const useDefaultBtn = widget.querySelector<HTMLButtonElement>("#use-default-btn")
  const providerSelect = widget.querySelector<HTMLSelectElement>("#provider-select")
  const modelSelect = widget.querySelector<HTMLSelectElement>("#model-select")
  const apiKeyInput = widget.querySelector<HTMLInputElement>("#api-key-input")
  const sendBtn = widget.querySelector<HTMLButtonElement>("#chat-send-btn")
  const chatInput = widget.querySelector<HTMLTextAreaElement>("#chat-input")
  const messagesContainer = widget.querySelector<HTMLElement>(".chat-messages")
  const globalToggle = widget.querySelector<HTMLInputElement>("#global-mode-toggle")
  const onboardingTitle = widget.querySelector<HTMLElement>("#onboarding-title")
  const onboardingDesc = widget.querySelector<HTMLElement>("#onboarding-desc")

  if (!modal || !toggleBtn) return
  const safeModal = modal

  // Restore settings from localStorage
  const savedProvider = localStorage.getItem("vibeCodinho_provider") || "gemini"
  const savedModel = localStorage.getItem("vibeCodinho_model") || "gemini-2.0-flash"
  const savedGeminiKey = localStorage.getItem("vibeCodinho_apiKey_gemini") || ""
  const savedClaudeKey = localStorage.getItem("vibeCodinho_apiKey_claude") || ""
  const savedOpenAIKey = localStorage.getItem("vibeCodinho_apiKey_openai") || ""

  const personalKey =
    savedProvider === "gemini"
      ? savedGeminiKey
      : savedProvider === "claude"
        ? savedClaudeKey
        : savedOpenAIKey

  // Se tem proxy: vai direto pro chat. Se não tem: exige key pessoal
  const showChat = hasProxy || !!personalKey

  if (providerSelect) providerSelect.value = savedProvider
  if (modelSelect) modelSelect.value = savedModel
  if (apiKeyInput) apiKeyInput.value = personalKey

  if (onboarding) onboarding.style.display = showChat ? "none" : "flex"
  if (chatPanel) chatPanel.style.display = showChat ? "flex" : "none"

  // Se tem proxy, adapta texto do onboarding para "key opcional" e mostra botão "usar padrão"
  if (hasProxy && onboardingTitle) {
    onboardingTitle.textContent = "Sua própria key (opcional)"
  }
  if (hasProxy && onboardingDesc) {
    onboardingDesc.textContent =
      "O Vibe Codinho já funciona sem configuração. Use sua própria key apenas se quiser privacidade total."
  }
  if (hasProxy && useDefaultBtn) {
    useDefaultBtn.style.display = "block"
  }

  // Restore messages display
  if (messagesContainer) {
    const alreadyRendered = messagesContainer.querySelector(".user-message, .assistant-message")
    if (!alreadyRendered) {
      if (sessionMessages.length > 0) {
        // DOM was recreated (e.g. hard nav) — re-render existing conversation
        messagesContainer.innerHTML = ""
        for (const msg of sessionMessages) {
          appendMessage(messagesContainer, msg.role, msg.content)
        }
      } else {
        messagesContainer.innerHTML = `
          <div class="chat-welcome">
            <div class="welcome-avatar">VC</div>
            <p>Olá! Sou o <strong>Vibe Codinho</strong>.<br>
            Pergunte sobre Claude Code, SDD ou qualquer coisa da doc.</p>
          </div>`
      }
    }
  }

  // Restore modal open state across SPA navigations
  if (chatIsOpen) {
    safeModal.classList.add("chat-open")
  }

  // ── Provider change → update model options & key field ──
  function updateModelOptions() {
    if (!providerSelect || !modelSelect || !apiKeyInput) return
    const p = providerSelect.value
    if (p === "openai") {
      modelSelect.innerHTML = `
        <option value="gpt-4o-mini">GPT-4o Mini (recomendado, econômico)</option>
        <option value="gpt-4o">GPT-4o (mais capaz)</option>`
      apiKeyInput.value = localStorage.getItem("vibeCodinho_apiKey_openai") || ""
      apiKeyInput.placeholder = "sk-..."
    } else if (p === "gemini") {
      modelSelect.innerHTML = `
        <option value="gemini-2.0-flash">Gemini 2.0 Flash (recomendado, grátis)</option>
        <option value="gemini-2.5-flash-preview-04-17">Gemini 2.5 Flash Preview (grátis)</option>`
      apiKeyInput.value = localStorage.getItem("vibeCodinho_apiKey_gemini") || ""
      apiKeyInput.placeholder = "AIza..."
    } else {
      modelSelect.innerHTML = `
        <option value="claude-haiku-4-5-20251001">Claude Haiku (econômico)</option>`
      apiKeyInput.value = localStorage.getItem("vibeCodinho_apiKey_claude") || ""
      apiKeyInput.placeholder = "sk-ant-..."
    }
    const currentModel = localStorage.getItem("vibeCodinho_model") || ""
    if (currentModel && [...modelSelect.options].some((o) => o.value === currentModel)) {
      modelSelect.value = currentModel
    }
  }

  providerSelect?.addEventListener("change", updateModelOptions)
  window.addCleanup(() => providerSelect?.removeEventListener("change", updateModelOptions))
  updateModelOptions()

  // ── Save config ──
  function handleSaveConfig() {
    if (!providerSelect || !modelSelect || !apiKeyInput) return
    const p = providerSelect.value
    const m = modelSelect.value
    const key = apiKeyInput.value.trim()

    // Se tem proxy e key vazia, apenas fecha o onboarding
    if (!key && !hasProxy) {
      apiKeyInput.focus()
      return
    }

    localStorage.setItem("vibeCodinho_provider", p)
    localStorage.setItem("vibeCodinho_model", m)
    if (key) {
      const storageKey =
        p === "openai"
          ? "vibeCodinho_apiKey_openai"
          : p === "gemini"
            ? "vibeCodinho_apiKey_gemini"
            : "vibeCodinho_apiKey_claude"
      localStorage.setItem(storageKey, key)
      localStorage.setItem("vibeCodinho_usePersonalKey", "true")
    } else {
      // Sem key → volta a usar o proxy
      localStorage.removeItem("vibeCodinho_usePersonalKey")
    }
    if (onboarding) onboarding.style.display = "none"
    if (chatPanel) chatPanel.style.display = "flex"
  }

  saveConfigBtn?.addEventListener("click", handleSaveConfig)
  window.addCleanup(() => saveConfigBtn?.removeEventListener("click", handleSaveConfig))

  // ── Usar padrão do site (limpa key pessoal, volta pro proxy) ──
  function handleUseDefault() {
    localStorage.removeItem("vibeCodinho_usePersonalKey")
    localStorage.removeItem("vibeCodinho_apiKey_gemini")
    localStorage.removeItem("vibeCodinho_apiKey_openai")
    localStorage.removeItem("vibeCodinho_apiKey_claude")
    if (apiKeyInput) apiKeyInput.value = ""
    if (onboarding) onboarding.style.display = "none"
    if (chatPanel) chatPanel.style.display = "flex"
  }
  useDefaultBtn?.addEventListener("click", handleUseDefault)
  window.addCleanup(() => useDefaultBtn?.removeEventListener("click", handleUseDefault))

  // ── Toggle modal ──
  function handleToggle() {
    safeModal.classList.toggle("chat-open")
    chatIsOpen = safeModal.classList.contains("chat-open")
  }
  toggleBtn.addEventListener("click", handleToggle)
  window.addCleanup(() => toggleBtn.removeEventListener("click", handleToggle))

  // ── Close ──
  function handleClose() {
    safeModal.classList.remove("chat-open")
    chatIsOpen = false
  }
  closeBtn?.addEventListener("click", handleClose)
  window.addCleanup(() => closeBtn?.removeEventListener("click", handleClose))

  // ── Settings → back to onboarding ──
  function handleSettings() {
    if (onboarding) onboarding.style.display = "flex"
    if (chatPanel) chatPanel.style.display = "none"
  }
  settingsBtn?.addEventListener("click", handleSettings)
  window.addCleanup(() => settingsBtn?.removeEventListener("click", handleSettings))

  // ── Send message ──
  async function handleSend() {
    if (!chatInput || !messagesContainer || !sendBtn) return
    const text = chatInput.value.trim()
    if (!text) return

    const provider = localStorage.getItem("vibeCodinho_provider") || "gemini"
    const model = localStorage.getItem("vibeCodinho_model") || "gemini-2.0-flash"
    const personalApiKey =
      provider === "openai"
        ? localStorage.getItem("vibeCodinho_apiKey_openai") || ""
        : provider === "gemini"
          ? localStorage.getItem("vibeCodinho_apiKey_gemini") || ""
          : localStorage.getItem("vibeCodinho_apiKey_claude") || ""

    // Precisa de proxy ou key pessoal explicitamente escolhida
    const usePersonalKey =
      !hasProxy
        ? !!personalApiKey
        : localStorage.getItem("vibeCodinho_usePersonalKey") === "true" && !!personalApiKey

    if (!hasProxy && !personalApiKey) {
      if (onboarding) onboarding.style.display = "flex"
      if (chatPanel) chatPanel.style.display = "none"
      return
    }

    chatInput.value = ""
    chatInput.style.height = "auto"
    sendBtn.disabled = true

    const welcome = messagesContainer.querySelector(".chat-welcome")
    if (welcome) welcome.remove()

    appendMessage(messagesContainer, "user", text)
    sessionMessages.push({ role: "user", content: text })

    const typingEl = showTyping(messagesContainer)
    const isGlobal = globalToggle?.checked ?? false

    try {
      const relevant = findRelevantChunks(text)
      const systemPrompt = buildSystemPrompt(relevant, isGlobal)

      let reply: string

      // Proxy é o padrão. Key pessoal só se o usuário optou explicitamente via settings.
      if (usePersonalKey) {
        if (provider === "openai") {
          reply = await callOpenAI(systemPrompt, sessionMessages, personalApiKey, model)
        } else if (provider === "claude") {
          reply = await callClaude(systemPrompt, sessionMessages, personalApiKey)
        } else {
          reply = await callGemini(systemPrompt, sessionMessages, personalApiKey, model)
        }
      } else {
        reply = await callProxy(proxyUrl, systemPrompt, sessionMessages)
      }

      typingEl.remove()
      appendMessage(messagesContainer, "assistant", reply)
      sessionMessages.push({ role: "assistant", content: reply })

      if (sessionMessages.length > 20) {
        sessionMessages = sessionMessages.slice(-20)
      }
    } catch (err: unknown) {
      typingEl.remove()
      const msg = err instanceof Error ? err.message : "Erro desconhecido"
      appendMessage(messagesContainer, "error", msg)
    } finally {
      sendBtn.disabled = false
      chatInput.focus()
    }
  }

  sendBtn?.addEventListener("click", handleSend)
  window.addCleanup(() => sendBtn?.removeEventListener("click", handleSend))

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }
  chatInput?.addEventListener("keydown", handleKeydown)
  window.addCleanup(() => chatInput?.removeEventListener("keydown", handleKeydown))

  function handleInput() {
    if (!chatInput) return
    chatInput.style.height = "auto"
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 80)}px`
  }
  chatInput?.addEventListener("input", handleInput)
  window.addCleanup(() => chatInput?.removeEventListener("input", handleInput))
}
