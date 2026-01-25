import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkCases() {
  const { data, error } = await supabase
    .from('cases')
    .select('id, name, case_number, plaintiff_name, defendant_name, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('Cases in CaseCraft database:\n')

  if (data.length === 0) {
    console.log('  (no cases found)')
    console.log('\n  Create Tree Farm case by running:')
    console.log('  npx tsx scripts/seed-tree-farm.ts')
  } else {
    data.forEach(c => {
      console.log(`  ${c.name}`)
      console.log(`    Case #: ${c.case_number || '(not set)'}`)
      console.log(`    Parties: ${c.plaintiff_name || '?'} v. ${c.defendant_name || '?'}`)
      console.log(`    Status: ${c.status}`)
      console.log(`    ID: ${c.id}`)
      console.log('')
    })
  }
}

checkCases().catch(console.error)
