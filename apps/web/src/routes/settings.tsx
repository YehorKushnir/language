import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  DownloadIcon,
  SettingsIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'

import { deleteAccount, exportAccountData } from '@/api/language-api'
import { LearningPageHeader } from '@/components/learning-page-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const queryClient = useQueryClient()
  const [confirmation, setConfirmation] = useState('')
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>()

  async function downloadData() {
    setError(undefined)
    setExporting(true)
    try {
      const data = await exportAccountData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `language-data-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось выгрузить данные',
      )
    } finally {
      setExporting(false)
    }
  }

  async function removeAccount() {
    setError(undefined)
    setDeleting(true)
    try {
      await deleteAccount()
      queryClient.clear()
      window.location.assign('/')
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Не удалось удалить аккаунт',
      )
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <LearningPageHeader
        eyebrow={
          <>
            <SettingsIcon className="size-3.5" /> Аккаунт
          </>
        }
        title="Настройки"
        description="Управление персональными данными и аккаунтом."
      />

      {error ? (
        <Alert className="mt-5" variant="destructive">
          <AlertTriangleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="mt-6 grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-sm font-semibold">Выгрузить данные</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            JSON-файл с профилем, прогрессом, памятью и историей ответов.
          </p>
        </div>
        <Button
          disabled={exporting}
          onClick={downloadData}
          size="sm"
          variant="outline"
        >
          <DownloadIcon />
          {exporting ? 'Готовим…' : 'Скачать'}
        </Button>
      </section>

      <section className="mt-4 rounded-lg border border-destructive/30 bg-card p-4">
        <h2 className="text-sm font-semibold text-destructive">
          Удалить аккаунт
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
          Профиль, прогресс, расписание повторений и ответы будут удалены без
          возможности восстановления. Для подтверждения введи «УДАЛИТЬ».
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            aria-label="Подтверждение удаления"
            className="sm:max-w-64"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <Button
            disabled={confirmation !== 'УДАЛИТЬ' || deleting}
            onClick={removeAccount}
            size="sm"
            variant="destructive"
          >
            <Trash2Icon />
            {deleting ? 'Удаляем…' : 'Удалить навсегда'}
          </Button>
        </div>
      </section>
    </main>
  )
}
