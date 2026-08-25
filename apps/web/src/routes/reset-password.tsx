import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircleIcon, CheckCircle2Icon, KeyRoundIcon } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { PageShell } from '@/components/page-shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input'
import { resetPassword } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-error'

interface ResetPasswordSearch {
  token?: string
  error?: string
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const search = Route.useSearch()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const token = search.token

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    const confirmation = String(data.get('confirmation') ?? '')

    if (password !== confirmation) {
      setError('Пароли не совпадают.')
      return
    }
    if (!token) return

    setIsSubmitting(true)
    const result = await resetPassword(token, password)
    setIsSubmitting(false)

    if (result.error) {
      setError(
        authErrorMessage(
          result.error,
          'Не удалось изменить пароль. Запросите новую ссылку.',
        ),
      )
      return
    }
    setIsComplete(true)
  }

  const isInvalid = search.error === 'INVALID_TOKEN' || !token

  return (
    <AuthPageLayout>
      <Card className="w-full max-w-md shadow-sm shadow-primary/5">
        <CardHeader>
          <span className="mb-2 grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            {isComplete ? (
              <CheckCircle2Icon className="size-4.5" />
            ) : (
              <KeyRoundIcon className="size-4.5" />
            )}
          </span>
          <CardTitle as="h1" className="font-serif text-3xl">
            {isComplete
              ? 'Пароль изменён'
              : isInvalid
                ? 'Ссылка недействительна'
                : 'Новый пароль'}
          </CardTitle>
          <CardDescription>
            {isComplete
              ? 'Все прежние сессии завершены. Теперь войдите с новым паролем.'
              : isInvalid
                ? 'Ссылка устарела, уже использована или была повреждена.'
                : 'Введите новый пароль длиной не менее 8 символов.'}
          </CardDescription>
        </CardHeader>
        {isComplete ? (
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/sign-in">Войти</Link>
            </Button>
          </CardFooter>
        ) : isInvalid ? (
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Запросить новую ссылку</Link>
            </Button>
          </CardFooter>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-5">
              {error ? (
                <Alert className="motion-feedback" variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Новый пароль
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  autoFocus
                  id="password"
                  minLength={8}
                  name="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="confirmation">
                  Повторите пароль
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  id="confirmation"
                  minLength={8}
                  name="confirmation"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="mt-6">
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Сохраняем…' : 'Сохранить пароль'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </AuthPageLayout>
  )
}

function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell className="grid min-h-[calc(100dvh-3.5rem)] place-items-center py-8 sm:py-12">
      {children}
    </PageShell>
  )
}
