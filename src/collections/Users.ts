import type { CollectionConfig } from 'payload'

import { clearLogtoCookie } from '../auth/logto'
import { logtoCallbackEndpoint, logtoLogoutEndpoint, logtoSignInEndpoint } from '../auth/logto-endpoints'
import { logtoStrategy } from '../auth/logto-strategy'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Users authenticate exclusively through Logto (OIDC). The local
    // email/password strategy is disabled entirely; `enableFields` keeps the
    // `email` field on the collection so we can still map Logto identities.
    disableLocalStrategy: {
      enableFields: true,
    },
    strategies: [logtoStrategy],
  },
  endpoints: [logtoSignInEndpoint, logtoCallbackEndpoint, logtoLogoutEndpoint],
  hooks: {
    // The Admin panel's built-in logout clears the Payload cookie, but our
    // auth relies on the Logto session cookie. Expire it here so the custom
    // strategy stops authenticating the user on the next request.
    afterLogout: [
      async ({ req }) => {
        req.responseHeaders = new Headers(req.responseHeaders)
        req.responseHeaders.set('Set-Cookie', clearLogtoCookie())
      },
    ],
  },
  fields: [
    // Email added by default
    {
      name: 'logtoSub',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
  versions: false,
}
