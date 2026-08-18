import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

type User = { email: string; id: string }

export const Route = createFileRoute('/_frontend/')({
  component: HomePage,
  head: () => ({
    meta: [{ title: 'Payload Website Template' }],
  }),
})

function HomePage() {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((json) => setUser(json.user ?? null))
      .catch(() => setUser(null))
  }, [])

  return (
    <article className="pt-16 pb-24">
      <p className="mb-8">Hello, world!</p>
      {user === undefined ? (
        <p>加载中...</p>
      ) : user ? (
        <div>
          <p>已通过 Logto 登录：{user.email}</p>
          <a href="/api/users/logto/logout?redirect=/">退出登录</a>
        </div>
      ) : (
        <a href="/login">使用 Logto 登录</a>
      )}
    </article>
  )
}