import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { AlertCircleIcon, LogInIcon } from 'lucide-react'
import { type FormEvent, useState } from 'react'

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
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-error'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setIsSubmitting(true)

    const data = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({
      email: String(data.get('email') ?? '').trim(),
      password: String(data.get('password') ?? ''),
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(
        authErrorMessage(result.error, 'Не удалось войти. Попробуйте снова.'),
      )
      return
    }

    await router.navigate({ to: '/lessons' })
  }

  if (session.data) {
    return (
      <AuthPageLayout>
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Вы уже вошли</CardTitle>
            <CardDescription>{session.data.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/lessons">Перейти к урокам</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout>
      <Card className="w-full max-w-md shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">С возвращением</CardTitle>
          <CardDescription>
            Войдите, чтобы продолжить с сохранённого места.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-5">
            {error ? (
              <Alert variant="destructive">
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
              <Input
                autoComplete="current-password"
                id="password"
                minLength={8}
                name="password"
                required
                type="password"
              />
            </div>
          </CardContent>
          <CardFooter className="mt-6 grid gap-4">
            <Button className="w-full" disabled={isSubmitting} type="submit">
              <LogInIcon />
              {isSubmitting ? 'Входим…' : 'Войти'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{' '}
              <Link
                className="font-medium text-primary underline"
                to="/sign-up"
              >
                Зарегистрироваться
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
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl place-items-center px-5 py-12">
      {children}
    </main>
  )
}
