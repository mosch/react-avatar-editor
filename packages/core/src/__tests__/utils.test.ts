import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { drawRoundedRect } from '../utils/drawRoundedRect'
import { drawGrid } from '../utils/drawGrid'
import { isFileAPISupported } from '../utils/isFileAPISupported'
import { isPassiveSupported } from '../utils/isPassiveSupported'
import { isTouchDevice } from '../utils/isTouchDevice'
import { loadImageURL } from '../utils/loadImageURL'
import { loadImageFile } from '../utils/loadImageFile'

/**
 * Creates a mock CanvasRenderingContext2D for testing draw utilities.
 */
function createMockContext(): CanvasRenderingContext2D {
  return {
    rect: vi.fn(),
    arc: vi.fn(),
    lineTo: vi.fn(),
    translate: vi.fn(),
    closePath: vi.fn(),
    fillStyle: '',
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

// ─── drawRoundedRect ────────────────────────────────────────────────────
describe('drawRoundedRect()', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should call rect() when borderRadius is 0', () => {
    drawRoundedRect(ctx, 10, 20, 100, 80, 0)

    expect(ctx.rect).toHaveBeenCalledWith(10, 20, 100, 80)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('should call arc() four times when borderRadius > 0', () => {
    drawRoundedRect(ctx, 10, 20, 100, 80, 10)

    expect(ctx.rect).not.toHaveBeenCalled()
    expect(ctx.arc).toHaveBeenCalledTimes(4)
    expect(ctx.lineTo).toHaveBeenCalled()
    expect(ctx.closePath).toHaveBeenCalled()
  })

  it('should translate to position and back when borderRadius > 0', () => {
    drawRoundedRect(ctx, 15, 25, 100, 80, 5)

    expect(ctx.translate).toHaveBeenCalledWith(15, 25)
    expect(ctx.translate).toHaveBeenCalledWith(-15, -25)
  })

  it('should not translate when borderRadius is 0', () => {
    drawRoundedRect(ctx, 10, 20, 100, 80, 0)

    expect(ctx.translate).not.toHaveBeenCalled()
  })
})

// ─── drawGrid ───────────────────────────────────────────────────────────
describe('drawGrid()', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should set fillStyle to the grid color', () => {
    drawGrid(ctx, 0, 0, 300, 300, '#ff0000')
    expect(ctx.fillStyle).toBe('#ff0000')
  })

  it('should draw 10 lines total (5 vertical + 5 horizontal)', () => {
    drawGrid(ctx, 10, 20, 300, 300, '#666')

    // 5 vertical bars + 5 horizontal bars = 10 fillRect calls
    expect(ctx.fillRect).toHaveBeenCalledTimes(10)
  })

  it('should draw lines at correct positions', () => {
    drawGrid(ctx, 0, 0, 300, 300, '#666')

    const thirdsX = 100
    const thirdsY = 100

    // First vertical bar
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1, 300)
    // Second vertical bar
    expect(ctx.fillRect).toHaveBeenCalledWith(thirdsX, 0, 1, 300)
    // First horizontal bar
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 300, 1)
    // Second horizontal bar
    expect(ctx.fillRect).toHaveBeenCalledWith(0, thirdsY, 300, 1)
  })
})

// ─── isFileAPISupported ─────────────────────────────────────────────────
describe('isFileAPISupported', () => {
  it('should return a boolean', () => {
    expect(typeof isFileAPISupported).toBe('boolean')
  })

  it('should be true in jsdom environment (File is defined)', () => {
    expect(isFileAPISupported).toBe(true)
  })
})

// ─── isPassiveSupported ─────────────────────────────────────────────────
describe('isPassiveSupported()', () => {
  it('should return a boolean', () => {
    const result = isPassiveSupported()
    expect(typeof result).toBe('boolean')
  })

  it('should return true in modern environments', () => {
    // jsdom supports passive events
    expect(isPassiveSupported()).toBe(true)
  })
})

// ─── isTouchDevice ──────────────────────────────────────────────────────
describe('isTouchDevice', () => {
  it('should return a boolean', () => {
    expect(typeof isTouchDevice).toBe('boolean')
  })

  it('should be a boolean determined by touch API availability', () => {
    // The value depends on the jsdom environment configuration.
    // In some jsdom versions 'ontouchstart' might be on window.
    // We verify the type and that it matches the expected detection logic.
    const expected =
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    expect(isTouchDevice).toBe(expected)
  })
})

// ─── loadImageURL ───────────────────────────────────────────────────────
describe('loadImageURL()', () => {
  let mockImgInstance: {
    listeners: Record<string, ((...args: unknown[]) => void)[]>
    addEventListener: (type: string, fn: (...args: unknown[]) => void) => void
    src: string
    crossOrigin: string | null
    width: number
    height: number
  }

  beforeEach(() => {
    mockImgInstance = {
      listeners: {},
      addEventListener(type: string, fn: (...args: unknown[]) => void) {
        ;(this.listeners[type] ??= []).push(fn)
      },
      src: '',
      crossOrigin: null,
      width: 100,
      height: 100,
    }

    vi.spyOn(globalThis, 'Image').mockImplementation(function (
      this: HTMLImageElement,
    ) {
      Object.assign(this, mockImgInstance)
      // Store a reference so tests can trigger events
      mockImgInstance = this as unknown as typeof mockImgInstance
      return this
    } as unknown as typeof Image)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should resolve with an image on successful load', async () => {
    const promise = loadImageURL('https://example.com/photo.jpg')

    // Simulate the image loading via addEventListener('load', ...)
    mockImgInstance.listeners['load']?.forEach((fn) => fn())

    const result = await promise
    expect(result).toBe(mockImgInstance)
  })

  it('should reject on error', async () => {
    const promise = loadImageURL('https://example.com/bad.jpg')
    const error = new Error('Load failed')

    mockImgInstance.listeners['error']?.forEach((fn) => fn(error))

    await expect(promise).rejects.toBe(error)
  })

  it('should set crossOrigin for non-data URLs when crossOrigin is provided', async () => {
    const promise = loadImageURL('https://example.com/photo.jpg', 'anonymous')
    mockImgInstance.listeners['load']?.forEach((fn) => fn())

    await promise
    expect(mockImgInstance.crossOrigin).toBe('anonymous')
  })

  it('should not set crossOrigin for data URLs', async () => {
    const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    const promise = loadImageURL(dataURL, 'anonymous')
    mockImgInstance.listeners['load']?.forEach((fn) => fn())

    await promise
    expect(mockImgInstance.crossOrigin).toBeNull()
  })

  it('should not set crossOrigin when crossOrigin param is undefined', async () => {
    const promise = loadImageURL('https://example.com/photo.jpg')
    mockImgInstance.listeners['load']?.forEach((fn) => fn())

    await promise
    expect(mockImgInstance.crossOrigin).toBeNull()
  })

  it('should set the src on the image', async () => {
    const url = 'https://example.com/photo.jpg'
    const promise = loadImageURL(url)
    mockImgInstance.listeners['load']?.forEach((fn) => fn())

    await promise
    expect(mockImgInstance.src).toBe(url)
  })
})

// ─── loadImageFile ──────────────────────────────────────────────────────
describe('loadImageFile()', () => {
  let mockImgInstance: {
    listeners: Record<string, ((...args: unknown[]) => void)[]>
    addEventListener: (type: string, fn: (...args: unknown[]) => void) => void
    src: string
    crossOrigin: string | null
    width: number
    height: number
  }

  beforeEach(() => {
    mockImgInstance = {
      listeners: {},
      addEventListener(type: string, fn: (...args: unknown[]) => void) {
        ;(this.listeners[type] ??= []).push(fn)
      },
      src: '',
      crossOrigin: null,
      width: 100,
      height: 100,
    }

    vi.spyOn(globalThis, 'Image').mockImplementation(function (
      this: HTMLImageElement,
    ) {
      Object.assign(this, mockImgInstance)
      mockImgInstance = this as unknown as typeof mockImgInstance
      return this
    } as unknown as typeof Image)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should read a file and resolve with an image', async () => {
    const file = new File(['fake-image-data'], 'test.png', {
      type: 'image/png',
    })

    // Mock FileReader with addEventListener support
    vi.spyOn(globalThis, 'FileReader').mockImplementation(function (
      this: FileReader,
    ) {
      const listeners: Record<string, ((...args: unknown[]) => void)[]> = {}
      this.addEventListener = (
        type: string,
        fn: (...args: unknown[]) => void,
      ) => {
        ;(listeners[type] ??= []).push(fn)
      }
      this.readAsDataURL = vi.fn().mockImplementation(() => {
        setTimeout(() => {
          listeners['load']?.forEach((fn) =>
            fn({ target: { result: 'data:image/png;base64,abc123' } }),
          )
        }, 0)
      })
      return this
    } as unknown as typeof FileReader)

    const promise = loadImageFile(file)

    // After FileReader fires load, loadImageURL is called which creates an Image.
    // We need to wait for the Image's load listener to be set, then trigger it.
    await vi.waitFor(() => {
      if (!mockImgInstance.listeners['load']?.length)
        throw new Error('waiting for image load listener')
    })
    mockImgInstance.listeners['load']?.forEach((fn) => fn())

    const result = await promise
    expect(result).toBe(mockImgInstance)
  })

  it('should reject when FileReader returns no data', async () => {
    const file = new File([''], 'empty.png', { type: 'image/png' })

    vi.spyOn(globalThis, 'FileReader').mockImplementation(function (
      this: FileReader,
    ) {
      const listeners: Record<string, ((...args: unknown[]) => void)[]> = {}
      this.addEventListener = (
        type: string,
        fn: (...args: unknown[]) => void,
      ) => {
        ;(listeners[type] ??= []).push(fn)
      }
      this.readAsDataURL = vi.fn().mockImplementation(() => {
        setTimeout(() => {
          listeners['load']?.forEach((fn) => fn({ target: { result: null } }))
        }, 0)
      })
      return this
    } as unknown as typeof FileReader)

    await expect(loadImageFile(file)).rejects.toThrow('No image data')
  })
})
