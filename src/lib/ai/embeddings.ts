import OpenAI from 'openai'

const openai = new OpenAI()

export async function generateEmbedding(text: string): Promise<number[]> {
  const truncated = text.substring(0, 8000)

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncated,
    encoding_format: 'float',
  })

  return response.data[0].embedding
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const truncated = texts.map(t => t.substring(0, 8000))

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncated,
    encoding_format: 'float',
  })

  return response.data.map(d => d.embedding)
}

// Chunk text into smaller pieces for embedding
export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)

    // Try to break at sentence boundary
    let breakPoint = end
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      const lastNewline = text.lastIndexOf('\n', end)
      const boundary = Math.max(lastPeriod, lastNewline)
      if (boundary > start + chunkSize / 2) {
        breakPoint = boundary + 1
      }
    }

    chunks.push(text.slice(start, breakPoint).trim())
    start = breakPoint - overlap
    if (start < 0) start = 0
    if (breakPoint >= text.length) break
  }

  return chunks.filter(c => c.length > 0)
}
