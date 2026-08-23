import { Link } from '@tanstack/react-router'
import { LockKeyholeIcon } from 'lucide-react'

import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function AuthRequired() {
  return (
    <PageShell className="grid min-h-[calc(100vh-4rem)] place-items-center py-16">
      <Card className="w-full max-w-lg text-center shadow-lg shadow-primary/5">
        <CardHeader>
          <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <LockKeyholeIcon className="size-5" />
          </span>
          <CardTitle className="font-serif text-3xl">
            Войдите в аккаунт
          </CardTitle>
          <CardDescription className="text-base">
            Сессия нужна, чтобы сохранять прогресс, ответы и расписание
            повторений.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/sign-in">Войти</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/sign-up">Создать аккаунт</Link>
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
