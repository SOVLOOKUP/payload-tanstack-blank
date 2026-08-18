import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_frontend/login')({
  component: LoginPage,
  head: () => ({
    meta: [{ title: 'Login' }],
  }),
})

function LoginPage() {
  return (
    <article className="pt-16 pb-24">
      <h1 className="mb-4 text-2xl font-bold">登录</h1>
      <a
        href="/api/users/logto/login?redirect=/"
        className="inline-block px-6 py-3 font-semibold text-white bg-neutral-900 rounded-md"
      >
        使用 Logto 登录
      </a>
    </article>
  )
}
