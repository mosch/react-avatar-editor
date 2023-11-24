import { defineConfig, devices } from '@playwright/test'

const port = 5678

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  expect: {
    timeout: 10000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm --filter react-avatar-editor-demo dev --host --port ${port}`,
    url: `http://127.0.0.1:${port}/index.html`,
  },
})
