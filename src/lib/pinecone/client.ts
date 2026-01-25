import { Pinecone } from '@pinecone-database/pinecone'

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

export const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'treefarm-casecraft'

export function getPineconeIndex() {
  return pinecone.index(INDEX_NAME)
}

export { pinecone }
