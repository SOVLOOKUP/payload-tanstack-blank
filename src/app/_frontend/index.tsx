import { getRequest } from '@tanstack/react-start/server'
import { createFileRoute } from '@tanstack/react-router'
import { getPayload } from 'payload'
import config from '@payload-config'

export const Route = createFileRoute('/_frontend/')({
  component: HomePage,
  head: () => ({
    meta: [{ title: 'Payload Website Template' }],
  }),
})

async function HomePage() {
  const request = getRequest()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: request.headers,
    canSetHeaders: false,
  })

  return (
    <article className="pt-16 pb-24">
      <p className="mb-8">Hello, world!</p>
      {user ? (
        <div>
          <p>已通过 Logto 登录：{user.email}</p>
          <a href="/api/users/logto/logout?redirect=/">退出登录</a>
        </div>
      ) : (
        <a href="/api/users/logto/login?redirect=/">使用 Logto 登录</a>
      )}
    </article>
  )
}
