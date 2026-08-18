# Payload + TanStack Start + Logto

A blank starter template with [Payload CMS](https://payloadcms.com) + [TanStack Start](https://tanstack.com/start) + [Logto](https://logto.io) OIDC authentication.

---

[English](#english) | [中文](#中文)

---

## English

### Features

- **Payload CMS** — Headless CMS with admin panel, REST/GraphQL APIs
- **TanStack Start** — React framework with SSR, file-based routing
- **Logto OIDC Login** — Email/password replaced with Logto SSO:
  - Custom Payload auth strategy reads Logto session cookie
  - Admin panel login via Logto (no password form)
  - Frontend login via Logto
  - Auto-creates Payload users on first Logto sign-in

### Quick Start

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

### Logto Setup

1. Create a **Next.js (App Router)** application in Logto Console
2. Add redirect URI: `http://localhost:3000/api/users/logto/callback`
3. Copy the endpoint, app ID, and app secret to `.env`

### Architecture

```
src/
├── auth/
│   ├── logto.ts            # Logto config, client factory, strategy, user helpers
│   └── logto-endpoints.ts  # Sign-in, callback, logout endpoints
├── collections/
│   └── Users.ts            # Users collection with Logto strategy
├── components/
│   └── admin/
│       └── LogtoLoginButton.tsx  # Admin login "Login with Logto" button
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

### Known Issues

- The `@lexical/react` package has an ESM circular dependency that bun 1.3.x can't resolve. A `postinstall` script patches it automatically.
- Use `bun --bun dev` to run with bun runtime (avoids Node.js OOM issues).

---

## 中文

### 特性

- **Payload CMS** — 无头 CMS，内置管理后台、REST/GraphQL API
- **TanStack Start** — React 框架，支持 SSR、文件路由
- **Logto OIDC 登录** — 完全替换邮箱/密码认证：
  - 自定义 Payload 认证策略读取 Logto 会话 cookie
  - 管理后台通过 Logto 登录（无密码表单）
  - 前端页面通过 Logto 登录
  - 首次 Logto 登录自动创建 Payload 用户

### 快速开始

```bash
bun install
cp .env.example .env
```

填写 `.env`：

```env
DATABASE_URL=file:./sqlite.db
PAYLOAD_SECRET=your-secret

# Logto 配置
LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_COOKIE_SECRET=至少32位字符
```

使用 bun 运行时启动（解决 lexical 兼容性问题）：

```bash
bun --bun dev
```

### Logto 配置

1. 在 Logto 控制台创建 **Next.js (App Router)** 应用
2. 添加回调 URI：`http://localhost:3000/api/users/logto/callback`
3. 将 endpoint、app ID、app secret 填入 `.env`

### 架构

```
src/
├── auth/
│   ├── logto.ts            # Logto 配置、客户端工厂、认证策略、用户操作
│   └── logto-endpoints.ts  # 登录、回调、登出端点
├── collections/
│   └── Users.ts            # 用户集合，集成 Logto 策略
├── components/
│   └── admin/
│       └── LogtoLoginButton.tsx  # 管理后台"使用 Logto 登录"按钮
├── app/
│   ├── _frontend/
│   │   ├── index.tsx       # 首页，显示登录状态
│   │   └── login.tsx       # 登录页
│   └── _payload/
│       └── ...
└── payload.config.ts
```

**认证流程：**

1. 用户访问 `/admin` → 点击"使用 Logto 登录" → `GET /api/users/logto/login`
2. 跳转到 Logto 授权页面
3. Logto 回调到 `/api/users/logto/callback`
4. 回调交换 code 获取令牌，查找或创建 Payload 用户
5. 设置 Logto 会话 cookie，后续请求通过自定义策略认证
6. 登出：`GET /api/users/logto/logout` → 清除本地 Logto cookie

### 已知问题

- `@lexical/react` 存在 ESM 循环依赖，bun 1.3.x 无法处理。`postinstall` 脚本会自动 patch。
- 使用 `bun --bun dev` 启动（避免 Node.js OOM 问题）。