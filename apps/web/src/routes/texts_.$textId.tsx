import type { PreparedTextTokenResponse } from '@language/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { addVocabularyItem } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  preparedTextQuery,
  preparedTextsQuery,
  userVocabularyQuery,
} from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import {
  AudioButton,
  type AudioPlaybackProgress,
} from '@/components/audio-button'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { localizedText } from '@/lib/localized-text'
import {
  getActiveTextPlaybackSegment,
  getTextPlaybackSegments,
} from '@/lib/text-playback'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/texts_/$textId')({
  loader: ({ context, params }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(
        preparedTextQuery(routeVersionId, params.textId),
      ),
    ),
  component: PreparedTextPage,
})

function PreparedTextPage() {
  const { textId } = Route.useParams()
  const queryClient = useQueryClient()
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const text = useQuery({
    ...preparedTextQuery(routeVersionId, textId),
    enabled: Boolean(routeVersionId),
  })
  const addWord = useMutation({
    mutationFn: (itemId: string) => addVocabularyItem(routeVersionId, itemId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: preparedTextQuery(routeVersionId, textId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: preparedTextsQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: userVocabularyQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: courseProgressQuery(routeVersionId).queryKey,
        }),
      ])
    },
  })
  const [playbackProgress, setPlaybackProgress] =
    useState<AudioPlaybackProgress | null>(null)
  const playbackSegments = useMemo(
    () => getTextPlaybackSegments(text.data?.body ?? ''),
    [text.data?.body],
  )

  useEffect(() => setPlaybackProgress(null), [textId])

  if (course.isPending || text.isPending) return <PageState loading />
  if (course.isError || text.isError) {
    return <PageState message={(course.error ?? text.error)?.message} />
  }
  const textData = text.data
  const activePlaybackSegment = playbackProgress
    ? getActiveTextPlaybackSegment(
        playbackSegments,
        playbackProgress.currentTime,
        playbackProgress.duration,
      )
    : null

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow={
          <Link
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            to="/texts"
          >
            <ArrowLeftIcon className="size-3.5" /> Все тексты
          </Link>
        }
        title={localizedText(textData.title)}
        description={`${textData.level} · ${textData.wordCount} слов · ${textData.knownPercent}% знакомых`}
        aside={
          <div className="flex w-full gap-2">
            <AudioButton
              className="flex-1"
              label="Обычная"
              onPlaybackProgress={setPlaybackProgress}
              src={textData.audioUrl}
            />
            <AudioButton
              className="flex-1"
              label="Медленно"
              onPlaybackProgress={setPlaybackProgress}
              playbackRate={0.85}
              src={textData.audioUrl}
            />
          </div>
        }
      />

      <article className="mt-6 w-full rounded-xl bg-card px-5 py-6 shadow-xs sm:px-8 sm:py-8">
        <p className="mb-5 text-xs text-muted-foreground">
          Нажми на слово, чтобы увидеть перевод и разбор.
        </p>
        <p className="whitespace-pre-wrap font-serif text-xl leading-[2.05] sm:text-[1.65rem]">
          <InteractiveText
            body={textData.body}
            tokens={textData.tokens}
            addingItemId={addWord.isPending ? addWord.variables : undefined}
            addErrorItemId={addWord.isError ? addWord.variables : undefined}
            activePlaybackSegment={activePlaybackSegment}
            playbackSegments={playbackSegments}
            onAdd={(itemId) => addWord.mutate(itemId)}
          />
        </p>
      </article>
    </PageShell>
  )
}

function InteractiveText({
  body,
  tokens,
  addingItemId,
  addErrorItemId,
  activePlaybackSegment,
  playbackSegments,
  onAdd,
}: {
  body: string
  tokens: PreparedTextTokenResponse[]
  addingItemId?: string
  addErrorItemId?: string
  activePlaybackSegment: number | null
  playbackSegments: ReturnType<typeof getTextPlaybackSegments>
  onAdd: (itemId: string) => void
}) {
  let cursor = 0
  let tokenIndex = 0

  return (
    <>
      {playbackSegments.map((segment, segmentIndex) => {
        const before = body.slice(cursor, segment.start)
        const segmentTokens: PreparedTextTokenResponse[] = []
        while (
          tokenIndex < tokens.length &&
          (tokens[tokenIndex]?.charStart ?? body.length) < segment.end
        ) {
          const token = tokens[tokenIndex]
          if (token && token.charEnd > segment.start) segmentTokens.push(token)
          tokenIndex += 1
        }
        cursor = segment.end

        return (
          <Fragment key={segment.start}>
            {before}
            <span
              className={cn(
                'rounded-sm transition-colors duration-150',
                activePlaybackSegment === segmentIndex &&
                  '-mx-0.5 box-decoration-clone bg-primary/15 px-0.5',
              )}
              data-audio-active={
                activePlaybackSegment === segmentIndex ? 'true' : undefined
              }
            >
              <InteractiveTextSegment
                body={body}
                end={segment.end}
                start={segment.start}
                tokens={segmentTokens}
                addingItemId={addingItemId}
                addErrorItemId={addErrorItemId}
                onAdd={onAdd}
              />
            </span>
          </Fragment>
        )
      })}
      {body.slice(cursor)}
    </>
  )
}

function InteractiveTextSegment({
  body,
  start,
  end,
  tokens,
  addingItemId,
  addErrorItemId,
  onAdd,
}: {
  body: string
  start: number
  end: number
  tokens: PreparedTextTokenResponse[]
  addingItemId?: string
  addErrorItemId?: string
  onAdd: (itemId: string) => void
}) {
  let cursor = start

  return (
    <>
      {tokens.map((token) => {
        const before = body.slice(cursor, token.charStart)
        cursor = token.charEnd
        const translation = localizedText(token.translation)

        return (
          <Fragment key={token.position}>
            {before}
            <HoverCard closeDelay={100} openDelay={140}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label={`${token.surface}: ${translation}`}
                  className="-mx-0.5 inline cursor-help rounded border-0 bg-transparent px-0.5 font-inherit text-inherit underline decoration-primary/25 decoration-1 underline-offset-4 transition-[color,background-color,text-decoration-color] duration-150 hover:bg-accent hover:decoration-primary focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {token.surface}
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                className="w-[min(20rem,calc(100vw-2rem))] p-4"
                sideOffset={8}
              >
                <WordTooltip
                  token={token}
                  adding={addingItemId === token.lexical?.itemId}
                  addError={addErrorItemId === token.lexical?.itemId}
                  onAdd={onAdd}
                />
              </HoverCardContent>
            </HoverCard>
          </Fragment>
        )
      })}
      {body.slice(cursor, end)}
    </>
  )
}

function WordTooltip({
  token,
  adding,
  addError,
  onAdd,
}: {
  token: PreparedTextTokenResponse
  adding: boolean
  addError: boolean
  onAdd: (itemId: string) => void
}) {
  const inLearning = Boolean(token.lexical?.memory.dueAt)
  const baseFormLabel =
    token.dictionary.partOfSpeech === 'verb' ? 'Инфинитив' : 'Начальная форма'

  return (
    <div>
      <p className="text-base leading-snug font-medium">
        {localizedText(token.translation)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {baseFormLabel}: <span className="font-medium">{token.lemma}</span>
      </p>
      <Button
        className="mt-4 w-full"
        disabled={!token.lexical || adding || inLearning}
        onClick={() => token.lexical && onAdd(token.lexical.itemId)}
        size="sm"
        variant="outline"
      >
        {!token.lexical
          ? 'Слово недоступно'
          : inLearning
            ? 'Уже изучается'
            : adding
              ? 'Добавляем…'
              : 'Добавить в изучаемое'}
      </Button>
      {addError || inLearning ? (
        <p
          aria-live="polite"
          className={`mt-2 text-xs ${
            addError ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {addError
            ? 'Не удалось добавить слово. Попробуйте ещё раз.'
            : 'Слово сохранено в вашем словаре.'}
        </p>
      ) : null}
    </div>
  )
}

function PageState({
  loading = false,
  message,
}: {
  loading?: boolean
  message?: string
}) {
  return (
    <PageShell>
      {loading ? <PageLoading /> : <QueryError message={message} />}
    </PageShell>
  )
}
