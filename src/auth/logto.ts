import LogtoClient from '@logto/node'
import { CookieStorage } from '@logto/node'
import type { LogtoConfig } from '@logto/node'
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
  return stringifySetCookie(logtoCookieKey, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: isSecureCookie,
    maxAge: 0,
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
      cookies.set(name, stringifySetCookie(name, value, options))
    },
  })

  let navigateUrl: string | undefined

  const client = new LogtoClient(logtoConfig, {
    storage,
    navigate: (url) => {
      navigateUrl = url
    },
  })

  return {
    client,
    storage,
    cookies,
    getNavigateUrl: () => navigateUrl,
  }
}
