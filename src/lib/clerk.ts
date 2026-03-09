/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { users, organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
  const { userId } = auth()

  if (!userId) {
    return null
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  return user.length > 0 ? user[0] : null
}

export async function requireAuth() {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}