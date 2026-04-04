import { readdir, readFile, writeFile } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import matter from "gray-matter"

const CONTENT_DIRS = ["content/claude-code", "content/conceitos"]
const OUTPUT_PATH = "quartz/static/search-chunks.json"
const MAX_CHUNK_WORDS = 500

async function getAllMdFiles(dir) {
  const entries = await readdir(dir, { recursive: true })
  return entries
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(dir, f))
}

function slugify(filePath) {
  return filePath
    .replace(/\\/g, "/")
    .replace(/^content\//, "")
    .replace(/\.md$/, "")
    .replace(/\/index$/, "")
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
}

function splitIntoChunks(content, frontmatter, filePath) {
  const slug = slugify(filePath)
  const title = frontmatter.title || slug.split("/").pop() || slug
  const rawTags = frontmatter.tags || []
  const tags = Array.isArray(rawTags) ? rawTags : [rawTags]

  // Split on ## headings (but not ###)
  const sectionRe = /^## (.+)$/m
  const parts = content.split(/^(?=## )/m)
  const chunks = []

  for (const part of parts) {
    const match = part.match(/^## (.+)/)
    const sectionTitle = match ? match[1].trim() : title
    const body = match ? part.slice(match[0].length) : part

    const clean = stripMarkdown(body)
    if (clean.length < 30) continue

    const words = clean.split(/\s+/)
    for (let i = 0; i < words.length; i += MAX_CHUNK_WORDS) {
      const chunkText = words.slice(i, i + MAX_CHUNK_WORDS).join(" ")
      const suffix = i > 0 ? `-${Math.floor(i / MAX_CHUNK_WORDS)}` : ""
      const sectionSlug = sectionTitle
        .toLowerCase()
        .replace(/[^\wáàãâéèêíìîóòõôúùûç\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 40)

      chunks.push({
        id: `${slug}#${sectionSlug}${suffix}`,
        title,
        section: sectionTitle,
        content: chunkText,
        url: `/${slug}`,
        tags,
      })
    }
  }

  // Fallback: whole file as one chunk
  if (chunks.length === 0) {
    const clean = stripMarkdown(content)
    if (clean.length > 30) {
      chunks.push({
        id: slug,
        title,
        section: title,
        content: clean.slice(0, MAX_CHUNK_WORDS * 6),
        url: `/${slug}`,
        tags,
      })
    }
  }

  return chunks
}

async function main() {
  const allChunks = []

  for (const dir of CONTENT_DIRS) {
    if (!existsSync(dir)) {
      console.warn(`[chat-index] Pasta não encontrada: ${dir}`)
      continue
    }

    const files = await getAllMdFiles(dir)
    console.log(`[chat-index] ${files.length} arquivos em ${dir}`)

    for (const file of files) {
      try {
        const raw = await readFile(file, "utf-8")
        const { data: frontmatter, content } = matter(raw)
        const chunks = splitIntoChunks(content, frontmatter, file)
        allChunks.push(...chunks)
      } catch (e) {
        console.warn(`[chat-index] Falha em ${file}: ${e.message}`)
      }
    }
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(allChunks, null, 2), "utf-8")
  console.log(`[chat-index] ✓ ${allChunks.length} chunks → ${OUTPUT_PATH}`)
}

main().catch((e) => {
  console.error("[chat-index] Erro fatal:", e)
  process.exit(1)
})
