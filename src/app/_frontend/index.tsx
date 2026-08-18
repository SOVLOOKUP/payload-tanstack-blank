import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_frontend/')({
  component: HomePage,
  head: () => ({
    meta: [{ title: 'Payload Website Template' }],
  }),
})

function HomePage() {
  return (
    <article className="pt-16 pb-24">
      <p className="mb-8">Hello, world!</p>
      <a href="/login">使用 Logto 登录</a>
    </article>
  )
}