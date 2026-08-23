import type { QueryClient } from '@tanstack/react-query'

import { authClient } from '@/lib/auth-client'

import { courseQuery } from './queries'

export async function preloadCourseRoute(
  queryClient: QueryClient,
  preloadAuthenticated?: (
    routeVersionId: string,
    queryClient: QueryClient,
  ) => Promise<unknown>,
) {
  const course = await queryClient.ensureQueryData(courseQuery)
  const routeVersionId = course.route?.id
  if (!routeVersionId || !preloadAuthenticated) return course

  const session = await authClient.getSession()
  if (session.data) {
    await preloadAuthenticated(routeVersionId, queryClient)
  }

  return course
}
