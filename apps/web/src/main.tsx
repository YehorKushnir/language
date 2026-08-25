import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { installClientErrorReporting } from './lib/client-telemetry'
import { routeTree } from './routeTree.gen'
import './styles.css'

installClientErrorReporting()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

const router = createRouter({
  routeTree,
  defaultPreload: 'viewport',
  defaultPreloadDelay: 0,
  // React Query owns data freshness; keep a visible link's route preload hot
  // inside the default five-minute query cache window.
  defaultPreloadStaleTime: 4 * 60_000,
  defaultViewTransition: false,
  scrollRestoration: true,
  scrollRestorationBehavior: 'instant',
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
