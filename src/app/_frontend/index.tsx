import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_frontend/')({
  component: HomePage,
  loader: async () => {
    const { getRequest } = await import('@tanstack/react-start/server')
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    const { user } = await payload.auth({
      headers: getRequest().headers,
      canSetHeaders: false,
    })
    return { userEmail: user?.email ?? null }
  },
  head: () => ({
    meta: [{ title: 'Payload Website Template' }],
  }),
})

function HomePage() {
  const { userEmail } = Route.useLoaderData()

  return (
    <article className="pt-16 pb-24">
      <p className="mb-8">Hello, world!</p>
      {userEmail ? (
        <div>
          <p>已通过 Logto 登录：{userEmail}</p>
          <a href="/api/users/logto/logout?redirect=/">退出登录</a>
        </div>
      ) : (
        <a href="/api/users/logto/login?redirect=/">使用 Logto 登录</a>
      )}
    </article>
  )
}