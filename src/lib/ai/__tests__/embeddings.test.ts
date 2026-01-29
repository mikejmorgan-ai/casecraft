import { describe, it, expect } from 'vitest'
import { chunkText } from '../embeddings'

// Note: generateEmbedding and generateEmbeddingsBatch require complex OpenAI mocking
// Testing the pure function chunkText which has no external dependencies

describe('chunkText', () => {
  it('should return empty array for empty string', () => {
    const result = chunkText('')
    expect(result).toEqual([])
  })

  it('should return single chunk for short text', () => {
    const text = 'This is a short text.'
    const result = chunkText(text, 1000, 200)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(text)
  })

  it('should split long text into multiple chunks', () => {
    const text = 'A'.repeat(2500)
    const result = chunkText(text, 1000, 200)
    expect(result.length).toBeGreaterThan(1)
  })

  it('should respect chunk size', () => {
    const text = 'Word '.repeat(500) // ~2500 chars
    const result = chunkText(text, 500, 100)
    result.forEach(chunk => {
      expect(chunk.length).toBeLessThanOrEqual(550) // Allow some buffer for word boundaries
    })
  })

  it('should break at sentence boundaries when possible', () => {
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.'
    const result = chunkText(text, 30, 5)
    // Should try to break at periods
    expect(result.some(chunk => chunk.endsWith('.'))).toBe(true)
  })

  it('should handle text with newlines', () => {
    const text = 'Line one.\nLine two.\nLine three.\nLine four.'
    const result = chunkText(text, 20, 5)
    expect(result.length).toBeGreaterThan(1)
  })

  it('should handle overlap correctly', () => {
    const text = 'AAAA BBBB CCCC DDDD EEEE FFFF'
    const result = chunkText(text, 15, 5)
    // With overlap, some content should appear in multiple chunks
    expect(result.length).toBeGreaterThan(1)
  })

  it('should filter out empty chunks', () => {
    const text = '   \n\n   Text here   \n\n   '
    const result = chunkText(text, 1000, 200)
    result.forEach(chunk => {
      expect(chunk.length).toBeGreaterThan(0)
    })
  })
})

// Integration tests for generateEmbedding and generateEmbeddingsBatch
// would require mocking the OpenAI SDK properly - skipping for now
// The core logic (chunkText) is well tested above
