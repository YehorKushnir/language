import { AlertCircleIcon, RotateCcwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PageLoading() {
  return (
    <div className="grid gap-4" aria-label="Загрузка">
      <Skeleton className="h-10 w-3/5" />
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="mt-4 h-44 w-full rounded-xl" />
    </div>
  )
}

export function QueryError({ message }: { message?: string }) {
  return (
    <Card className="bg-destructive/5">
      <CardContent className="flex items-start gap-3 text-sm">
        <AlertCircleIcon className="mt-0.5 size-4 text-destructive" />
        <div>
          <p className="font-medium">Не удалось загрузить данные</p>
          <p className="mt-1 text-muted-foreground">
            {message ?? 'Убедитесь, что API и PostgreSQL запущены.'}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RotateCcwIcon /> Повторить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
