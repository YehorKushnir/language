import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  LogOutIcon,
  SaveIcon,
  SettingsIcon,
  Trash2Icon,
  UserRoundIcon,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'

import { deleteAccount } from '@/api/language-api'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from '@/lib/auth-error'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const [name, setName] = useState('')
  const [profilePending, setProfilePending] = useState(false)
  const [profileError, setProfileError] = useState<string>()
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordError, setPasswordError] = useState<string>()
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string>()

  useEffect(() => {
    if (session.data?.user.name) setName(session.data.user.name)
  }, [session.data?.user.name])

  async function updateName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = name.trim()
    setProfileError(undefined)
    setProfileSaved(false)

    if (nextName.length < 2) {
      setProfileError('Имя должно содержать не менее двух символов.')
      return
    }

    setProfilePending(true)
    try {
      const result = await authClient.updateUser({ name: nextName })
      if (result.error) {
        setProfileError(
          authErrorMessage(result.error, 'Не удалось сохранить имя.'),
        )
        return
      }
      setName(nextName)
      setProfileSaved(true)
    } catch {
      setProfileError('Не удалось сохранить имя. Проверьте соединение.')
    } finally {
      setProfilePending(false)
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(undefined)
    setPasswordSaved(false)
    const form = event.currentTarget
    const data = new FormData(form)
    const currentPassword = String(data.get('currentPassword') ?? '')
    const newPassword = String(data.get('newPassword') ?? '')
    const confirmation = String(data.get('passwordConfirmation') ?? '')

    if (newPassword !== confirmation) {
      setPasswordError('Новые пароли не совпадают.')
      return
    }
    if (currentPassword === newPassword) {
      setPasswordError('Новый пароль должен отличаться от текущего.')
      return
    }

    setPasswordPending(true)
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (result.error) {
        setPasswordError(
          authErrorMessage(result.error, 'Не удалось изменить пароль.'),
        )
        return
      }
      form.reset()
      setPasswordSaved(true)
    } catch {
      setPasswordError('Не удалось изменить пароль. Проверьте соединение.')
    } finally {
      setPasswordPending(false)
    }
  }

  async function removeAccount() {
    setDeleteError(undefined)
    setDeleting(true)
    try {
      await deleteAccount()
      queryClient.clear()
      window.location.assign('/')
    } catch (caught) {
      setDeleteError(
        caught instanceof Error ? caught.message : 'Не удалось удалить аккаунт',
      )
      setDeleting(false)
    }
  }

  async function signOut() {
    setSignOutError(undefined)
    setSigningOut(true)
    try {
      const result = await authClient.signOut()
      if (result.error) {
        setSignOutError('Не удалось выйти. Попробуйте ещё раз.')
        return
      }
      queryClient.clear()
      await router.navigate({ to: '/' })
    } catch {
      setSignOutError('Не удалось выйти. Проверьте соединение.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl">
        <LearningPageHeader
          eyebrow={
            <>
              <SettingsIcon className="size-3.5" /> Аккаунт
            </>
          }
          title="Настройки"
          description="Профиль, пароль и управление аккаунтом."
        />

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
          <Card className="shadow-xs">
            <CardHeader>
              <span className="mb-1 grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <UserRoundIcon className="size-4" />
              </span>
              <CardTitle as="h2" className="font-serif text-2xl">
                Профиль
              </CardTitle>
              <CardDescription>
                {session.data?.user.email ?? 'Ваш аккаунт'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={updateName}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="profile-name">
                    Имя
                  </label>
                  <Input
                    autoComplete="name"
                    id="profile-name"
                    maxLength={80}
                    minLength={2}
                    onChange={(event) => setName(event.target.value)}
                    required
                    value={name}
                  />
                </div>
                <InlineStatus error={profileError} saved={profileSaved} />
                <Button
                  className="w-fit"
                  disabled={
                    profilePending ||
                    !name.trim() ||
                    name.trim() === session.data?.user.name
                  }
                  size="sm"
                  type="submit"
                >
                  {profilePending ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <SaveIcon />
                  )}
                  {profilePending ? 'Сохраняем…' : 'Сохранить имя'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <span className="mb-1 grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <KeyRoundIcon className="size-4" />
              </span>
              <CardTitle as="h2" className="font-serif text-2xl">
                Пароль
              </CardTitle>
              <CardDescription>
                После смены остальные активные сессии завершатся.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={changePassword}>
                <PasswordField
                  autoComplete="current-password"
                  id="current-password"
                  label="Текущий пароль"
                  name="currentPassword"
                />
                <PasswordField
                  autoComplete="new-password"
                  id="new-password"
                  label="Новый пароль"
                  name="newPassword"
                />
                <PasswordField
                  autoComplete="new-password"
                  id="password-confirmation"
                  label="Повторите новый пароль"
                  name="passwordConfirmation"
                />
                <InlineStatus error={passwordError} saved={passwordSaved} />
                <Button
                  className="w-fit"
                  disabled={passwordPending}
                  size="sm"
                  type="submit"
                >
                  {passwordPending ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <KeyRoundIcon />
                  )}
                  {passwordPending ? 'Меняем…' : 'Изменить пароль'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <section className="mt-5 rounded-lg border border-border/70 bg-card px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Текущий сеанс</h2>
              <p className="truncate text-xs text-muted-foreground">
                {session.data?.user.email}
              </p>
            </div>
            <Button
              className="w-fit text-muted-foreground"
              disabled={signingOut}
              onClick={() => void signOut()}
              size="sm"
              variant="ghost"
            >
              {signingOut ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <LogOutIcon />
              )}
              {signingOut ? 'Выходим…' : 'Выйти'}
            </Button>
          </div>
          {signOutError ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {signOutError}
            </p>
          ) : null}
        </section>

        <details className="group mt-8 border-t border-border/70 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            Дополнительные действия
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <section className="motion-detail mt-3 rounded-lg border border-destructive/20 bg-destructive/[0.025] p-4">
            <h2 className="text-sm font-semibold text-destructive">
              Удалить аккаунт
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              Профиль, прогресс, расписание повторений и ответы будут удалены
              без возможности восстановления. Для подтверждения введите
              «УДАЛИТЬ».
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="Подтверждение удаления"
                className="sm:max-w-64"
                placeholder="Введите УДАЛИТЬ"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <Button
                disabled={confirmation !== 'УДАЛИТЬ' || deleting}
                onClick={() => void removeAccount()}
                size="sm"
                variant="destructive"
              >
                <Trash2Icon />
                {deleting ? 'Удаляем…' : 'Удалить навсегда'}
              </Button>
            </div>
            {deleteError ? (
              <p className="mt-3 text-xs text-destructive" role="alert">
                {deleteError}
              </p>
            ) : null}
          </section>
        </details>
      </div>
    </PageShell>
  )
}

function PasswordField({
  autoComplete,
  id,
  label,
  name,
}: {
  autoComplete: 'current-password' | 'new-password'
  id: string
  label: string
  name: string
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <PasswordInput
        autoComplete={autoComplete}
        id={id}
        minLength={8}
        name={name}
        required
      />
    </div>
  )
}

function InlineStatus({ error, saved }: { error?: string; saved: boolean }) {
  if (error) {
    return (
      <Alert className="motion-feedback py-2" variant="destructive">
        <AlertTriangleIcon />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  if (saved) {
    return (
      <p
        aria-live="polite"
        className="motion-feedback flex items-center gap-2 text-sm text-primary"
      >
        <CheckCircle2Icon className="size-4" /> Сохранено
      </p>
    )
  }
  return null
}
