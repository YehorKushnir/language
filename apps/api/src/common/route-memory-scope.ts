import { ContentStatus, KnowledgeItemKind } from '@language/database'

export function createRouteMemoryScope(
  userId: string,
  routeVersionId: string,
  kind?: KnowledgeItemKind,
) {
  return {
    userId,
    item: {
      ...(kind ? { kind } : {}),
      OR: [
        {
          lessonItems: {
            some: {
              lesson: {
                status: ContentStatus.CURATED,
                routeEntries: { some: { routeVersionId } },
              },
            },
          },
        },
        {
          textItems: {
            some: {
              text: {
                status: ContentStatus.CURATED,
                course: {
                  routeVersions: {
                    some: { id: routeVersionId, status: ContentStatus.CURATED },
                  },
                },
              },
            },
          },
        },
      ],
    },
  }
}
