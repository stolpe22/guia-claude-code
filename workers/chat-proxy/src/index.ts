interface Env {
  OPENAI_API_KEY: string
  ALLOWED_ORIGIN: string // ex: "stolpe22.github.io"
}

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[]
  systemPrompt: string
  model?: string
}

// Simple in-isolate rate limit (resets per cold start)
// Complementado pelo check de origin para evitar abuso externo
const ipHits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30       // requests
const RATE_WINDOW = 60_000  // 1 minuto em ms

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

function isAllowedOrigin(origin: string, allowedOrigin: string): boolean {
  if (!origin) return true
  return (
    origin.includes(allowedOrigin) ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1")
  )
}

function cors(response: Response, requestOrigin: string): Response {
  const headers = new Headers(response.headers)
  // Ecoa de volta a origin exata da requisição (já validada antes de chegar aqui)
  headers.set("Access-Control-Allow-Origin", requestOrigin || "*")
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  return new Response(response.body, { status: response.status, headers })
}

function json(data: unknown, status = 200, requestOrigin = "*"): Response {
  return cors(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
    requestOrigin,
  )
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? ""

    // Verifica origem antes de tudo
    if (env.ALLOWED_ORIGIN && !isAllowedOrigin(origin, env.ALLOWED_ORIGIN)) {
      return json({ error: "Origin não autorizada" }, 403, origin)
    }

    // CORS preflight — ecoa a origin da requisição
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin)
    }

    // Rate limiting por IP
    const ip =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("X-Forwarded-For") ??
      "unknown"

    if (isRateLimited(ip)) {
      return json(
        { error: "Muitas requisições. Aguarde um momento." },
        429,
        origin,
      )
    }

    // Parse body
    let body: ChatRequest
    try {
      body = (await request.json()) as ChatRequest
    } catch {
      return json({ error: "JSON inválido" }, 400, origin)
    }

    const { messages, systemPrompt, model = "gpt-4o-mini" } = body

    if (!messages?.length || !systemPrompt) {
      return json({ error: "Campos obrigatórios ausentes" }, 400, origin)
    }

    // Valida modelo permitido (evita que alguém chame gpt-4 no seu custo)
    const allowedModels = ["gpt-4o-mini", "gpt-4o"]
    const safeModel = allowedModels.includes(model) ? model : "gpt-4o-mini"

    // Chama OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: safeModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      console.error("OpenAI error:", openaiRes.status, err)
      return json(
        { error: `Erro do serviço (${openaiRes.status}). Tente novamente.` },
        502,
        origin,
      )
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const text = data.choices?.[0]?.message?.content ?? "Sem resposta."

    return json({ text }, 200, origin)
  },
}
