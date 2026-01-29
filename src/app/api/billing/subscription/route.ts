import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/usage/limits'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getUserSubscription(user.id)

    return NextResponse.json(subscription)
  } catch (err) {
    console.error('Subscription fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
