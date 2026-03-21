import { test, expect } from '@playwright/test'

test('canvas renders correctly at default settings', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  // Wait for image to load
  await page.waitForTimeout(500)
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})

test('canvas updates on zoom', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  // Zoom slider is the first range input
  await page.locator('input[type="range"]').first().fill('1.5')
  await page.waitForTimeout(200)
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})

test('canvas updates on resize', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  // Width and height are the number inputs
  await page.locator('input[type="number"]').first().fill('400')
  await page.locator('input[type="number"]').nth(1).fill('400')
  await page.waitForTimeout(200)
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})

test('canvas updates on rotation 180', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  // Rotation is the 3rd range input
  await page.locator('input[type="range"]').nth(2).fill('180')
  await page.waitForTimeout(200)
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})

test('canvas updates on rotation 90', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  await page.locator('input[type="range"]').nth(2).fill('90')
  await page.waitForTimeout(200)
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})

test('canvas updates on rotation 120', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  await page.locator('input[type="range"]').nth(2).fill('120')
  await page.waitForTimeout(200)
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})

test('canvas updates with border radius', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  // Roundness is the 2nd range input
  await page.locator('input[type="range"]').nth(1).fill('50')
  await page.waitForTimeout(200)
  expect(await page.locator('canvas').screenshot()).toMatchSnapshot()
})

test('exported image has no color overlay', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  // Click "Export Preview" button
  await page.getByRole('button', { name: 'Export Preview' }).click()
  await page.waitForTimeout(200)

  // The preview image should appear
  const previewImg = page.locator('img[alt="Cropped preview"]')
  await expect(previewImg).toBeVisible()
  expect(await previewImg.screenshot()).toMatchSnapshot()
})
