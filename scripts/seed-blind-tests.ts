import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DocumentType =
  | 'complaint'
  | 'answer'
  | 'motion'
  | 'brief'
  | 'discovery'
  | 'deposition'
  | 'exhibit'
  | 'order'
  | 'judgment'
  | 'other'

interface BlindTestCase {
  caseName: string
  caseNumber: string
  directory: string // relative to project root
  files: string[]
}

// ---------------------------------------------------------------------------
// Auto-detect doc_type from filename
// ---------------------------------------------------------------------------

function detectDocType(filename: string): DocumentType {
  const lower = filename.toLowerCase()
  if (lower.includes('brief')) return 'brief'
  if (lower.includes('motion') || lower.includes('msj')) return 'motion'
  if (lower.includes('opposition') || lower.includes('cross')) return 'motion'
  if (lower.includes('reply')) return 'motion'
  return 'other'
}

// ---------------------------------------------------------------------------
// Detect filed_by metadata from filename patterns
// ---------------------------------------------------------------------------

function detectFiledBy(filename: string): string | null {
  const lower = filename.toLowerCase()

  // Plaintiff-side indicators
  if (lower.includes('plaintiff')) return 'plaintiff'
  if (lower.includes('appellants')) return 'plaintiff'

  // Defendant-side indicators
  if (lower.includes('defendant')) return 'defendant'
  if (lower.includes('appellees')) return 'defendant'
  if (lower.includes('intervenor')) return 'defendant'

  return null
}

// ---------------------------------------------------------------------------
// Convert filename to human-readable document name
// ---------------------------------------------------------------------------

function filenameToDocName(filename: string): string {
  // Remove .txt extension, replace hyphens with spaces, title-case each word
  return filename
    .replace(/\.txt$/, '')
    .replace(/^\d+-/, '') // strip leading number prefix like "01-"
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Case definitions
// ---------------------------------------------------------------------------

const BLIND_TEST_CASES: BlindTestCase[] = [
  {
    caseName: 'NMA v. San Juan County',
    caseNumber: '170700006',
    directory: 'data/blind-tests/nma-v-san-juan-county',
    files: [
      '01-plaintiff-motion-for-summary-judgment.txt',
      '02-intervenors-opposition.txt',
      '03-defendant-cross-msj.txt',
      '04-defendant-opposition.txt',
      '05-plaintiff-reply.txt',
      '06-defendant-reply.txt',
    ],
  },
  {
    caseName: 'Wallingford v. Moab',
    caseNumber: '170700009',
    directory: 'data/blind-tests/wallingford-v-moab',
    files: [
      '01-intervenors-msj.txt',
      '02-plaintiffs-opposition.txt',
      '03-appellants-brief.txt',
      '04-appellees-brief.txt',
    ],
  },
  {
    caseName: 'LD III LLC v. Mapleton City',
    caseNumber: '170401683',
    directory: 'data/blind-tests/ld-iii-v-mapleton-city',
    files: [
      '01-motion-for-summary-judgment.txt',
      '02-opposition-to-msj-and-cross-msj.txt',
      '03-reply-and-opposition-to-cross-msj.txt',
      '04-cross-msj-reply.txt',
      '05-appellants-brief.txt',
      '06-appellees-brief.txt',
      '07-reply-brief.txt',
    ],
  },
  {
    caseName: 'Morra v. Grand County',
    caseNumber: '070700108',
    directory: 'data/blind-tests/morra-v-grand-county',
    files: [
      '01-intervenors-msj.txt',
      '02-plaintiffs-cross-msj-in-opposition.txt',
      '03-intervenors-reply-and-opposition.txt',
      '04-plaintiffs-reply.txt',
      '05-plaintiffs-supplemental-msj.txt',
      '06-defendants-joint-opposition.txt',
      '07-plaintiffs-reply-on-remand.txt',
    ],
  },
]

// ---------------------------------------------------------------------------
// Main seeder
// ---------------------------------------------------------------------------

async function seedBlindTests() {
  console.log('=== CaseBrake.ai Blind Test Document Loader ===\n')

  let totalInserted = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const testCase of BLIND_TEST_CASES) {
    console.log(`\n--- ${testCase.caseName} (Case #${testCase.caseNumber}) ---`)

    // 1. Look up the case by case_number
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, name')
      .eq('case_number', testCase.caseNumber)
      .single()

    if (caseError || !caseData) {
      console.error(
        `  Case not found for case_number '${testCase.caseNumber}'.`
      )
      console.error(
        `  Please run the SQL seed first:\n` +
          `    e.g., psql $DATABASE_URL -f supabase/seeds/002_nma_v_san_juan_county.sql\n` +
          `  Skipping this case.\n`
      )
      totalErrors++
      continue
    }

    const caseId = caseData.id
    console.log(`  Found case: ${caseData.name} (id: ${caseId})`)

    // 2. Process each text file
    for (const filename of testCase.files) {
      const filePath = path.join(testCase.directory, filename)
      const absolutePath = path.resolve(filePath)
      const docName = filenameToDocName(filename)

      // Check if document already exists (by name + case_id)
      const { data: existing } = await supabase
        .from('documents')
        .select('id')
        .eq('case_id', caseId)
        .eq('name', docName)
        .maybeSingle()

      if (existing) {
        console.log(`  SKIP (already exists): ${docName}`)
        totalSkipped++
        continue
      }

      // Read the text file
      if (!fs.existsSync(absolutePath)) {
        console.error(`  ERROR: File not found: ${absolutePath}`)
        totalErrors++
        continue
      }

      const contentText = fs.readFileSync(absolutePath, 'utf-8')
      const fileSize = fs.statSync(absolutePath).size
      const docType = detectDocType(filename)
      const filedBy = detectFiledBy(filename)

      // Build metadata
      const metadata: Record<string, unknown> = {
        source_file: filename,
        blind_test: true,
      }
      if (filedBy) {
        metadata.filed_by = filedBy
      }

      // Insert document record
      const { error: insertError } = await supabase.from('documents').insert({
        case_id: caseId,
        name: docName,
        doc_type: docType,
        file_path: filePath,
        file_size: fileSize,
        mime_type: 'text/plain',
        content_text: contentText,
        is_embedded: false,
        metadata,
      })

      if (insertError) {
        console.error(`  ERROR inserting "${docName}":`, insertError.message)
        totalErrors++
      } else {
        console.log(
          `  INSERT: ${docName} (${docType}${filedBy ? ', ' + filedBy : ''}, ${(fileSize / 1024).toFixed(1)} KB)`
        )
        totalInserted++
      }
    }
  }

  // Summary
  console.log('\n=== Summary ===')
  console.log(`  Inserted: ${totalInserted}`)
  console.log(`  Skipped (already exist): ${totalSkipped}`)
  console.log(`  Errors: ${totalErrors}`)
  console.log('\nDone.')
}

seedBlindTests().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
