import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { error } = await supabase.auth.signUp({
  email: 'mike@casecraft.dev',
  password: 'Jckson'
})

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
} else {
  console.log('User created!')
  console.log('Email: mike@casecraft.dev')
  console.log('Password: Jckson')
  console.log('')
  console.log('Note: If email confirmation is enabled in Supabase,')
  console.log('you need to disable it or confirm the email before logging in.')
}
