/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { users, organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  const eventType = evt.type

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data

      // Create or get organization (for now, create a personal org)
      const orgName = `${first_name} ${last_name}'s Firm`
      const orgSlug = `${first_name?.toLowerCase()}-${last_name?.toLowerCase()}-firm-${Date.now()}`

      const newOrg = await db
        .insert(organizations)
        .values({
          name: orgName,
          slug: orgSlug,
          plan: 'trial',
        })
        .returning()

      // Create user
      await db.insert(users).values({
        clerkId: id,
        orgId: newOrg[0].id,
        email: email_addresses[0]?.email_address || '',
        fullName: `${first_name} ${last_name}`,
        role: 'admin', // First user is admin of their org
      })

      console.log(`Created user ${id} and org ${newOrg[0].id}`)
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data

      await db
        .update(users)
        .set({
          email: email_addresses[0]?.email_address || '',
          fullName: `${first_name} ${last_name}`,
        })
        .where(eq(users.clerkId, id))

      console.log(`Updated user ${id}`)
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data

      await db.delete(users).where(eq(users.clerkId, id))

      console.log(`Deleted user ${id}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Error occurred', { status: 500 })
  }

  return NextResponse.json({ message: 'Webhook processed successfully' })
}