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

test('canvas zooms in on wheel scroll up', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  const canvas = page.locator('canvas')

  // Wheel scroll up (negative deltaY) should zoom in
  await canvas.dispatchEvent('wheel', {
    deltaY: -500,
    clientX: 150,
    clientY: 150,
  })
  await page.waitForTimeout(200)
  expect(await canvas.screenshot()).toMatchSnapshot()
})

test('canvas zooms out on wheel scroll down', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  const canvas = page.locator('canvas')

  // First zoom in, then zoom out past the initial level
  await canvas.dispatchEvent('wheel', {
    deltaY: -500,
    clientX: 150,
    clientY: 150,
  })
  await page.waitForTimeout(100)
  await canvas.dispatchEvent('wheel', {
    deltaY: 1000,
    clientX: 150,
    clientY: 150,
  })
  await page.waitForTimeout(200)
  expect(await canvas.screenshot()).toMatchSnapshot()
})

test('canvas zooms on trackpad pinch gesture (ctrlKey+wheel)', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  const canvas = page.locator('canvas')

  // Trackpad pinch fires as wheel events with ctrlKey: true
  await canvas.dispatchEvent('wheel', {
    deltaY: -50,
    ctrlKey: true,
    clientX: 150,
    clientY: 150,
  })
  await page.waitForTimeout(200)
  expect(await canvas.screenshot()).toMatchSnapshot()
})

test('canvas zooms via touch pinch gesture', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas not found')

  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2

  // Simulate two-finger pinch spread using CDP Touch events
  const client = await page.context().newCDPSession(page)

  // Touch down with two fingers close together
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: cx - 20, y: cy },
      { x: cx + 20, y: cy },
    ],
  })

  // Spread fingers apart (zoom in)
  for (let i = 1; i <= 5; i++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: cx - 20 - i * 15, y: cy },
        { x: cx + 20 + i * 15, y: cy },
      ],
    })
  }

  // Release
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })

  await page.waitForTimeout(200)
  expect(await canvas.screenshot()).toMatchSnapshot()
})

test('canvas is keyboard accessible', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(500)

  const canvas = page.locator('canvas')

  // Verify ARIA attributes
  await expect(canvas).toHaveAttribute('role', 'application')
  await expect(canvas).toHaveAttribute('tabindex', '0')
  await expect(canvas).toHaveAttribute('aria-roledescription', 'image editor')

  // Focus canvas and use arrow keys to pan
  await canvas.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(200)

  // Image should have moved — screenshot will differ from default
  expect(await canvas.screenshot()).toMatchSnapshot()
})
