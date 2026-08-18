import { APIError } from 'payload'
import { getSafeRedirect } from 'payload/shared'
import type { Endpoint } from 'payload'

import { clearLogtoCookie, createLogtoSession, findOrCreateUserByLogtoClaims, logtoCookieHeader } from './logto.js'

function redirectResponse(location: string, cookies: Map<string, string>): Response {
  const headers = new Headers({ Location: location })
  const cookieHeader = logtoCookieHeader(cookies)
  if (cookieHeader) headers.set('Set-Cookie', cookieHeader)
  return new Response(null, { status: 302, headers })
}

export const logtoSignInEndpoint: Endpoint = {
  path: '/logto/login',
  method: 'get',
  handler: async (req) => {
    const { client, storage, cookies, getNavigateUrl } = createLogtoSession(req.headers)
    await storage.init()

    await client.signIn({
      redirectUri: `${req.origin}/api/users/logto/callback`,
      postRedirectUri: getSafeRedirect({
        fallbackTo: `${req.origin}/admin`,
        redirectTo: req.searchParams.get('redirect') || "",
      }),
    })

    const navigateUrl = getNavigateUrl()
    if (!navigateUrl) throw new APIError('Failed to start Logto sign-in', 500)

    return redirectResponse(navigateUrl, cookies)
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

    return redirectResponse(redirect, cookies)
  },
}

export const logtoLogoutEndpoint: Endpoint = {
  path: '/logto/logout',
  method: 'get',
  handler: async (req) => {
    const { client, storage, cookies } = createLogtoSession(req.headers)
    await storage.init()

    const postLogoutRedirectUri = getSafeRedirect({
      fallbackTo: `${req.origin}/`,
      redirectTo: req.searchParams.get('redirect') || "",
    })

    client.clearAllTokens()

    const headers = new Headers({ Location: postLogoutRedirectUri })
    headers.set('Set-Cookie', logtoCookieHeader(cookies) || clearLogtoCookie())
    return new Response(null, { status: 302, headers })
  },
}