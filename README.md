# Payload + TanStack Start + Logto

A blank starter template with [Payload CMS](https://payloadcms.com) + [TanStack Start](https://tanstack.com/start) + [Logto](https://logto.io) OIDC authentication.

[中文文档](README.zh-CN.md)

## Features

- **Payload CMS** — Headless CMS with admin panel, REST/GraphQL APIs
- **TanStack Start** — React framework with SSR, file-based routing
- **Logto OIDC Login** — Email/password replaced with Logto SSO:
  - Custom Payload auth strategy reads Logto session cookie
  - Admin panel login via Logto (no password form)
  - Frontend login via Logto
  - Auto-creates Payload users on first Logto sign-in

## Quick Start

```bash
bun install
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL=file:./sqlite.db
PAYLOAD_SECRET=your-secret

# Logto configuration
LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_COOKIE_SECRET=at-least-32-characters-long
```

Run with bun runtime (required for lexical compatibility):

```bash
bun --bun dev
```

## Logto Setup

1. Create a **Next.js (App Router)** application in Logto Console
2. Add redirect URI: `http://localhost:3000/api/users/logto/callback`
3. Copy the endpoint, app ID, and app secret to `.env`

## Architecture

```
src/
├── auth/
│   ├── logto.ts            # Logto config, client factory, strategy, user helpers
│   └── logto-endpoints.ts  # Sign-in, callback, logout endpoints
├── collections/
│   └── Users.ts            # Users collection with Logto strategy
├── components/
│   └── admin/
│       └── LogtoLoginButton.tsx  # Admin "Login with Logto" button
├── app/
│   ├── _frontend/
│   │   ├── index.tsx       # Home page with auth status
│   │   └── login.tsx       # Login page
│   └── _payload/
│       └── ...
└── payload.config.ts
```

**Auth flow:**

1. User visits `/admin` → "Login with Logto" button → `GET /api/users/logto/login`
2. Redirects to Logto authorization page
3. Logto redirects back to `/api/users/logto/callback`
4. Callback exchanges code for tokens, finds or creates Payload user
5. Logto session cookie is set; subsequent requests authenticated via custom strategy
6. Logout: `GET /api/users/logto/logout` → clears local Logto cookie

## Known Issues

- `@lexical/react` has an ESM circular dependency that bun 1.3.x can't resolve. The `postinstall` script patches it automatically.
- Use `bun --bun dev` to run with bun runtime (avoids Node.js OOM issues).