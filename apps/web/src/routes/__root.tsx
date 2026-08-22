import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router'

import type { RouterContext } from '../router-context'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <main className="page-shell">
      <h1>Страница не найдена</h1>
      <Link to="/">Вернуться на главную</Link>
    </main>
  ),
})

function RootLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            FI
          </span>
          <span>Language Learning</span>
        </Link>
        <nav aria-label="Основная навигация">
          <Link to="/" activeOptions={{ exact: true }}>
            Главная
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
