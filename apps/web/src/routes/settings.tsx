import type { AccountAuthMethodsResponse } from '@language/contracts'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  DatabaseIcon,
  DownloadIcon,
  KeyRoundIcon,
  LinkIcon,
  LoaderCircleIcon,
  LogOutIcon,
  SaveIcon,
  SettingsIcon,
  Trash2Icon,
  UserRoundIcon,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'

import {
  deleteAccount,
  exportAccountData,
  getAccountAuthMethods,
  setAccountPassword,
} from '@/api/language-api'
import { GoogleIcon } from '@/components/google-auth-button'
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

const authMethodsQueryKey = ['account', 'auth-methods'] as const

function SettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const authMethods = useQuery({
    queryKey: authMethodsQueryKey,
    queryFn: getAccountAuthMethods,
    enabled: Boolean(session.data?.user.id),
  })
  const [name, setName] = useState('')
  const [profilePending, setProfilePending] = useState(false)
  const [profileError, setProfileError] = useState<string>()
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordError, setPasswordError] = useState<string>()
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [googlePending, setGooglePending] = useState(false)
  const [googleError, setGoogleError] = useState<string>()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string>()
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string>()

  useEffect(() => {
    if (session.data?.user.name) setName(session.data.user.name)
  }, [session.data?.user.name])

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    if (search.get('googleLink') !== 'error') return
    const code = search.get('error') ?? undefined
    setGoogleError(
      authErrorMessage(
        code ? { code } : null,
        'Не удалось подключить Google-аккаунт.',
      ),
    )
  }, [])

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

  async function addPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(undefined)
    setPasswordSaved(false)
    const form = event.currentTarget
    const data = new FormData(form)
    const newPassword = String(data.get('newPassword') ?? '')
    const confirmation = String(data.get('passwordConfirmation') ?? '')

    if (newPassword !== confirmation) {
      setPasswordError('Пароли не совпадают.')
      return
    }

    setPasswordPending(true)
    try {
      await setAccountPassword({ newPassword })
      form.reset()
      queryClient.setQueryData<AccountAuthMethodsResponse>(
        authMethodsQueryKey,
        (current) =>
          current ? { ...current, passwordEnabled: true } : current,
      )
      setPasswordSaved(true)
    } catch (caught) {
      setPasswordError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось установить пароль.',
      )
    } finally {
      setPasswordPending(false)
    }
  }

  async function linkGoogle() {
    setGoogleError(undefined)
    setGooglePending(true)
    try {
      const result = await authClient.linkSocial({
        provider: 'google',
        callbackURL: '/settings',
        errorCallbackURL: '/settings?googleLink=error',
      })
      if (result.error) {
        setGoogleError(
          authErrorMessage(
            result.error,
            'Не удалось подключить Google-аккаунт.',
          ),
        )
      }
    } catch {
      setGoogleError(
        'Не удалось связаться с Google. Проверьте интернет и повторите.',
      )
    } finally {
      setGooglePending(false)
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

  async function downloadAccountData() {
    setExportError(undefined)
    setExporting(true)
    try {
      const exported = await exportAccountData()
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `suomi-account-data-${exported.exportedAt.slice(0, 10)}.json`
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (caught) {
      setExportError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось выгрузить данные.',
      )
    } finally {
      setExporting(false)
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
          description="Профиль, способы входа и управление аккаунтом."
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
                Вход и безопасность
              </CardTitle>
              <CardDescription>
                Управляйте способами входа в аккаунт.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <section className="grid gap-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-background shadow-xs">
                      <GoogleIcon />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">Google</h3>
                        {authMethods.data?.googleLinked ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            Подключён
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        {googleMethodDescription(authMethods)}
                      </p>
                    </div>
                  </div>
                  {!authMethods.data?.googleLinked ? (
                    <Button
                      className="shrink-0"
                      disabled={
                        authMethods.isPending ||
                        !authMethods.data?.googleAvailable ||
                        googlePending
                      }
                      onClick={() => void linkGoogle()}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {googlePending ? (
                        <LoaderCircleIcon className="animate-spin" />
                      ) : (
                        <LinkIcon />
                      )}
                      {googlePending ? 'Подключаем…' : 'Подключить'}
                    </Button>
                  ) : null}
                </div>
                {googleError ? (
                  <Alert className="motion-feedback py-2" variant="destructive">
                    <AlertTriangleIcon />
                    <AlertDescription>{googleError}</AlertDescription>
                  </Alert>
                ) : null}
                {authMethods.isError ? (
                  <Alert className="motion-feedback py-2" variant="destructive">
                    <AlertTriangleIcon />
                    <AlertDescription>
                      Не удалось загрузить способы входа.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </section>

              <section className="border-t border-border/70 pt-5">
                <h3 className="text-sm font-semibold">Пароль</h3>
                <p className="mt-1 mb-4 text-xs leading-5 text-muted-foreground">
                  {authMethods.data?.passwordEnabled
                    ? 'После смены остальные активные сессии завершатся.'
                    : 'Добавьте пароль, чтобы входить также через email.'}
                </p>

                {authMethods.isPending ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Проверяем настройки…
                  </p>
                ) : authMethods.data?.passwordEnabled ? (
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
                    <PasswordSubmitButton
                      pending={passwordPending}
                      pendingLabel="Меняем…"
                      readyLabel="Изменить пароль"
                    />
                  </form>
                ) : authMethods.data ? (
                  <form className="grid gap-4" onSubmit={addPassword}>
                    <PasswordField
                      autoComplete="new-password"
                      id="new-password"
                      label="Новый пароль"
                      name="newPassword"
                    />
                    <PasswordField
                      autoComplete="new-password"
                      id="password-confirmation"
                      label="Повторите пароль"
                      name="passwordConfirmation"
                    />
                    <InlineStatus error={passwordError} saved={passwordSaved} />
                    <PasswordSubmitButton
                      pending={passwordPending}
                      pendingLabel="Добавляем…"
                      readyLabel="Добавить пароль"
                    />
                  </form>
                ) : null}
              </section>
            </CardContent>
          </Card>
        </div>

        <section className="mt-5 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <DatabaseIcon className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Данные аккаунта</h2>
                <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                  Скачайте профиль, учебный прогресс, историю ответов и
                  расписание повторений в формате JSON.
                </p>
              </div>
            </div>
            <Button
              className="w-fit shrink-0"
              disabled={exporting}
              onClick={() => void downloadAccountData()}
              size="sm"
              type="button"
              variant="outline"
            >
              {exporting ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <DownloadIcon />
              )}
              {exporting ? 'Подготавливаем…' : 'Выгрузить данные'}
            </Button>
          </div>
          {exportError ? (
            <p className="mt-3 text-xs text-destructive" role="alert">
              {exportError}
            </p>
          ) : null}
        </section>

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

function PasswordSubmitButton({
  pending,
  pendingLabel,
  readyLabel,
}: {
  pending: boolean
  pendingLabel: string
  readyLabel: string
}) {
  return (
    <Button className="w-fit" disabled={pending} size="sm" type="submit">
      {pending ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : (
        <KeyRoundIcon />
      )}
      {pending ? pendingLabel : readyLabel}
    </Button>
  )
}

function googleMethodDescription({
  data,
  isPending,
}: {
  data?: AccountAuthMethodsResponse
  isPending: boolean
}) {
  if (isPending) return 'Проверяем подключение…'
  if (data?.googleLinked) return 'Можно входить через Google.'
  if (!data?.googleAvailable) return 'Вход через Google пока не настроен.'
  return 'Подключите аккаунт для быстрого входа.'
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
