import LogtoClient, { CookieStorage } from '@logto/node'
import type { AuthStrategy, Payload } from 'payload'
import type { IdTokenClaims, LogtoConfig } from '@logto/node'
import { parseCookie, stringifySetCookie } from 'cookie'

const isSecureCookie = process.env.LOGTO_COOKIE_SECURE
  ? process.env.LOGTO_COOKIE_SECURE === 'true'
  : process.env.NODE_ENV === 'production'

export const logtoConfig: LogtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || '',
  appId: process.env.LOGTO_APP_ID || '',
  appSecret: process.env.LOGTO_APP_SECRET || '',
  scopes: ['openid', 'profile', 'email'],
}

export const logtoCookieKey = `logto_${logtoConfig.appId}`

export type LogtoSession = {
  client: LogtoClient
  storage: CookieStorage
  cookies: Map<string, string>
  getNavigateUrl: () => string | undefined
}

export function logtoCookieHeader(cookies: Map<string, string>): string | undefined {
  const values = Array.from(cookies.values())
  return values.length ? values.join(', ') : undefined
}

export function clearLogtoCookie(): string {
  return stringifySetCookie({
    name: logtoCookieKey, value: '',
    httpOnly: true, path: '/', sameSite: 'lax',
    secure: isSecureCookie, maxAge: 0,
  })
}

export function createLogtoSession(headers: Headers): LogtoSession {
  const requestCookies = parseCookie(headers.get('cookie') ?? '')
  const cookies = new Map<string, string>()

  const storage = new CookieStorage({
    encryptionKey: process.env.LOGTO_COOKIE_SECRET || '',
    isSecure: isSecureCookie,
    cookieKey: logtoCookieKey,
    getCookie: (name) => requestCookies[name],
    setCookie: (name, value, options) => {
      cookies.set(name, stringifySetCookie({ name, value, ...options }))
    },
  })

  let navigateUrl: string | undefined

  const client = new LogtoClient(logtoConfig, {
    storage,
    navigate: (url) => { navigateUrl = url },
  })

  return { client, storage, cookies, getNavigateUrl: () => navigateUrl }
}

// ── Strategy ────────────────────────────────────────────────────────

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
      user: { ...user, collection: 'users' },
      ...(cookieHeader ? { responseHeaders: new Headers({ 'Set-Cookie': cookieHeader }) } : {}),
    }
  },
}

// ── User helpers ────────────────────────────────────────────────────

async function findUserByLogtoSub(payload: Payload, sub: string) {
  const result = await payload.find({
    collection: 'users',
    where: { logtoSub: { equals: sub } },
    limit: 1,
    overrideAccess: true,
  })
  return result.docs[0] || null
}

export async function findOrCreateUserByLogtoClaims(payload: Payload, claims: IdTokenClaims) {
  const existing = await findUserByLogtoSub(payload, claims.sub)
  if (existing) return existing

  const data = {
    logtoSub: claims.sub,
    email: claims.email || `${claims.sub}@users.logto`,
    name: claims.name || '',
  }

  try {
    return await payload.create({ collection: 'users', data, overrideAccess: true })
  } catch (err) {
    payload.logger.error({ err }, 'Failed to create user from Logto claims, retrying with fallback email')
    return payload.create({
      collection: 'users',
      data: { ...data, email: `${claims.sub}@users.logto` },
      overrideAccess: true,
    })
  }
}