import { defineConfig, devices } from '@playwright/test'

const apiPort = 3311
const webPort = 4173
const webOrigin = `http://127.0.0.1:${webPort}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: webOrigin,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: [
        'NODE_ENV=test',
        'API_HOST=127.0.0.1',
        `API_PORT=${apiPort}`,
        `WEB_ORIGIN=${webOrigin}`,
        `BETTER_AUTH_URL=http://127.0.0.1:${apiPort}`,
        'node apps/api/dist/main.js',
      ].join(' '),
      url: `http://127.0.0.1:${apiPort}/api/v1/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: `API_PROXY_TARGET=http://127.0.0.1:${apiPort} pnpm --filter @language/web preview -- --host 127.0.0.1 --port ${webPort}`,
      url: webOrigin,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
})
