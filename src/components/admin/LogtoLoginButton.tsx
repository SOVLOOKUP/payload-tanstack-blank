import type { ServerProps } from 'payload'
import React from 'react'

import './LogtoLoginButton.scss'

export default function LogtoLoginButton({ searchParams }: Pick<ServerProps, 'searchParams'>) {
  const redirect =
    typeof searchParams?.redirect === 'string' ? searchParams.redirect : '/admin'

  return (
    <a
      href={`/api/users/logto/login?redirect=${encodeURIComponent(redirect)}`}
      className="logto-login-button"
    >
      使用 Logto 登录
    </a>
  )
}
