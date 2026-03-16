import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServiceSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Server configuration error', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()

  // Verify webhook signature using HMAC
  const timestampNumber = parseInt(svixTimestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestampNumber) > 300) {
    return new Response('Timestamp too old', { status: 400 })
  }

  const eventType = payload.type
  const eventData = payload.data
  const supabase = createServiceSupabase()

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = eventData
        await supabase.from('user_profiles').upsert({
          id,
          email: email_addresses?.[0]?.email_address || '',
          full_name: `${first_name || ''} ${last_name || ''}`.trim(),
          role: 'attorney',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = eventData
        await supabase
          .from('user_profiles')
          .update({
            email: email_addresses?.[0]?.email_address || '',
            full_name: `${first_name || ''} ${last_name || ''}`.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
        break
      }

      case 'user.deleted': {
        const { id } = eventData
        await supabase.from('user_profiles').delete().eq('id', id)
        break
      }

      default:
        console.log('Unhandled webhook event:', eventType)
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Processing error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
