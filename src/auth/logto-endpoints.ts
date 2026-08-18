import { APIError } from 'payload'
import { getSafeRedirect } from 'payload/shared'
import type { Endpoint } from 'payload'

import { clearLogtoCookie, createLogtoSession, logtoCookieHeader } from './logto.js'
import { findOrCreateUserByLogtoClaims } from './logto-user.js'

export const logtoSignInEndpoint: Endpoint = {
  path: '/logto/login',
  method: 'get',
  handler: async (req) => {
    const { client, storage, cookies, getNavigateUrl } = createLogtoSession(req.headers)
    await storage.init()

    const redirectUri = `${req.origin}/api/users/logto/callback`
    const postRedirectUri = getSafeRedirect({
      fallbackTo: `${req.origin}/admin`,
      redirectTo: req.searchParams.get('redirect') || "",
    })

    await client.signIn({
      redirectUri,
      postRedirectUri,
    })

    const navigateUrl = getNavigateUrl()

    if (!navigateUrl) {
      throw new APIError('Failed to start Logto sign-in', 500)
    }

    const headers = new Headers({ Location: navigateUrl })
    const cookieHeader = logtoCookieHeader(cookies)

    if (cookieHeader) {
      headers.set('Set-Cookie', cookieHeader)
    }

    return new Response(null, { status: 302, headers })
  },
}

export const logtoCallbackEndpoint: Endpoint = {
  path: '/logto/callback',
  method: 'get',
  handler: async (req) => {
    const { client, storage, cookies, getNavigateUrl } = createLogtoSession(req.headers)
    await storage.init()

    await client.handleSignInCallback(req.url)

    const claims = await client.getIdTokenClaims()
    await findOrCreateUserByLogtoClaims(req.payload, claims)

    const redirect = getSafeRedirect({
      fallbackTo: `${req.origin}/admin`,
      redirectTo: getNavigateUrl() || "",
    })

    const headers = new Headers({ Location: redirect })
    const cookieHeader = logtoCookieHeader(cookies)

    if (cookieHeader) {
      headers.set('Set-Cookie', cookieHeader)
    }

    return new Response(null, { status: 302, headers })
  },
}

export const logtoLogoutEndpoint: Endpoint = {
  path: '/logto/logout',
  method: 'get',
  handler: async (req) => {
    const { client, storage, cookies, getNavigateUrl } = createLogtoSession(req.headers)
    await storage.init()

    const postLogoutRedirectUri = getSafeRedirect({
      fallbackTo: `${req.origin}/`,
      redirectTo: req.searchParams.get('redirect') || "",
    })

    await client.signOut(postLogoutRedirectUri)

    const headers = new Headers({
      Location: getNavigateUrl() || postLogoutRedirectUri,
    })
    const cookieHeader = logtoCookieHeader(cookies) || clearLogtoCookie()
    headers.set('Set-Cookie', cookieHeader)

    return new Response(null, { status: 302, headers })
  },
}
