import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const email = process.env.TEST_USER_EMAIL
const password = process.env.TEST_USER_PASSWORD

if (!email || !password) {
  console.error('Error: TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are required')
  console.log('Usage: TEST_USER_EMAIL=user@example.com TEST_USER_PASSWORD=yourpassword node scripts/create-user-temp.mjs')
  process.exit(1)
}

const { error } = await supabase.auth.signUp({
  email,
  password
})

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
} else {
  console.log('User created!')
  console.log('Email:', email)
  console.log('')
  console.log('Note: If email confirmation is enabled in Supabase,')
  console.log('you need to disable it or confirm the email before logging in.')
}
