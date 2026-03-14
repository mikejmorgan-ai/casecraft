/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { users, organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)

  try {
    switch (eventType) {
      case 'user.created':
        // Create user in database
        await db.insert(users).values({
          clerkId: evt.data.id,
          email: evt.data.email_addresses[0]?.email_address || '',
          firstName: evt.data.first_name || '',
          lastName: evt.data.last_name || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log('User created successfully:', evt.data.id)
        break

      case 'user.updated':
        // Update user in database
        await db
          .update(users)
          .set({
            email: evt.data.email_addresses[0]?.email_address || '',
            firstName: evt.data.first_name || '',
            lastName: evt.data.last_name || '',
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, evt.data.id))
        console.log('User updated successfully:', evt.data.id)
        break

      case 'user.deleted':
        // Delete user from database
        await db.delete(users).where(eq(users.clerkId, evt.data.id))
        console.log('User deleted successfully:', evt.data.id)
        break

      case 'organization.created':
        // Create organization in database
        await db.insert(organizations).values({
          clerkId: evt.data.id,
          name: evt.data.name,
          slug: evt.data.slug,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log('Organization created successfully:', evt.data.id)
        break

      case 'organization.updated':
        // Update organization in database
        await db
          .update(organizations)
          .set({
            name: evt.data.name,
            slug: evt.data.slug,
            updatedAt: new Date(),
          })
          .where(eq(organizations.clerkId, evt.data.id))
        console.log('Organization updated successfully:', evt.data.id)
        break

      case 'organization.deleted':
        // Delete organization from database
        await db.delete(organizations).where(eq(organizations.clerkId, evt.data.id))
        console.log('Organization deleted successfully:', evt.data.id)
        break

      default:
        console.log('Unhandled webhook event type:', eventType)
    }
  } catch (error) {
    console.error('Database operation failed:', error)
    return new Response('Database error', { status: 500 })
  }

  return new NextResponse('', { status: 200 })
}