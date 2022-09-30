import { test, expect } from '@playwright/test'
import { start, stop } from 'react-avatar-editor-demo/serve'

let port = 0
test.beforeAll(async () => {
  port = await start()
  console.log('Running on port', port)
})

test.afterAll(async () => {
  await stop()
})

test('basic test', async ({ page }) => {
  await page.goto(`http://localhost:${port}`)

  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()

  await page.fill('[name=scale]', '1.5')
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()

  await page.fill('[name=width]', '400')
  await page.fill('[name=height]', '400')
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()

  await page.fill('[name=rotation]', '180')
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()

  await page.fill('[name=rotation]', '90')
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()

  await page.fill('[name=rotation]', '120')
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})
