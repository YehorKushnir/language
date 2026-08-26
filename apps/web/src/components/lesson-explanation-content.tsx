import type { LessonExplanationScreen } from '@language/contracts'
import { AlertCircleIcon } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { localizedText } from '@/lib/localized-text'
import { cn } from '@/lib/utils'

interface LessonExplanationContentProps {
  screens: LessonExplanationScreen[]
}

export function LessonExplanationContent({
  screens,
}: LessonExplanationContentProps) {
  return (
    <article>
      <div className="grid gap-8">
        {screens.map((screen) => (
          <section
            key={screen.id}
            id={`explanation-${screen.id}`}
            className="scroll-mt-24 pt-3 first:pt-8"
          >
            <h2 className="font-serif text-xl leading-tight font-semibold sm:text-2xl">
              {localizedText(screen.title)}
            </h2>

            <div className="mt-4 grid gap-4">
              {screen.table ? <ExplanationTable screen={screen} /> : null}

              <div className="grid max-w-3xl gap-3 text-[15px] leading-6 text-foreground/85">
                {screen.paragraphs.map((paragraph, index) => (
                  <p key={index}>{localizedText(paragraph)}</p>
                ))}
              </div>

              {screen.examples?.length ? (
                <ExplanationExamples screen={screen} />
              ) : null}

              {screen.callout ? (
                <aside
                  aria-label="Важно"
                  className="flex max-w-full items-start gap-2.5 rounded-lg bg-destructive/5 py-2.5 pr-3.5 pl-4"
                >
                  <AlertCircleIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                  />
                  <p className="min-w-0 text-sm leading-5 text-foreground/85">
                    {localizedText(screen.callout)}
                  </p>
                </aside>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

function ExplanationTable({ screen }: { screen: LessonExplanationScreen }) {
  if (!screen.table) return null

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs">
      <Table>
        <TableCaption className="sr-only">
          {localizedText(screen.title)}
        </TableCaption>
        <TableHeader className="bg-muted/65">
          <TableRow className="hover:bg-muted/65">
            {screen.table.headers.map((header, index) => (
              <TableHead
                key={index}
                scope="col"
                className="h-11 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-4"
              >
                {localizedText(header)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {screen.table.rows.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="even:bg-muted/20 hover:bg-accent/35"
            >
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  className={cn(
                    'h-11 px-3 py-2.5 sm:px-4',
                    cellIndex === 0
                      ? 'font-medium text-muted-foreground'
                      : 'font-semibold text-foreground',
                  )}
                >
                  {localizedText(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ExplanationExamples({ screen }: { screen: LessonExplanationScreen }) {
  if (!screen.examples?.length) return null

  return (
    <section aria-label="Примеры" className="max-w-3xl">
      <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Примеры
      </h3>
      <div className="mt-3 grid gap-3">
        {screen.examples.map((example, index) => (
          <figure
            key={`${example.target}-${index}`}
            className="border-l-2 border-primary/45 py-0.5 pl-3.5"
          >
            <blockquote lang="fi" className="text-[15px] leading-6 font-medium">
              {example.target}
            </blockquote>
            <figcaption className="mt-0.5 text-sm leading-5 text-muted-foreground">
              {localizedText(example.source)}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
