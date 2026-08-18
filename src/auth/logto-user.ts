import type { Payload } from 'payload'

import type { IdTokenClaims } from '@logto/node'

export async function findUserByLogtoSub(payload: Payload, sub: string) {
  const result = await payload.find({
    collection: 'users',
    where: {
      logtoSub: {
        equals: sub,
      },
    },
    limit: 1,
    overrideAccess: true,
  })

  return result.docs[0] || null
}

export async function findOrCreateUserByLogtoClaims(payload: Payload, claims: IdTokenClaims) {
  const existing = await findUserByLogtoSub(payload, claims.sub)

  if (existing) {
    return existing
  }

  const data = {
    logtoSub: claims.sub,
    email: claims.email || `${claims.sub}@users.logto`,
    name: claims.name || '',
  }

  try {
    return await payload.create({
      collection: 'users',
      data,
      overrideAccess: true,
    })
  } catch (err) {
    // The email may already be taken by a different identity. Fall back to a
    // unique email derived from the Logto subject so creation still succeeds.
    payload.logger.error({ err }, 'Failed to create user from Logto claims, retrying with fallback email')
    return payload.create({
      collection: 'users',
      data: {
        ...data,
        email: `${claims.sub}@users.logto`,
      },
      overrideAccess: true,
    })
  }
}
