import React, { createRef } from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AvatarEditor, { type AvatarEditorRef } from '../index'

describe('AvatarEditor', () => {
  let mockContext: Record<string, unknown>
  let getContextSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      arcTo: vi.fn(),
      canvas: { width: 250, height: 250 },
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      globalCompositeOperation: '',
    }

    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(mockContext as unknown as CanvasRenderingContext2D)
  })

  afterEach(() => {
    getContextSpy.mockRestore()
  })

  // -------------------------------------------------------
  // 1. Rendering: Renders a canvas element with correct dimensions
  // -------------------------------------------------------
  describe('rendering', () => {
    it('renders a canvas element', () => {
      const { container } = render(<AvatarEditor width={200} height={200} />)
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('renders a canvas with correct default dimensions (200 + 25*2 border)', () => {
      const { container } = render(<AvatarEditor width={200} height={200} />)
      const canvas = container.querySelector('canvas')!
      // Default border = 25, so canvas dimensions = 200 + 25*2 = 250
      // With pixelRatio=1 (jsdom), attribute width/height = CSS width/height * pixelRatio
      expect(canvas.getAttribute('width')).toBe('250')
      expect(canvas.getAttribute('height')).toBe('250')
    })
  })

  // -------------------------------------------------------
  // 2. Props: width, height, border, borderRadius, scale, rotate
  // -------------------------------------------------------
  describe('props', () => {
    it('applies custom width and height to canvas dimensions', () => {
      const { container } = render(
        <AvatarEditor width={300} height={400} border={0} />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.getAttribute('width')).toBe('300')
      expect(canvas.getAttribute('height')).toBe('400')
    })

    it('applies border to canvas dimensions', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} border={50} />,
      )
      const canvas = container.querySelector('canvas')!
      // 200 + 50*2 = 300
      expect(canvas.getAttribute('width')).toBe('300')
      expect(canvas.getAttribute('height')).toBe('300')
    })

    it('applies array border [horizontal, vertical] to canvas dimensions', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} border={[30, 40]} />,
      )
      const canvas = container.querySelector('canvas')!
      // width = 200 + 30*2 = 260, height = 200 + 40*2 = 280
      expect(canvas.getAttribute('width')).toBe('260')
      expect(canvas.getAttribute('height')).toBe('280')
    })

    it('accepts borderRadius prop without error', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} borderRadius={100} />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('accepts scale prop without error', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} scale={2} />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('accepts rotate prop without error', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} rotate={90} />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------
  // 3. Style: Canvas has correct CSS style (width, height, cursor)
  // -------------------------------------------------------
  describe('style', () => {
    it('sets CSS width and height on the canvas style', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} border={25} />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.style.width).toBe('250px')
      expect(canvas.style.height).toBe('250px')
    })

    it('has cursor set to "grab" by default (not dragging)', () => {
      const { container } = render(<AvatarEditor width={200} height={200} />)
      const canvas = container.querySelector('canvas')!
      expect(canvas.style.cursor).toBe('grab')
    })

    it('has touchAction set to "none"', () => {
      const { container } = render(<AvatarEditor width={200} height={200} />)
      const canvas = container.querySelector('canvas')!
      expect(canvas.style.touchAction).toBe('none')
    })
  })

  // -------------------------------------------------------
  // 4. Ref methods: getImage() and getImageScaledToCanvas()
  // -------------------------------------------------------
  describe('ref methods', () => {
    it('exposes getImage via ref', () => {
      const ref = createRef<AvatarEditorRef>()
      render(<AvatarEditor ref={ref} width={200} height={200} />)
      expect(ref.current).not.toBeNull()
      expect(typeof ref.current!.getImage).toBe('function')
    })

    it('exposes getImageScaledToCanvas via ref', () => {
      const ref = createRef<AvatarEditorRef>()
      render(<AvatarEditor ref={ref} width={200} height={200} />)
      expect(ref.current).not.toBeNull()
      expect(typeof ref.current!.getImageScaledToCanvas).toBe('function')
    })

    it('getImageScaledToCanvas returns an HTMLCanvasElement', () => {
      const ref = createRef<AvatarEditorRef>()
      render(<AvatarEditor ref={ref} width={200} height={200} />)
      const result = ref.current!.getImageScaledToCanvas()
      expect(result).toBeInstanceOf(HTMLCanvasElement)
    })
  })

  // -------------------------------------------------------
  // 5. Events: mousedown sets drag cursor, mouseup resets cursor
  // -------------------------------------------------------
  describe('events', () => {
    it('sets cursor to "grabbing" on mousedown', () => {
      const { container } = render(<AvatarEditor width={200} height={200} />)
      const canvas = container.querySelector('canvas')!

      fireEvent.mouseDown(canvas)

      expect(canvas.style.cursor).toBe('grabbing')
    })

    it('registers document-level mouseup listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      render(<AvatarEditor width={200} height={200} />)

      const mouseupCalls = addEventListenerSpy.mock.calls.filter(
        ([event]) => event === 'mouseup',
      )
      expect(mouseupCalls.length).toBeGreaterThanOrEqual(1)

      addEventListenerSpy.mockRestore()
    })

    it('removes document-level mouseup listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = render(<AvatarEditor width={200} height={200} />)
      unmount()

      const mouseupCalls = removeEventListenerSpy.mock.calls.filter(
        ([event]) => event === 'mouseup',
      )
      expect(mouseupCalls.length).toBeGreaterThanOrEqual(1)

      removeEventListenerSpy.mockRestore()
    })
  })

  // -------------------------------------------------------
  // 6. Custom style: Custom style prop merges with default style
  // -------------------------------------------------------
  describe('custom style', () => {
    it('merges custom style with default style', () => {
      const { container } = render(
        <AvatarEditor
          width={200}
          height={200}
          style={{ border: '1px solid red', opacity: 0.8 }}
        />,
      )
      const canvas = container.querySelector('canvas')!
      // Custom styles are applied
      expect(canvas.style.border).toBe('1px solid red')
      expect(canvas.style.opacity).toBe('0.8')
      // Default styles are preserved
      expect(canvas.style.cursor).toBe('grab')
      expect(canvas.style.touchAction).toBe('none')
    })

    it('allows custom style to override default cursor', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} style={{ cursor: 'pointer' }} />,
      )
      const canvas = container.querySelector('canvas')!
      // Custom style overrides default because style = { ...defaultStyle, ...style }
      expect(canvas.style.cursor).toBe('pointer')
    })
  })

  // -------------------------------------------------------
  // 7. Props not leaked to DOM
  // -------------------------------------------------------
  describe('props not leaked to DOM', () => {
    it('does not pass showGrid as a DOM attribute', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} showGrid={true} />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.getAttribute('showGrid')).toBeNull()
      expect(canvas.getAttribute('showgrid')).toBeNull()
    })

    it('does not pass gridColor as a DOM attribute', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} gridColor="#ff0000" />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.getAttribute('gridColor')).toBeNull()
      expect(canvas.getAttribute('gridcolor')).toBeNull()
    })

    it('does not pass disableBoundaryChecks as a DOM attribute', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} disableBoundaryChecks={true} />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.getAttribute('disableBoundaryChecks')).toBeNull()
      expect(canvas.getAttribute('disableboundarychecks')).toBeNull()
    })

    it('does not pass disableHiDPIScaling as a DOM attribute', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} disableHiDPIScaling={true} />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.getAttribute('disableHiDPIScaling')).toBeNull()
      expect(canvas.getAttribute('disablehidpiscaling')).toBeNull()
    })

    it('does not pass disableCanvasRotation as a DOM attribute', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} disableCanvasRotation={false} />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.getAttribute('disableCanvasRotation')).toBeNull()
      expect(canvas.getAttribute('disablecanvasrotation')).toBeNull()
    })

    it('does not pass scale, rotate, color, borderRadius as DOM attributes', () => {
      const { container } = render(
        <AvatarEditor
          width={200}
          height={200}
          scale={2}
          rotate={90}
          color={[255, 0, 0, 0.5]}
          borderRadius={50}
        />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas.getAttribute('scale')).toBeNull()
      expect(canvas.getAttribute('rotate')).toBeNull()
      expect(canvas.getAttribute('color')).toBeNull()
      expect(canvas.getAttribute('borderRadius')).toBeNull()
    })
  })

  // -------------------------------------------------------
  // 8. No image: Component renders without image prop
  // -------------------------------------------------------
  describe('no image', () => {
    it('renders without an image prop', () => {
      const { container } = render(<AvatarEditor width={200} height={200} />)
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('renders without any props except required width and height', () => {
      const { container } = render(<AvatarEditor width={100} height={100} />)
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------
  // 9. Position prop: Component accepts position prop
  // -------------------------------------------------------
  describe('position prop', () => {
    it('accepts position prop without error', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} position={{ x: 0.5, y: 0.5 }} />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('accepts a different position prop value', () => {
      const { container } = render(
        <AvatarEditor width={200} height={200} position={{ x: 0.3, y: 0.7 }} />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------
  // 10. Callbacks: onMouseUp, onPositionChange are callable
  // -------------------------------------------------------
  describe('callbacks', () => {
    it('accepts onMouseUp callback prop and renders', () => {
      const onMouseUp = vi.fn()
      const { container } = render(
        <AvatarEditor width={200} height={200} onMouseUp={onMouseUp} />,
      )
      const canvas = container.querySelector('canvas')!
      expect(canvas).toBeInTheDocument()
    })

    it('does not call onMouseUp when not dragging', () => {
      const onMouseUp = vi.fn()
      render(<AvatarEditor width={200} height={200} onMouseUp={onMouseUp} />)

      // Dispatch a native mouseup on document (no prior drag)
      document.dispatchEvent(new MouseEvent('mouseup'))

      expect(onMouseUp).not.toHaveBeenCalled()
    })

    it('accepts onPositionChange callback prop', () => {
      const onPositionChange = vi.fn()
      const { container } = render(
        <AvatarEditor
          width={200}
          height={200}
          onPositionChange={onPositionChange}
        />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('accepts onLoadFailure callback prop', () => {
      const onLoadFailure = vi.fn()
      const { container } = render(
        <AvatarEditor width={200} height={200} onLoadFailure={onLoadFailure} />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('accepts onImageChange callback prop', () => {
      const onImageChange = vi.fn()
      const { container } = render(
        <AvatarEditor width={200} height={200} onImageChange={onImageChange} />,
      )
      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------
  // 11. Display name: Component has displayName 'AvatarEditor'
  // -------------------------------------------------------
  describe('displayName', () => {
    it('has displayName set to "AvatarEditor"', () => {
      expect(AvatarEditor.displayName).toBe('AvatarEditor')
    })
  })
})
