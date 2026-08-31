import type { PreparedTextTokenResponse } from '@language/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

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
  type AudioButtonHandle,
  type AudioPlaybackProgress,
  type AudioPlaybackState,
} from '@/components/audio-button'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { TextAudioControls } from '@/components/text-audio-controls'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { localizedText } from '@/lib/localized-text'
import {
  getActiveTextPlaybackSegment,
  getTextPlaybackSegmentStartTime,
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
  const [requestedPlaybackSegment, setRequestedPlaybackSegment] = useState<
    number | null
  >(null)
  const [audioState, setAudioState] = useState<AudioPlaybackState>('idle')
  const audioRef = useRef<AudioButtonHandle>(null)
  const playbackSegments = useMemo(
    () =>
      getTextPlaybackSegments(text.data?.body ?? '', text.data?.audioSegments),
    [text.data?.audioSegments, text.data?.body],
  )

  useEffect(() => {
    setPlaybackProgress(null)
    setRequestedPlaybackSegment(null)
  }, [textId])

  if (course.isPending || text.isPending) return <PageState loading />
  if (course.isError || text.isError) {
    return <PageState message={(course.error ?? text.error)?.message} />
  }
  const textData = text.data
  const activePlaybackSegment =
    requestedPlaybackSegment ??
    (playbackProgress
      ? getActiveTextPlaybackSegment(
          playbackSegments,
          playbackProgress.currentTime,
          playbackProgress.duration,
        )
      : null)
  const handlePlaybackProgress = (progress: AudioPlaybackProgress | null) => {
    setPlaybackProgress(progress)
    setRequestedPlaybackSegment(null)
  }
  const playSentence = (segmentIndex: number) => {
    if (!textData.audioUrl) return
    const exactStartTime = getTextPlaybackSegmentStartTime(
      playbackSegments,
      segmentIndex,
    )
    audioRef.current?.playFrom(
      exactStartTime ??
        ((duration) =>
          getTextPlaybackSegmentStartTime(
            playbackSegments,
            segmentIndex,
            duration,
          ) ?? 0),
    )
    setRequestedPlaybackSegment(segmentIndex)
  }
  const currentSegmentIndex = activePlaybackSegment ?? 0

  return (
    <PageShell className="pb-36 lg:pb-28">
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
      />
      <AudioButton
        ref={audioRef}
        onPlaybackProgress={handlePlaybackProgress}
        onPlaybackStateChange={setAudioState}
        renderControl={false}
        src={textData.audioUrl}
      />

      <article className="mt-6 w-full rounded-xl bg-card px-5 py-6 shadow-xs sm:px-8 sm:py-8">
        <p className="mb-5 text-xs text-muted-foreground">
          <TextInteractionHint />
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
            onPlaySegment={playSentence}
          />
        </p>
      </article>

      <TextAudioControls
        available={Boolean(textData.audioUrl)}
        currentSegmentIndex={currentSegmentIndex}
        playbackState={audioState}
        segmentCount={playbackSegments.length}
        onNext={() =>
          playSentence(
            Math.min(currentSegmentIndex + 1, playbackSegments.length - 1),
          )
        }
        onToggle={() => {
          if (audioState === 'loading' || audioState === 'playing') {
            audioRef.current?.pause()
            return
          }
          setRequestedPlaybackSegment(currentSegmentIndex)
          audioRef.current?.play()
        }}
        onPrevious={() => playSentence(Math.max(currentSegmentIndex - 1, 0))}
      />
    </PageShell>
  )
}

export function InteractiveText({
  body,
  tokens,
  addingItemId,
  addErrorItemId,
  activePlaybackSegment,
  playbackSegments,
  onAdd,
  onPlaySegment,
}: {
  body: string
  tokens: PreparedTextTokenResponse[]
  addingItemId?: string
  addErrorItemId?: string
  activePlaybackSegment: number | null
  playbackSegments: ReturnType<typeof getTextPlaybackSegments>
  onAdd: (itemId: string) => void
  onPlaySegment: (segmentIndex: number) => void
}) {
  let cursor = 0
  let tokenIndex = 0
  const hasFinePointer = useFinePointer()
  const [openWordPosition, setOpenWordPosition] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggeredSegment = useRef<number | null>(null)
  const pointerStart = useRef({ x: 0, y: 0 })

  const clearLongPressTimer = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  useEffect(() => {
    setOpenWordPosition(null)
    longPressTriggeredSegment.current = null
    clearLongPressTimer()
  }, [body])

  useEffect(
    () => () => {
      clearLongPressTimer()
    },
    [],
  )

  return (
    <>
      {playbackSegments.map((segment, segmentIndex) => {
        const isActive = activePlaybackSegment === segmentIndex
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
                'interactive-text-sentence cursor-pointer touch-manipulation rounded-sm transition-colors duration-150',
                isActive &&
                  '-mx-0.5 box-decoration-clone bg-primary/20 px-0.5 ring-1 ring-primary/20',
              )}
              data-audio-active={isActive ? 'true' : undefined}
              data-sentence-index={segmentIndex}
              onClick={(event) => {
                if (longPressTriggeredSegment.current === segmentIndex) {
                  longPressTriggeredSegment.current = null
                  event.preventDefault()
                  return
                }
                if (
                  event.target instanceof Element &&
                  event.target.closest('[data-word-trigger]')
                ) {
                  return
                }
                setOpenWordPosition(null)
                onPlaySegment(segmentIndex)
              }}
              onContextMenu={(event) => {
                if (!hasFinePointer) event.preventDefault()
              }}
              onPointerCancel={() => {
                clearLongPressTimer()
                longPressTriggeredSegment.current = null
              }}
              onPointerDown={(event) => {
                if (hasFinePointer) return
                clearLongPressTimer()
                longPressTriggeredSegment.current = null
                pointerStart.current = {
                  x: event.clientX,
                  y: event.clientY,
                }
                longPressTimer.current = setTimeout(() => {
                  longPressTimer.current = null
                  longPressTriggeredSegment.current = segmentIndex
                  setOpenWordPosition(null)
                  onPlaySegment(segmentIndex)
                }, MOBILE_LONG_PRESS_MS)
              }}
              onPointerMove={(event) => {
                if (hasFinePointer || longPressTimer.current === null) return
                if (
                  Math.abs(event.clientX - pointerStart.current.x) >
                    MOBILE_LONG_PRESS_MOVE_TOLERANCE ||
                  Math.abs(event.clientY - pointerStart.current.y) >
                    MOBILE_LONG_PRESS_MOVE_TOLERANCE
                ) {
                  clearLongPressTimer()
                }
              }}
              onPointerUp={clearLongPressTimer}
            >
              <InteractiveTextSegment
                body={body}
                end={segment.end}
                start={segment.start}
                tokens={segmentTokens}
                addingItemId={addingItemId}
                addErrorItemId={addErrorItemId}
                hasFinePointer={hasFinePointer}
                openWordPosition={openWordPosition}
                onAdd={onAdd}
                onConsumeLongPress={() => {
                  if (longPressTriggeredSegment.current !== segmentIndex) {
                    return false
                  }
                  longPressTriggeredSegment.current = null
                  return true
                }}
                onOpenWord={(position, open) => {
                  setOpenWordPosition((currentPosition) =>
                    open
                      ? position
                      : currentPosition === position
                        ? null
                        : currentPosition,
                  )
                }}
                onPlaySegment={() => {
                  setOpenWordPosition(null)
                  onPlaySegment(segmentIndex)
                }}
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
  hasFinePointer,
  openWordPosition,
  onAdd,
  onConsumeLongPress,
  onOpenWord,
  onPlaySegment,
}: {
  body: string
  start: number
  end: number
  tokens: PreparedTextTokenResponse[]
  addingItemId?: string
  addErrorItemId?: string
  hasFinePointer: boolean
  openWordPosition: number | null
  onAdd: (itemId: string) => void
  onConsumeLongPress: () => boolean
  onOpenWord: (position: number, open: boolean) => void
  onPlaySegment: () => void
}) {
  let cursor = start

  return (
    <>
      {tokens.map((token) => {
        const before = body.slice(cursor, token.charStart)
        cursor = token.charEnd

        return (
          <Fragment key={token.position}>
            {before}
            <InteractiveWord
              adding={addingItemId === token.lexical?.itemId}
              addError={addErrorItemId === token.lexical?.itemId}
              hasFinePointer={hasFinePointer}
              open={openWordPosition === token.position}
              token={token}
              onAdd={onAdd}
              onConsumeLongPress={onConsumeLongPress}
              onOpenChange={(open) => onOpenWord(token.position, open)}
              onPlaySegment={onPlaySegment}
            />
          </Fragment>
        )
      })}
      {body.slice(cursor, end)}
    </>
  )
}

const MOBILE_LONG_PRESS_MS = 450
const MOBILE_LONG_PRESS_MOVE_TOLERANCE = 10

function InteractiveWord({
  adding,
  addError,
  hasFinePointer,
  open,
  token,
  onAdd,
  onConsumeLongPress,
  onOpenChange,
  onPlaySegment,
}: {
  adding: boolean
  addError: boolean
  hasFinePointer: boolean
  open: boolean
  token: PreparedTextTokenResponse
  onAdd: (itemId: string) => void
  onConsumeLongPress: () => boolean
  onOpenChange: (open: boolean) => void
  onPlaySegment: () => void
}) {
  const translation = localizedText(token.translation)
  const trigger = (
    <button
      type="button"
      aria-label={`${token.surface}: ${translation}`}
      data-word-trigger="true"
      className="interactive-text-word -mx-0.5 inline touch-manipulation select-none cursor-pointer rounded border-0 bg-transparent px-0.5 font-inherit text-inherit underline decoration-primary/25 decoration-1 underline-offset-4 transition-[color,background-color,text-decoration-color] duration-150 hover:decoration-primary focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      onClick={(event) => {
        event.stopPropagation()
        if (hasFinePointer) {
          onPlaySegment()
          return
        }
        event.preventDefault()
        if (onConsumeLongPress()) {
          onOpenChange(false)
          return
        }
        onOpenChange(!open)
      }}
    >
      {token.surface}
    </button>
  )
  const content = (
    <WordTooltip
      token={token}
      adding={adding}
      addError={addError}
      onAdd={onAdd}
    />
  )

  if (hasFinePointer) {
    return (
      <HoverCard closeDelay={100} openDelay={140}>
        <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[min(20rem,calc(100vw-2rem))] p-4"
          sideOffset={8}
        >
          {content}
        </HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(20rem,calc(100vw-2rem))] p-4"
        onCloseAutoFocus={(event) => event.preventDefault()}
        sideOffset={8}
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}

function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false)

  useEffect(() => {
    const media = window.matchMedia?.('(hover: hover) and (pointer: fine)')
    if (!media) return

    const update = () => setHasFinePointer(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return hasFinePointer
}

function TextInteractionHint() {
  const hasFinePointer = useFinePointer()

  return hasFinePointer
    ? 'Наведи на слово, чтобы увидеть перевод. Нажми на слово, чтобы озвучить его предложение.'
    : 'Нажми на слово, чтобы увидеть перевод. Удерживай предложение в любом месте, чтобы начать аудио с него.'
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
