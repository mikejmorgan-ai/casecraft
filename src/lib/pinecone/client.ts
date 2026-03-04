import { Pinecone } from '@pinecone-database/pinecone'

export const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'legal-docs'

let pineconeClient: Pinecone | null = null

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not configured')
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    })
  }
  return pineconeClient
}

export function getPineconeIndex() {
  return getPineconeClient().index(INDEX_NAME)
}

export { getPineconeClient as pinecone }
