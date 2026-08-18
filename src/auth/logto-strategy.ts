import type { AuthStrategy } from 'payload'

import { createLogtoSession, logtoCookieHeader } from './logto.js'
import { findUserByLogtoSub } from './logto-user.js'

export const logtoStrategy: AuthStrategy = {
  name: 'logto',
  authenticate: async ({ canSetHeaders, headers, payload }) => {
    const { client, storage, cookies } = createLogtoSession(headers)
    await storage.init()

    if (!(await client.isAuthenticated())) {
      return { user: null }
    }

    const claims = await client.getIdTokenClaims()
    const user = await findUserByLogtoSub(payload, claims.sub)

    if (!user) {
      return { user: null }
    }

    const cookieHeader = canSetHeaders ? logtoCookieHeader(cookies) : undefined

    return {
      user: {
        ...user,
        collection: 'users',
      },
      ...(cookieHeader
        ? {
            responseHeaders: new Headers({ 'Set-Cookie': cookieHeader }),
          }
        : {}),
    }
  },
}
