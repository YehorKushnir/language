import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  BookOpenCheckIcon,
  BookOpenTextIcon,
  BrainIcon,
  HomeIcon,
  LanguagesIcon,
  LogOutIcon,
  ScrollTextIcon,
  SettingsIcon,
} from 'lucide-react'

import { AuthRequired } from '@/components/auth-required'
import { PageLoading } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import type { RouterContext } from '@/router-context'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <main className="mx-auto w-full max-w-4xl px-5 py-12">
      <p className="text-sm font-medium text-primary">Ошибка 404</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">
        Страница не найдена
      </h1>
      <Button asChild className="mt-8">
        <Link to="/">Вернуться на главную</Link>
      </Button>
    </main>
  ),
})

function RootLayout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const session = authClient.useSession()
  const requiresSession =
    pathname.startsWith('/lessons') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/vocabulary') ||
    pathname.startsWith('/texts') ||
    pathname.startsWith('/settings')

  async function signOut() {
    await authClient.signOut()
    queryClient.clear()
    await router.navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-5">
          <Link
            className="flex items-center gap-2 text-sm font-semibold"
            to="/"
          >
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <BookOpenTextIcon className="size-4" />
            </span>
            <span className="hidden sm:inline">Suomi</span>
          </Link>
          <div className="flex items-center gap-2">
            <nav
              className="flex items-center gap-0.5"
              aria-label="Основная навигация"
            >
              <Button asChild variant="ghost" size="sm">
                <Link
                  to="/"
                  activeOptions={{ exact: true }}
                  aria-label="Главная"
                  title="Главная"
                >
                  <HomeIcon />
                  <span className="hidden lg:inline">Главная</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/lessons" aria-label="Уроки" title="Уроки">
                  <BookOpenCheckIcon />
                  <span className="hidden lg:inline">Уроки</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/vocabulary" aria-label="Словарь" title="Словарь">
                  <LanguagesIcon />
                  <span className="hidden lg:inline">Словарь</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/texts" aria-label="Тексты" title="Тексты">
                  <ScrollTextIcon />
                  <span className="hidden lg:inline">Тексты</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/reviews" aria-label="Повторение" title="Повторение">
                  <BrainIcon />
                  <span className="hidden lg:inline">Повторение</span>
                </Link>
              </Button>
            </nav>
            {session.data ? (
              <div className="flex items-center gap-2 border-l pl-3">
                <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                  {session.data.user.name}
                </span>
                <Button asChild size="icon-sm" variant="ghost">
                  <Link aria-label="Настройки" title="Настройки" to="/settings">
                    <SettingsIcon />
                  </Link>
                </Button>
                <Button
                  aria-label="Выйти"
                  onClick={signOut}
                  size="icon-sm"
                  title="Выйти"
                  variant="ghost"
                >
                  <LogOutIcon />
                </Button>
              </div>
            ) : session.isPending ? null : (
              <div className="flex items-center gap-1 border-l pl-3">
                <Button asChild size="sm" variant="ghost">
                  <Link to="/sign-in">Войти</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex" size="sm">
                  <Link to="/sign-up">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      {requiresSession && session.isPending ? (
        <main className="mx-auto w-full max-w-4xl px-5 py-10">
          <PageLoading />
        </main>
      ) : requiresSession && !session.data ? (
        <AuthRequired />
      ) : (
        <Outlet />
      )}
    </div>
  )
}
