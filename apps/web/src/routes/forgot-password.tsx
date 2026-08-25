import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircleIcon, KeyRoundIcon, MailCheckIcon } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-error'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setIsSubmitting(true)

    const data = new FormData(event.currentTarget)
    const result = await requestPasswordReset(
      String(data.get('email') ?? '').trim(),
    )

    setIsSubmitting(false)
    if (result.error) {
      setError(
        authErrorMessage(
          result.error,
          'Не удалось отправить письмо. Попробуйте снова.',
        ),
      )
      return
    }
    setIsSent(true)
  }

  return (
    <AuthPageLayout>
      <Card className="w-full max-w-md shadow-sm shadow-primary/5">
        <CardHeader>
          <span className="mb-2 grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            {isSent ? (
              <MailCheckIcon className="size-4.5" />
            ) : (
              <KeyRoundIcon className="size-4.5" />
            )}
          </span>
          <CardTitle as="h1" className="font-serif text-3xl">
            {isSent ? 'Проверьте почту' : 'Восстановление пароля'}
          </CardTitle>
          <CardDescription>
            {isSent
              ? 'Если аккаунт с таким email существует, мы отправили ссылку. Она действует один час.'
              : 'Укажите email аккаунта — пришлём безопасную ссылку для нового пароля.'}
          </CardDescription>
        </CardHeader>
        {isSent ? (
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/sign-in">Вернуться ко входу</Link>
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
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  autoComplete="email"
                  autoFocus
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                />
              </div>
            </CardContent>
            <CardFooter className="mt-6 grid gap-4">
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Отправляем…' : 'Получить ссылку'}
              </Button>
              <Link
                className="text-center text-sm font-medium text-primary underline"
                to="/sign-in"
              >
                Вернуться ко входу
              </Link>
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
