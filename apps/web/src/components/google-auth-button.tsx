import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-error'

export function GoogleAuthButton({
  errorCallbackURL,
  label,
  onError,
}: {
  errorCallbackURL: '/sign-in' | '/sign-up'
  label: string
  onError: (message: string) => void
}) {
  const [isPending, setIsPending] = useState(false)

  async function handleGoogleAuth() {
    onError('')
    setIsPending(true)
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/lessons',
        errorCallbackURL,
      })
      if (result.error) {
        onError(
          authErrorMessage(
            result.error,
            'Не удалось войти через Google. Попробуйте снова.',
          ),
        )
      }
    } catch {
      onError('Не удалось связаться с Google. Проверьте интернет и повторите.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="grid gap-4">
      <Button
        className="w-full bg-card"
        disabled={isPending}
        onClick={() => void handleGoogleAuth()}
        type="button"
        variant="outline"
      >
        <GoogleIcon />
        {isPending ? 'Переходим в Google…' : label}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>или через email</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.8 0 5.1-.9 6.8-2.5l-3.3-2.6c-.9.6-2.1 1-3.5 1a6 6 0 0 1-5.7-4.1H2.9v2.7A10.3 10.3 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.3 13.8A6 6 0 0 1 6 12c0-.6.1-1.2.3-1.8V7.5H2.9A10 10 0 0 0 1.8 12c0 1.6.4 3.1 1.1 4.5l3.4-2.7Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.1c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0 0 2.9 7.5l3.4 2.7A6 6 0 0 1 12 6.1Z"
        fill="#EA4335"
      />
    </svg>
  )
}
