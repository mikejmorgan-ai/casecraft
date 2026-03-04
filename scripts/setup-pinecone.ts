import { Pinecone } from '@pinecone-database/pinecone'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'treefarm-casecraft'

async function setupPinecone() {
  console.log('🌲 Setting up Pinecone index for Tree Farm CaseBrake.ai\n')

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  })

  // Check existing indexes
  console.log('Checking existing indexes...')
  const indexes = await pinecone.listIndexes()
  const existingNames = indexes.indexes?.map((i) => i.name) || []
  console.log('Existing indexes:', existingNames.join(', ') || 'none')

  // Check if our index exists
  if (existingNames.includes(INDEX_NAME)) {
    console.log(`\n✅ Index "${INDEX_NAME}" already exists`)
    const desc = await pinecone.describeIndex(INDEX_NAME)
    console.log(`   Dimensions: ${desc.dimension}`)
    console.log(`   Metric: ${desc.metric}`)
    console.log(`   Host: ${desc.host}`)

    // Get stats
    const index = pinecone.index(INDEX_NAME)
    const stats = await index.describeIndexStats()
    console.log(`\n   Total vectors: ${stats.totalRecordCount}`)
    console.log(`   Namespaces:`)
    for (const [ns, nsStats] of Object.entries(stats.namespaces || {})) {
      console.log(`     - ${ns}: ${nsStats.recordCount} vectors`)
    }

    return
  }

  // Create the index
  console.log(`\nCreating index "${INDEX_NAME}"...`)
  await pinecone.createIndex({
    name: INDEX_NAME,
    dimension: 1536, // text-embedding-3-small
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  })

  console.log('Waiting for index to be ready...')
  let ready = false
  while (!ready) {
    await new Promise((r) => setTimeout(r, 5000))
    const desc = await pinecone.describeIndex(INDEX_NAME)
    ready = desc.status?.ready === true
    console.log(`   Status: ${desc.status?.state}`)
  }

  console.log(`\n✅ Index "${INDEX_NAME}" created successfully!`)
  const desc = await pinecone.describeIndex(INDEX_NAME)
  console.log(`   Host: ${desc.host}`)

  // Print namespace structure
  console.log('\n📁 Namespace Structure:')
  console.log(`
treefarm-casecraft/
├── judge-stormont--utah-code
├── judge-stormont--case-law
├── judge-stormont--court-orders
├── judge-stormont--scheduling-orders
├── judge-stormont--urcp
├── plaintiff-counsel--complaints
├── plaintiff-counsel--motions
├── plaintiff-counsel--briefs
├── plaintiff-counsel--discovery-sent
├── plaintiff-counsel--discovery-responses
├── plaintiff-counsel--strategy-memos
├── plaintiff-counsel--affidavits
├── defense-counsel--answers
├── defense-counsel--motions
├── defense-counsel--briefs
├── defense-counsel--discovery-sent
├── defense-counsel--discovery-responses
├── defense-counsel--disclosures
├── court-clerk--docket
├── court-clerk--filing-records
├── court-clerk--service-records
├── court-clerk--procedural-rules
├── county-clerk--ordinances
├── county-clerk--meeting-minutes
├── county-clerk--public-records
├── county-recorder--deeds
├── county-recorder--patents
├── county-recorder--chain-of-title
├── county-recorder--easements
├── county-recorder--surveys
├── dogm-agent--permits
├── dogm-agent--reclamation
├── dogm-agent--regulations
├── dogm-agent--historical-mining
├── judges-clerk--calendar
├── judges-clerk--chambers-rules
├── judges-clerk--case-management
└── shared--news-coverage
`)

  console.log('\n🎉 Pinecone setup complete!')
  console.log('\nNext steps:')
  console.log('1. Run document ingestion: npx tsx scripts/ingest-documents.ts')
  console.log('2. Verify in Pinecone console: https://app.pinecone.io')
}

setupPinecone().catch(console.error)
