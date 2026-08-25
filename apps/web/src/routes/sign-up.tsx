import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { AlertCircleIcon, UserPlusIcon } from 'lucide-react'
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
import { PasswordInput } from '@/components/ui/password-input'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-error'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setIsSubmitting(true)

    try {
      const data = new FormData(event.currentTarget)
      const result = await authClient.signUp.email({
        email: String(data.get('email') ?? '').trim(),
        name: String(data.get('name') ?? '').trim(),
        password: String(data.get('password') ?? ''),
      })

      if (result.error) {
        setError(
          authErrorMessage(
            result.error,
            'Не удалось создать аккаунт. Попробуйте снова.',
          ),
        )
        return
      }

      await router.navigate({ to: '/lessons' })
    } catch {
      setError(
        authErrorMessage(
          { code: 'NETWORK_ERROR' },
          'Не удалось создать аккаунт. Попробуйте снова.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (session.data) {
    return (
      <AuthPageLayout>
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle as="h1" className="font-serif text-3xl">
              Аккаунт готов
            </CardTitle>
            <CardDescription>{session.data.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/lessons">Начать обучение</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout>
      <Card className="w-full max-w-md shadow-sm shadow-primary/5">
        <CardHeader>
          <span className="mb-2 grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <UserPlusIcon className="size-4.5" />
          </span>
          <CardTitle as="h1" className="font-serif text-3xl">
            Создать аккаунт
          </CardTitle>
          <CardDescription>
            Прогресс и интервальные повторения будут доступны на любом
            устройстве.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-5">
            {error ? (
              <Alert className="motion-feedback" variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="name">
                Имя
              </label>
              <Input
                autoComplete="name"
                id="name"
                minLength={2}
                name="name"
                placeholder="Как к вам обращаться"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="password">
                Пароль
              </label>
              <PasswordInput
                aria-describedby="password-hint"
                autoComplete="new-password"
                id="password"
                minLength={8}
                name="password"
                required
              />
              <p className="text-xs text-muted-foreground" id="password-hint">
                Минимум 8 символов.
              </p>
            </div>
          </CardContent>
          <CardFooter className="mt-6 grid gap-4">
            <Button className="w-full" disabled={isSubmitting} type="submit">
              <UserPlusIcon />
              {isSubmitting ? 'Создаём…' : 'Создать аккаунт'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link
                className="font-medium text-primary underline"
                to="/sign-in"
              >
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
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
