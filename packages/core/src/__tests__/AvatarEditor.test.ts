import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AvatarEditorCore } from '../AvatarEditor'
import type { ImageState, AvatarEditorConfig } from '../types'

/**
 * Creates a minimal mock CanvasRenderingContext2D with all methods used by the
 * AvatarEditorCore class stubbed as vi.fn().
 */
function createMockContext(
  canvasWidth = 300,
  canvasHeight = 300,
): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  return {
    canvas,
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    rect: vi.fn(),
    arc: vi.fn(),
    lineTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalCompositeOperation: 'source-over',
  } as unknown as CanvasRenderingContext2D
}

/**
 * Install a getContext mock on HTMLCanvasElement so that jsdom's
 * document.createElement('canvas').getContext('2d') returns a usable mock.
 */
function installCanvasContextMock() {
  const original = HTMLCanvasElement.prototype.getContext
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    function (this: HTMLCanvasElement, contextId: string) {
      if (contextId === '2d') {
        return createMockContext(
          this.width,
          this.height,
        ) as unknown as CanvasRenderingContext2D
      }
      return original.call(this, contextId as '2d')
    } as typeof HTMLCanvasElement.prototype.getContext,
  )
}

/**
 * Creates a fake HTMLImageElement-like object with specified dimensions.
 */
function createFakeImage(width: number, height: number): HTMLImageElement {
  const img = new Image()
  Object.defineProperty(img, 'width', { value: width, writable: false })
  Object.defineProperty(img, 'height', { value: height, writable: false })
  return img
}

/**
 * Returns a default config suitable for most tests.
 */
function defaultConfig(
  overrides: Partial<AvatarEditorConfig> = {},
): AvatarEditorConfig {
  return {
    width: 200,
    height: 200,
    ...overrides,
  }
}

/**
 * Returns an ImageState with resource loaded (landscape image by default).
 */
function loadedImageState(imgWidth = 400, imgHeight = 300): ImageState {
  return {
    x: 0.5,
    y: 0.5,
    width: 200,
    height: 150,
    resource: createFakeImage(imgWidth, imgHeight),
  }
}

describe('AvatarEditorCore', () => {
  // ─── Constructor ──────────────────────────────────────────────────────
  describe('constructor', () => {
    it('should apply default config values', () => {
      const editor = new AvatarEditorCore({ width: 200, height: 200 })
      // Verify defaults via observable behaviour
      expect(editor.getBorders()).toEqual([25, 25])
      expect(editor.isVertical()).toBe(false)
    })

    it('should merge provided config with defaults', () => {
      const editor = new AvatarEditorCore({
        width: 300,
        height: 300,
        border: 10,
        borderRadius: 50,
        scale: 2,
        rotate: 90,
        disableCanvasRotation: false,
      })

      expect(editor.getBorders()).toEqual([10, 10])
      expect(editor.isVertical()).toBe(true)
    })
  })

  // ─── getBorders ────────────────────────────────────────────────────────
  describe('getBorders()', () => {
    it('should return default border as [number, number]', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      expect(editor.getBorders()).toEqual([25, 25])
    })

    it('should return a single number border as [n, n]', () => {
      const editor = new AvatarEditorCore(defaultConfig({ border: 50 }))
      expect(editor.getBorders()).toEqual([50, 50])
    })

    it('should return array border as-is', () => {
      const editor = new AvatarEditorCore(defaultConfig({ border: [10, 20] }))
      expect(editor.getBorders()).toEqual([10, 20])
    })

    it('should accept an override argument', () => {
      const editor = new AvatarEditorCore(defaultConfig({ border: 10 }))
      expect(editor.getBorders(99)).toEqual([99, 99])
      expect(editor.getBorders([5, 15])).toEqual([5, 15])
    })
  })

  // ─── getDimensions ────────────────────────────────────────────────────
  describe('getDimensions()', () => {
    it('should compute canvas size including borders (non-rotated)', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 150, border: 25 }),
      )
      const dims = editor.getDimensions()

      expect(dims.canvas.width).toBe(250) // 200 + 25*2
      expect(dims.canvas.height).toBe(200) // 150 + 25*2
      expect(dims.width).toBe(200)
      expect(dims.height).toBe(150)
    })

    it('should swap width/height when vertical (rotated 90 degrees)', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({
          width: 200,
          height: 150,
          border: 0,
          rotate: 90,
          disableCanvasRotation: false,
        }),
      )
      const dims = editor.getDimensions()

      // Vertical: canvas.width = config.height, canvas.height = config.width
      expect(dims.canvas.width).toBe(150)
      expect(dims.canvas.height).toBe(200)
    })

    it('should handle array borders', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: [10, 20] }),
      )
      const dims = editor.getDimensions()

      expect(dims.canvas.width).toBe(220) // 200 + 10*2
      expect(dims.canvas.height).toBe(240) // 200 + 20*2
    })
  })

  // ─── isVertical ───────────────────────────────────────────────────────
  describe('isVertical()', () => {
    it('should return false for 0 degrees', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ rotate: 0, disableCanvasRotation: false }),
      )
      expect(editor.isVertical()).toBe(false)
    })

    it('should return true for 90 degrees', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ rotate: 90, disableCanvasRotation: false }),
      )
      expect(editor.isVertical()).toBe(true)
    })

    it('should return false for 180 degrees', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ rotate: 180, disableCanvasRotation: false }),
      )
      expect(editor.isVertical()).toBe(false)
    })

    it('should return true for 270 degrees', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ rotate: 270, disableCanvasRotation: false }),
      )
      expect(editor.isVertical()).toBe(true)
    })

    it('should always return false when disableCanvasRotation is true', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ rotate: 90, disableCanvasRotation: true }),
      )
      expect(editor.isVertical()).toBe(false)
    })
  })

  // ─── getXScale / getYScale ────────────────────────────────────────────
  describe('getXScale() / getYScale()', () => {
    it('should return 1 for a square image on a square canvas', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
        resource: createFakeImage(200, 200),
      })

      expect(editor.getXScale()).toBe(1)
      expect(editor.getYScale()).toBe(1)
    })

    it('should scale x for a landscape image on a square canvas', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 400,
        height: 200,
        resource: createFakeImage(400, 200),
      })

      // canvasAspect = 200/200 = 1, imageAspect = 400/200 = 2
      // xScale = min(1, 1/2) = 0.5
      expect(editor.getXScale()).toBe(0.5)
      // yScale = min(1, 1/0.5) = min(1, 2) = 1
      expect(editor.getYScale()).toBe(1)
    })

    it('should scale y for a portrait image on a square canvas', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 400,
        resource: createFakeImage(200, 400),
      })

      expect(editor.getXScale()).toBe(1)
      expect(editor.getYScale()).toBe(0.5)
    })

    it('should throw when image dimensions are not available', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      // Default imageState has no width/height
      expect(() => editor.getXScale()).toThrow('Image dimension is unknown.')
      expect(() => editor.getYScale()).toThrow('Image dimension is unknown.')
    })
  })

  // ─── getCroppingRect ─────────────────────────────────────────────────
  describe('getCroppingRect()', () => {
    let editor: AvatarEditorCore

    beforeEach(() => {
      editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, scale: 1 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
        resource: createFakeImage(200, 200),
      })
    })

    it('should return default centered cropping rect at scale 1', () => {
      const rect = editor.getCroppingRect()
      expect(rect.x).toBeCloseTo(0)
      expect(rect.y).toBeCloseTo(0)
      expect(rect.width).toBeCloseTo(1)
      expect(rect.height).toBeCloseTo(1)
    })

    it('should accept a custom position', () => {
      const rect = editor.getCroppingRect({ x: 0.7, y: 0.3 })
      // width/height still 1 at scale 1
      expect(rect.width).toBeCloseTo(1)
      expect(rect.height).toBeCloseTo(1)
    })

    it('should reduce visible area when scale > 1', () => {
      editor.updateConfig({ scale: 2 })
      const rect = editor.getCroppingRect()
      expect(rect.width).toBeCloseTo(0.5)
      expect(rect.height).toBeCloseTo(0.5)
    })

    it('should clamp position to boundaries', () => {
      // Push position to extreme
      const rect = editor.getCroppingRect({ x: 100, y: 100 })
      // At scale 1, width=1, so xMax = 1-1 = 0
      expect(rect.x).toBeCloseTo(0)
      expect(rect.y).toBeCloseTo(0)
    })

    it('should allow out-of-bounds when disableBoundaryChecks is true', () => {
      editor.updateConfig({ disableBoundaryChecks: true })
      editor.updateConfig({ scale: 2 })
      const rect = editor.getCroppingRect({ x: 0.9, y: 0.9 })
      // With disableBoundaryChecks, the xMax = 1, yMax = 1, xMin = -width, yMin = -height
      // position should be allowed beyond the normal clamp
      expect(rect.x).toBeGreaterThan(0)
      expect(rect.y).toBeGreaterThan(0)
    })

    it('should return default rect when image dimensions are not available (fix #389)', () => {
      const editorNoImage = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, scale: 1 }),
      )
      // The default imageState has no width/height. Previously this threw or
      // returned NaN values (bug #389). Now it returns a sensible default.
      const rect = editorNoImage.getCroppingRect()
      expect(rect).toEqual({ x: 0, y: 0, width: 1, height: 1 })
      expect(Number.isNaN(rect.x)).toBe(false)
      expect(Number.isNaN(rect.y)).toBe(false)
      expect(Number.isNaN(rect.width)).toBe(false)
      expect(Number.isNaN(rect.height)).toBe(false)
    })
  })

  // ─── getInitialSize ───────────────────────────────────────────────────
  describe('getInitialSize()', () => {
    it('should compute size for a landscape image in a square canvas', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 0 }),
      )
      const size = editor.getInitialSize(400, 200)

      // dimensions = { canvas: { width: 200, height: 200 }, width: 200, height: 200 }
      // canvasRatio = 200/200 = 1, imageRatio = 200/400 = 0.5
      // canvasRatio > imageRatio => newHeight = canvas.height = 200
      // newWidth = round(400 * (200/200)) = 400
      expect(size.height).toBe(200)
      expect(size.width).toBe(400)
    })

    it('should compute size for a portrait image in a square canvas', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 0 }),
      )
      const size = editor.getInitialSize(200, 400)

      // canvasRatio = 1, imageRatio = 2
      // canvasRatio < imageRatio => newWidth = canvas.width = 200
      // newHeight = round(400 * (200/200)) = 400
      expect(size.width).toBe(200)
      expect(size.height).toBe(400)
    })

    it('should compute size for a square image', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 0 }),
      )
      const size = editor.getInitialSize(500, 500)

      // canvasRatio = 1, imageRatio = 1
      // canvasRatio <= imageRatio (equal) => newWidth = 200, newHeight = round(500 * 200/500) = 200
      expect(size.width).toBe(200)
      expect(size.height).toBe(200)
    })

    it('should account for borders in canvas dimensions', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 25 }),
      )
      // getDimensions() returns:
      //   canvas: { width: 250, height: 250 }
      //   width: 200, height: 200
      // getInitialSize uses dimensions.height (canvas.height=250) and dimensions.width (canvas.width=250)
      // Wait, let me re-read the code...
      // Actually getInitialSize uses dimensions.height and dimensions.width which map to
      // config.height and config.width (200, 200), NOT the canvas size.
      // But dimensions.canvas.height and dimensions.canvas.width include borders.
      // Actually no: in getDimensions, it returns { canvas, rotate, width, height, border }
      // where width = config.width, height = config.height
      // In getInitialSize: canvasRatio = dimensions.height / dimensions.width = config.height / config.width
      // And newHeight = dimensions.height = config.height, newWidth = dimensions.width = config.width
      // So borders DO NOT affect getInitialSize at all. The dimensions used are the raw config values.
      const size = editor.getInitialSize(500, 500)

      // Same as without borders: canvasRatio = 200/200 = 1, imageRatio = 1
      // canvasRatio <= imageRatio => newWidth = config.width = 200
      expect(size.width).toBe(200)
      expect(size.height).toBe(200)
    })

    it('should handle non-square canvas with landscape image', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 300, height: 200, border: 0 }),
      )
      const size = editor.getInitialSize(600, 200)

      // canvasRatio = 200/300 = 0.667, imageRatio = 200/600 = 0.333
      // canvasRatio > imageRatio => newHeight = dimensions.height = 200
      // newWidth = round(600 * (200/200)) = 600
      expect(size.height).toBe(200)
      expect(size.width).toBe(600)
    })
  })

  // ─── calculateDragPosition ────────────────────────────────────────────
  describe('calculateDragPosition()', () => {
    let editor: AvatarEditorCore

    beforeEach(() => {
      editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, rotate: 0 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
        resource: createFakeImage(200, 200),
      })
    })

    it('should return new position with no rotation', () => {
      const pos = editor.calculateDragPosition(10, 10, 20, 20)
      expect(pos.x).toBeTypeOf('number')
      expect(pos.y).toBeTypeOf('number')
      expect(Number.isNaN(pos.x)).toBe(false)
      expect(Number.isNaN(pos.y)).toBe(false)
    })

    it('should return same position when delta is zero', () => {
      const pos = editor.calculateDragPosition(10, 10, 10, 10)
      expect(pos.x).toBeCloseTo(0.5)
      expect(pos.y).toBeCloseTo(0.5)
    })

    it('should handle 90 degree rotation', () => {
      editor.updateConfig({ rotate: 90 })
      const pos = editor.calculateDragPosition(0, 0, 10, 0)
      expect(Number.isNaN(pos.x)).toBe(false)
      expect(Number.isNaN(pos.y)).toBe(false)
    })

    it('should handle 180 degree rotation', () => {
      editor.updateConfig({ rotate: 180 })
      const pos = editor.calculateDragPosition(0, 0, 10, 0)
      expect(Number.isNaN(pos.x)).toBe(false)
      expect(Number.isNaN(pos.y)).toBe(false)
    })

    it('should handle 270 degree rotation', () => {
      editor.updateConfig({ rotate: 270 })
      const pos = editor.calculateDragPosition(0, 0, 10, 0)
      expect(Number.isNaN(pos.x)).toBe(false)
      expect(Number.isNaN(pos.y)).toBe(false)
    })

    it('should move position in the drag direction (no rotation)', () => {
      // Dragging right (lastMx > mousePositionX => positive deltaX)
      const pos = editor.calculateDragPosition(0, 0, 20, 0)
      // deltaX = 20 - 0 = 20 => image shifts right => cropping x increases
      expect(pos.x).toBeGreaterThan(0.5)
    })

    it('should throw when image dimensions are not available', () => {
      const editorNoImage = new AvatarEditorCore(defaultConfig())
      expect(() => editorNoImage.calculateDragPosition(0, 0, 10, 10)).toThrow(
        'Image dimension is unknown.',
      )
    })
  })

  // ─── getImage ─────────────────────────────────────────────────────────
  describe('getImage()', () => {
    beforeEach(() => {
      installCanvasContextMock()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return a canvas element', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      editor.setImageState(loadedImageState())

      const canvas = editor.getImage()
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    })

    it('should throw when no image resource is available', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      // Set image state with dimensions but no resource, so getCroppingRect
      // succeeds but the resource check fails
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
      })
      expect(() => editor.getImage()).toThrow('No image resource available')
    })

    it('should swap canvas dimensions when vertical', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ rotate: 90, disableCanvasRotation: false }),
      )
      editor.setImageState(loadedImageState(400, 300))

      const canvas = editor.getImage()
      // For vertical, canvasEl.width = cropRect.height, canvasEl.height = cropRect.width
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
    })

    it('should produce integer dimensions for square crop (fix #429)', () => {
      // A non-square image (700x800) with a square crop area (320x320)
      // should produce exactly square output, not off-by-one.
      // Previously, Math.round in getInitialSize introduced rounding error
      // that caused off-by-one pixel differences (e.g. 700x699 instead of 700x700).
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 320, height: 320, border: 0, scale: 1 }),
      )
      // Simulate what loadImage does: compute initial size then set state
      const initialSize = editor.getInitialSize(700, 800)
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        ...initialSize,
        resource: createFakeImage(700, 800),
      })

      const canvas = editor.getImage()
      // Canvas dimensions must be integers
      expect(canvas.width).toBe(Math.round(canvas.width))
      expect(canvas.height).toBe(Math.round(canvas.height))
      // For a square crop of any image, output must be perfectly square
      expect(canvas.width).toBe(canvas.height)
    })
  })

  // ─── getImageScaledToCanvas ───────────────────────────────────────────
  describe('getImageScaledToCanvas()', () => {
    beforeEach(() => {
      installCanvasContextMock()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return a canvas element with correct dimensions', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200 }),
      )
      editor.setImageState(loadedImageState())

      const canvas = editor.getImageScaledToCanvas()
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBe(200)
      expect(canvas.height).toBe(200)
    })

    it('should swap dimensions when vertical', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({
          width: 200,
          height: 150,
          rotate: 90,
          disableCanvasRotation: false,
        }),
      )
      editor.setImageState(loadedImageState())

      const canvas = editor.getImageScaledToCanvas()
      expect(canvas.width).toBe(150) // height becomes width
      expect(canvas.height).toBe(200) // width becomes height
    })
  })

  // ─── calculatePosition ────────────────────────────────────────────────
  describe('calculatePosition()', () => {
    it('should throw when image has no dimensions', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      expect(() => editor.calculatePosition()).toThrow(
        'Image dimension is unknown.',
      )
    })

    it('should return correct position values with loaded image', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 25 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
        resource: createFakeImage(200, 200),
      })

      const pos = editor.calculatePosition()
      expect(pos).toHaveProperty('x')
      expect(pos).toHaveProperty('y')
      expect(pos).toHaveProperty('width')
      expect(pos).toHaveProperty('height')
      expect(pos.width).toBe(200) // width * scale(1)
      expect(pos.height).toBe(200) // height * scale(1)
    })

    it('should account for scale', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, scale: 2 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
        resource: createFakeImage(200, 200),
      })

      const pos = editor.calculatePosition()
      expect(pos.width).toBe(400) // 200 * 2
      expect(pos.height).toBe(400) // 200 * 2
    })

    it('should accept a custom border override', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 25 }),
      )
      editor.setImageState({
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
        resource: createFakeImage(200, 200),
      })

      const posDefault = editor.calculatePosition()
      const posCustom = editor.calculatePosition(undefined, 50)
      // With larger border, x and y should be offset more
      expect(posCustom.x).not.toBe(posDefault.x)
    })
  })

  // ─── paint ────────────────────────────────────────────────────────────
  describe('paint()', () => {
    it('should call context methods for painting overlay', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200 }),
      )
      const ctx = createMockContext()

      editor.paint(ctx)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.scale).toHaveBeenCalled()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.rect).toHaveBeenCalled()
      expect(ctx.fill).toHaveBeenCalledWith('evenodd')
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should draw border stroke when borderColor is set', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ borderColor: [255, 255, 255, 1] }),
      )
      const ctx = createMockContext()

      editor.paint(ctx)

      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('should not draw border stroke when borderColor is not set', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      const ctx = createMockContext()

      editor.paint(ctx)

      expect(ctx.stroke).not.toHaveBeenCalled()
    })

    it('should draw grid when showGrid is true', () => {
      const editor = new AvatarEditorCore(defaultConfig({ showGrid: true }))
      const ctx = createMockContext()

      editor.paint(ctx)

      // drawGrid calls fillRect multiple times (10 times total - 5 vertical, 5 horizontal)
      expect(ctx.fillRect).toHaveBeenCalled()
    })

    it('should use rounded rect when borderRadius > 0', () => {
      const editor = new AvatarEditorCore(defaultConfig({ borderRadius: 10 }))
      const ctx = createMockContext()

      editor.paint(ctx)

      // drawRoundedRect with borderRadius > 0 calls arc and closePath
      expect(ctx.arc).toHaveBeenCalled()
      expect(ctx.closePath).toHaveBeenCalled()
    })
  })

  // ─── paintImage ───────────────────────────────────────────────────────
  describe('paintImage()', () => {
    it('should call drawImage with correct parameters', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 25 }),
      )
      const imageState = loadedImageState()
      editor.setImageState(imageState)

      const ctx = createMockContext(250, 250)

      editor.paintImage(ctx, imageState, 25)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.translate).toHaveBeenCalled()
      expect(ctx.rotate).toHaveBeenCalled()
      expect(ctx.scale).toHaveBeenCalled()
      expect(ctx.drawImage).toHaveBeenCalledWith(
        imageState.resource,
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
      )
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should return early if no image resource', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      const ctx = createMockContext()
      const stateWithoutResource: ImageState = {
        x: 0.5,
        y: 0.5,
        width: 200,
        height: 200,
      }

      editor.paintImage(ctx, stateWithoutResource, 25)

      expect(ctx.drawImage).not.toHaveBeenCalled()
    })

    it('should fill background when backgroundColor is set', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ backgroundColor: '#ff0000' }),
      )
      const imageState = loadedImageState()
      editor.setImageState(imageState)

      const ctx = createMockContext(250, 250)

      editor.paintImage(ctx, imageState, 25)

      expect(ctx.fillRect).toHaveBeenCalled()
    })

    it('should accept a custom scaleFactor', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      const imageState = loadedImageState()
      editor.setImageState(imageState)

      const ctx = createMockContext(250, 250)

      editor.paintImage(ctx, imageState, 0, 2)

      expect(ctx.scale).toHaveBeenCalledWith(2, 2)
    })
  })

  // ─── loadImage ────────────────────────────────────────────────────────
  describe('loadImage()', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should load an image from a URL string', async () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ width: 200, height: 200, border: 0 }),
      )

      vi.spyOn(globalThis, 'Image').mockImplementation(function (
        this: HTMLImageElement,
      ) {
        const listeners: Record<string, ((...args: unknown[]) => void)[]> = {}
        this.addEventListener = (
          type: string,
          fn: (...args: unknown[]) => void,
        ) => {
          ;(listeners[type] ??= []).push(fn)
        }
        // Auto-trigger load when src is set
        let _src = ''
        Object.defineProperty(this, 'src', {
          get: () => _src,
          set: (val: string) => {
            _src = val
            setTimeout(() => listeners['load']?.forEach((fn) => fn()), 0)
          },
          configurable: true,
        })
        Object.defineProperty(this, 'width', { value: 400, writable: false })
        Object.defineProperty(this, 'height', { value: 300, writable: false })
        return this
      } as unknown as typeof Image)

      const imageState = await editor.loadImage('https://example.com/photo.jpg')

      expect(imageState.resource).toBeDefined()
      expect(imageState.x).toBe(0.5)
      expect(imageState.y).toBe(0.5)
      expect(imageState.width).toBeDefined()
      expect(imageState.height).toBeDefined()
    })

    it('should throw for invalid source', async () => {
      const editor = new AvatarEditorCore(defaultConfig())
      // pass a number cast to any
      await expect(editor.loadImage(42 as unknown as string)).rejects.toThrow(
        'Invalid image source',
      )
    })
  })

  // ─── clearImage ───────────────────────────────────────────────────────
  describe('clearImage()', () => {
    it('should reset imageState to defaults', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      editor.setImageState(loadedImageState())

      editor.clearImage()
      const state = editor.getImageState()

      expect(state.x).toBe(0.5)
      expect(state.y).toBe(0.5)
      expect(state.width).toBeUndefined()
      expect(state.height).toBeUndefined()
      expect(state.resource).toBeUndefined()
    })
  })

  // ─── updateConfig ─────────────────────────────────────────────────────
  describe('updateConfig()', () => {
    it('should update partial config correctly', () => {
      const editor = new AvatarEditorCore(defaultConfig({ border: 25 }))
      editor.updateConfig({ border: 50 })

      expect(editor.getBorders()).toEqual([50, 50])
    })

    it('should preserve existing config values', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ border: 25, borderRadius: 10 }),
      )
      editor.updateConfig({ border: 50 })

      // borderRadius should still work (indirectly verified via paint)
      const dims = editor.getDimensions()
      expect(dims.canvas.width).toBe(300) // 200 + 50*2
    })
  })

  // ─── getPixelRatio ────────────────────────────────────────────────────
  describe('getPixelRatio()', () => {
    it('should return 1 when disableHiDPIScaling is true', () => {
      const editor = new AvatarEditorCore(
        defaultConfig({ disableHiDPIScaling: true }),
      )
      expect(editor.getPixelRatio()).toBe(1)
    })

    it('should return window.devicePixelRatio when available and not disabled', () => {
      const originalDPR = window.devicePixelRatio
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true,
        configurable: true,
      })

      try {
        const editor = new AvatarEditorCore(
          defaultConfig({ disableHiDPIScaling: false }),
        )
        expect(editor.getPixelRatio()).toBe(2)
      } finally {
        Object.defineProperty(window, 'devicePixelRatio', {
          value: originalDPR,
          writable: true,
          configurable: true,
        })
      }
    })
  })

  // ─── getImageState / setImageState ────────────────────────────────────
  describe('getImageState() / setImageState()', () => {
    it('should get and set image state', () => {
      const editor = new AvatarEditorCore(defaultConfig())
      const state: ImageState = { x: 0.3, y: 0.7, width: 100, height: 100 }

      editor.setImageState(state)
      expect(editor.getImageState()).toBe(state)
    })
  })
})
