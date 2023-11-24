import { defineConfig, devices } from '@playwright/test'

const port = 5678

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm --filter react-avatar-editor-demo preview --host --port ${port}`,
    url: `http://127.0.0.1:${port}/index.html`,
  },
})
