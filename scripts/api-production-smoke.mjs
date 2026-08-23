import { once } from 'node:events'
import { spawn } from 'node:child_process'

const port = Number(process.env.SMOKE_API_PORT ?? 3310)
const origin = `http://127.0.0.1:${port}`
const logs = []
const child = spawn(process.execPath, ['apps/api/dist/main.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'production',
    API_HOST: '127.0.0.1',
    API_PORT: String(port),
    WEB_ORIGIN: 'https://learn.example.test',
    BETTER_AUTH_URL: 'https://api.example.test',
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ??
      'production-smoke-secret-with-at-least-32-characters',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})

for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    logs.push(String(chunk))
    if (logs.length > 100) logs.shift()
  })
}

try {
  const health = await waitForResponse('/api/v1/health')
  assert(health.status === 200, `health returned ${health.status}`)
  assert(
    health.headers.get('x-request-id') === 'production-smoke',
    'request id was not propagated',
  )
  assert(
    health.headers.get('x-content-type-options') === 'nosniff',
    'Helmet headers are missing',
  )
  const healthBody = await health.json()
  assert(
    healthBody.status === 'ok' &&
      healthBody.database === 'ok' &&
      healthBody.morphology === 'ok',
    'readiness payload is invalid',
  )

  const unauthorized = await request('/api/v1/me/data-export')
  assert(
    unauthorized.status === 401,
    `protected endpoint returned ${unauthorized.status}`,
  )
  const unauthorizedBody = await unauthorized.json()
  assert(
    unauthorizedBody.requestId === 'production-smoke',
    'error response has no request id',
  )

  const docs = await request('/docs')
  assert(docs.status === 404, `Swagger is exposed with status ${docs.status}`)

  let rateLimited = false
  for (let index = 0; index < 125; index += 1) {
    const response = await request('/api/v1')
    if (response.status === 429) {
      rateLimited = true
      break
    }
  }
  assert(rateLimited, 'global API rate limiting is not active')

  process.stdout.write(
    'Production API smoke passed: readiness, PostgreSQL, morphology, security headers, auth guard, rate limiting and hidden Swagger\n',
  )
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack : error}\n`)
  process.stderr.write(logs.join('').slice(-12_000))
  process.exitCode = 1
} finally {
  await stopChild()
}

async function waitForResponse(pathname) {
  const deadline = Date.now() + 20_000
  let lastError
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`API exited before becoming ready (${child.exitCode})`)
    }
    try {
      return await request(pathname)
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  throw new Error(`API did not become ready: ${String(lastError)}`)
}

function request(pathname) {
  return fetch(`${origin}${pathname}`, {
    headers: { 'x-request-id': 'production-smoke' },
    signal: AbortSignal.timeout(5_000),
  })
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function stopChild() {
  if (child.exitCode !== null) return
  child.kill('SIGTERM')
  const forced = setTimeout(() => child.kill('SIGKILL'), 5_000)
  forced.unref()
  await once(child, 'exit')
  clearTimeout(forced)
}
