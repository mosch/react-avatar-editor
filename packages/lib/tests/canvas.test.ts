import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:3001/')
  expect(
    await page.locator('canvas').screenshot({ path: 'screenshot-start.png' }),
  ).toMatchSnapshot()
  await page.fill('[name=scale]', '1.5')
  expect(
    await page.locator('canvas').screenshot({ path: 'screenshot-scale.png' }),
  ).toMatchSnapshot()
  await page.fill('[name=width]', '400')
  await page.fill('[name=height]', '400')
  expect(
    await page.locator('canvas').screenshot({ path: 'screenshot-resize.png' }),
  ).toMatchSnapshot()
  await page.fill('[name=rotation]', '180')
  expect(
    await page
      .locator('canvas')
      .screenshot({ path: 'screenshot-rotate-1.png' }),
  ).toMatchSnapshot()
  await page.fill('[name=rotation]', '90')
  expect(
    await page
      .locator('canvas')
      .screenshot({ path: 'screenshot-rotate-2.png' }),
  ).toMatchSnapshot()
  await page.fill('[name=rotation]', '120')
  expect(
    await page
      .locator('canvas')
      .screenshot({ path: 'screenshot-rotate-3.png' }),
  ).toMatchSnapshot()
})
