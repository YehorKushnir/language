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
  HomeIcon,
  LanguagesIcon,
  LogOutIcon,
  ScrollTextIcon,
  SettingsIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { AuthRequired } from '@/components/auth-required'
import { PageShell } from '@/components/page-shell'
import { PageLoading } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import type { RouterContext } from '@/router-context'

const navigationItems: Array<{
  to: '/' | '/lessons' | '/vocabulary' | '/texts'
  label: string
  icon: LucideIcon
  exact?: boolean
}> = [
  { to: '/', label: 'Главная', icon: HomeIcon, exact: true },
  { to: '/lessons', label: 'Уроки', icon: BookOpenCheckIcon },
  { to: '/vocabulary', label: 'Словарь', icon: LanguagesIcon },
  { to: '/texts', label: 'Тексты', icon: ScrollTextIcon },
]

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <PageShell className="py-12">
      <p className="text-sm font-medium text-primary">Ошибка 404</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">
        Страница не найдена
      </h1>
      <Button asChild className="mt-8">
        <Link to="/">Вернуться на главную</Link>
      </Button>
    </PageShell>
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
    <div className="min-h-dvh pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
      <header
        data-app-header
        className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-5">
          <Link
            className="group flex items-center gap-2 text-sm font-semibold"
            to="/"
            aria-label="Suomi — главная"
          >
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-xs transition-transform duration-150 group-active:scale-95">
              <BookOpenTextIcon className="size-4" />
            </span>
            <span className="hidden sm:inline">Suomi</span>
          </Link>
          <div className="flex items-center gap-2">
            <nav
              className="hidden items-center gap-0.5 lg:flex"
              aria-label="Основная навигация"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button asChild key={item.to} variant="ghost" size="sm">
                    <Link
                      to={item.to}
                      activeOptions={item.exact ? { exact: true } : undefined}
                      activeProps={{
                        className: 'bg-secondary text-secondary-foreground',
                      }}
                      inactiveProps={{ className: 'text-muted-foreground' }}
                    >
                      <Icon />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
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
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Мобильная навигация"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-4 gap-1 px-2 pt-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.exact ? { exact: true } : undefined}
                activeProps={{
                  className: 'bg-secondary/75 text-primary',
                }}
                inactiveProps={{ className: 'text-muted-foreground' }}
                className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-medium transition-[color,background-color,transform] duration-150 active:scale-95"
              >
                <Icon className="size-4.5" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      {requiresSession && session.isPending ? (
        <PageShell>
          <PageLoading />
        </PageShell>
      ) : requiresSession && !session.data ? (
        <AuthRequired />
      ) : (
        <Outlet />
      )}
    </div>
  )
}
