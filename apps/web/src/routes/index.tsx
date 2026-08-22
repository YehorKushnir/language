import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Русский → финский</p>
        <h1>Учимся строить предложения, а не угадывать карточки</h1>
        <p className="hero-copy">
          Первый вертикальный срез приложения уже заложен. Следующий шаг —
          модель курса и эталонный урок про личные местоимения и глагол olla.
        </p>
        <div className="status-card">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>Фундамент проекта</strong>
            <span>NestJS API и React-клиент готовы к предметным модулям</span>
          </div>
        </div>
      </section>
    </main>
  )
}
