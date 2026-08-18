# Payload + TanStack Start + Logto

[Payload CMS](https://payloadcms.com) + [TanStack Start](https://tanstack.com/start) + [Logto](https://logto.io) OIDC 登录的空白启动模板。

[English](README.md)

## 特性

- **Payload CMS** — 无头 CMS，内置管理后台、REST/GraphQL API
- **TanStack Start** — React 框架，支持 SSR、文件路由
- **Logto OIDC 登录** — 完全替换邮箱/密码认证：
  - 自定义 Payload 认证策略读取 Logto 会话 cookie
  - 管理后台通过 Logto 登录（无密码表单）
  - 前端页面通过 Logto 登录
  - 首次 Logto 登录自动创建 Payload 用户

## 快速开始

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

## Logto 配置

1. 在 Logto 控制台创建 **Next.js (App Router)** 应用
2. 添加回调 URI：`http://localhost:3000/api/users/logto/callback`
3. 将 endpoint、app ID、app secret 填入 `.env`

## 架构

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

## 已知问题

- `@lexical/react` 存在 ESM 循环依赖，bun 1.3.x 无法处理。`postinstall` 脚本会自动 patch。
- 使用 `bun --bun dev` 启动（避免 Node.js OOM 问题）。