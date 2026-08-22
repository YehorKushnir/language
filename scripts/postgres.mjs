import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { connect } from 'node:net'
import { resolve } from 'node:path'

const containerName = 'language-postgres'
const volumeName = 'language-postgres-data'
const defaultDatabaseUrl =
  'postgresql://language:language@localhost:5432/language'

loadLocalEnvironment()

const action = process.argv[2]
if (action !== 'start' && action !== 'stop') {
  throw new Error('Usage: node scripts/postgres.mjs <start|stop>')
}

if (action === 'stop') {
  const engine = findContainerEngine()
  if (!containerExists(engine)) {
    console.log(`PostgreSQL container ${containerName} does not exist.`)
    process.exit(0)
  }

  run(engine, ['stop', containerName])
  console.log(`PostgreSQL container ${containerName} stopped.`)
  process.exit(0)
}

const databaseUrl = new URL(process.env.DATABASE_URL ?? defaultDatabaseUrl)
const host = databaseUrl.hostname
const port = Number(databaseUrl.port || '5432')
const username = decodeURIComponent(databaseUrl.username || 'language')
const password = decodeURIComponent(databaseUrl.password || 'language')
const database = databaseUrl.pathname.slice(1) || 'language'
const availableEngine = findContainerEngine(false)

if (await canConnect(host, port)) {
  if (availableEngine && containerExists(availableEngine)) {
    await waitForContainerDatabase(availableEngine, username, database)
  }
  console.log(`PostgreSQL is already reachable at ${host}:${port}.`)
  process.exit(0)
}

if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
  throw new Error(
    `Remote PostgreSQL at ${host}:${port} is unavailable; it will not be replaced with a local container.`,
  )
}

const engine = availableEngine ?? findContainerEngine()

if (containerExists(engine)) {
  run(engine, ['start', containerName])
} else {
  run(engine, [
    'run',
    '--detach',
    '--name',
    containerName,
    '--env',
    `POSTGRES_DB=${database}`,
    '--env',
    `POSTGRES_USER=${username}`,
    '--env',
    `POSTGRES_PASSWORD=${password}`,
    '--publish',
    `127.0.0.1:${port}:5432`,
    '--volume',
    `${volumeName}:/var/lib/postgresql/data`,
    'docker.io/library/postgres:17-alpine',
  ])
}

await waitForContainerDatabase(engine, username, database)
console.log(`PostgreSQL is ready at ${host}:${port}.`)

function findContainerEngine(required = true) {
  for (const candidate of ['docker', 'podman']) {
    const result = spawnSync(candidate, ['--version'], { stdio: 'ignore' })
    if (result.status === 0) {
      return candidate
    }
  }

  if (required) {
    throw new Error('Docker or Podman is required to start local PostgreSQL.')
  }

  return null
}

function containerExists(containerEngine) {
  return (
    spawnSync(containerEngine, ['container', 'inspect', containerName], {
      stdio: 'ignore',
    }).status === 0
  )
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`${command} ${args[0]} failed with code ${result.status}`)
  }
}

async function waitForContainerDatabase(containerEngine, username, database) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const ready = spawnSync(
      containerEngine,
      ['exec', containerName, 'pg_isready', '-U', username, '-d', database],
      { stdio: 'ignore' },
    ).status
    if (ready === 0) {
      return
    }

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000))
  }

  throw new Error(`PostgreSQL container ${containerName} did not become ready.`)
}

function canConnect(host, port) {
  return new Promise((resolveConnection) => {
    const socket = connect({ host, port })
    const finish = (connected) => {
      socket.destroy()
      resolveConnection(connected)
    }

    socket.setTimeout(500)
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    socket.once('timeout', () => finish(false))
  })
}

function loadLocalEnvironment() {
  const environmentPath = resolve(process.cwd(), '.env')
  if (!existsSync(environmentPath)) {
    return
  }

  for (const line of readFileSync(environmentPath, 'utf8').split(/\r?\n/u)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u)
    if (!match) {
      continue
    }

    const [, key, rawValue] = match
    if (key && process.env[key] === undefined) {
      process.env[key] = rawValue?.replace(/^(['"])(.*)\1$/u, '$2') ?? ''
    }
  }
}
