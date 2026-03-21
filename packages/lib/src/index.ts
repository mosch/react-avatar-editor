import React, {
  type TouchEventHandler,
  type CSSProperties,
  type MouseEventHandler,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'

import {
  AvatarEditorCore,
  type ImageState,
  type Position,
  type AvatarEditorConfig,
  isPassiveSupported,
  isTouchDevice,
} from '@react-avatar-editor/core'

export interface Props extends AvatarEditorConfig {
  style?: CSSProperties
  image?: string | File
  position?: Position
  onLoadFailure?: () => void
  onLoadSuccess?: (image: ImageState) => void
  onImageReady?: () => void
  onImageChange?: () => void
  onMouseUp?: () => void
  onMouseMove?: (e: TouchEvent | MouseEvent) => void
  onPositionChange?: (position: Position) => void
}

export type { Position, ImageState }

export interface AvatarEditorRef {
  getImage: () => HTMLCanvasElement
  getImageScaledToCanvas: () => HTMLCanvasElement
}

const AvatarEditor = forwardRef<AvatarEditorRef, Props>((props, ref) => {
  const {
    scale = 1,
    rotate = 0,
    border = 25,
    borderRadius = 0,
    width = 200,
    height = 200,
    color = [0, 0, 0, 0.5],
    showGrid = false,
    gridColor = '#666',
    disableBoundaryChecks = false,
    disableHiDPIScaling = false,
    disableCanvasRotation = true,
    image,
    position,
    backgroundColor,
    crossOrigin,
    onLoadFailure,
    onLoadSuccess,
    onImageReady,
    onImageChange,
    onMouseUp,
    onMouseMove,
    onPositionChange,
    borderColor,
    style,
    ...rest
  } = props

  const canvas = useRef<HTMLCanvasElement>(null)
  const coreRef = useRef<AvatarEditorCore>(
    new AvatarEditorCore({
      width,
      height,
      border,
      borderRadius,
      scale,
      rotate,
      color,
      backgroundColor,
      borderColor,
      showGrid,
      gridColor,
      disableBoundaryChecks,
      disableHiDPIScaling,
      disableCanvasRotation,
      crossOrigin,
    })
  )

  const [drag, setDrag] = useState(false)
  const [mx, setMx] = useState<number | undefined>(undefined)
  const [my, setMy] = useState<number | undefined>(undefined)
  const [imageState, setImageState] = useState<ImageState>(coreRef.current.getImageState())

  // Update core config when props change
  useEffect(() => {
    coreRef.current.updateConfig({
      width,
      height,
      border,
      borderRadius,
      scale,
      rotate,
      color,
      backgroundColor,
      borderColor,
      showGrid,
      gridColor,
      disableBoundaryChecks,
      disableHiDPIScaling,
      disableCanvasRotation,
      crossOrigin,
    })
  }, [width, height, border, borderRadius, scale, rotate, color, backgroundColor, borderColor, showGrid, gridColor, disableBoundaryChecks, disableHiDPIScaling, disableCanvasRotation, crossOrigin])

  const getCanvas = useCallback((): HTMLCanvasElement => {
    if (!canvas.current) {
      throw new Error(
        'No canvas found, please report this to: https://github.com/mosch/react-avatar-editor/issues',
      )
    }
    return canvas.current
  }, [])

  const getContext = useCallback(() => {
    const context = getCanvas().getContext('2d')
    if (!context) {
      throw new Error(
        'No context found, please report this to: https://github.com/mosch/react-avatar-editor/issues',
      )
    }
    return context
  }, [getCanvas])

  const loadImage = useCallback(
    async (file: File | string) => {
      try {
        const newImageState = await coreRef.current.loadImage(file)
        setDrag(false)
        setImageState(newImageState)
        onImageReady?.()
        onLoadSuccess?.(newImageState)
      } catch (error) {
        onLoadFailure?.()
      }
    },
    [onImageReady, onLoadSuccess, onLoadFailure]
  )

  const clearImage = useCallback(() => {
    const canvasEl = getCanvas()
    const context = getContext()
    context.clearRect(0, 0, canvasEl.width, canvasEl.height)
    coreRef.current.clearImage()
    setImageState(coreRef.current.getImageState())
  }, [getCanvas, getContext])

  const repaint = useCallback(() => {
    const context = getContext()
    const canvasEl = getCanvas()
    context.clearRect(0, 0, canvasEl.width, canvasEl.height)
    coreRef.current.paint(context)
    coreRef.current.paintImage(context, imageState, border)
  }, [getContext, getCanvas, imageState, border])

  const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
    e.preventDefault()
    setDrag(true)
    setMx(undefined)
    setMy(undefined)
  }, [])

  const handleTouchStart: TouchEventHandler<HTMLCanvasElement> = useCallback(() => {
    setDrag(true)
    setMx(undefined)
    setMy(undefined)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (drag) {
      setDrag(false)
      onMouseUp?.()
    }
  }, [drag, onMouseUp])

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!drag) {
        return
      }

      e.preventDefault()

      const mousePositionX =
        'targetTouches' in e ? e.targetTouches[0].pageX : e.clientX
      const mousePositionY =
        'targetTouches' in e ? e.targetTouches[0].pageY : e.clientY

      setMx(mousePositionX)
      setMy(mousePositionY)

      if (mx !== undefined && my !== undefined && imageState.width && imageState.height) {
        const newPosition = coreRef.current.calculateDragPosition(
          mousePositionX,
          mousePositionY,
          mx,
          my
        )

        onPositionChange?.(newPosition)

        const updatedImageState = { ...imageState, ...newPosition }
        coreRef.current.setImageState(updatedImageState)
        setImageState(updatedImageState)
      }

      onMouseMove?.(e)
    },
    [drag, mx, my, imageState, onPositionChange, onMouseMove]
  )

  // Expose imperative methods via ref
  useImperativeHandle(
    ref,
    () => ({
      getImage: () => coreRef.current.getImage(),
      getImageScaledToCanvas: () => coreRef.current.getImageScaledToCanvas(),
    }),
    []
  )

  // Mount effect - load image and setup event listeners
  useEffect(() => {
    const context = getContext()

    if (image) {
      loadImage(image)
    }
    coreRef.current.paint(context)

    const options = isPassiveSupported() ? { passive: false } : false
    document.addEventListener('mousemove', handleMouseMove, options)
    document.addEventListener('mouseup', handleMouseUp, options)

    if (isTouchDevice) {
      document.addEventListener('touchmove', handleMouseMove, options)
      document.addEventListener('touchend', handleMouseUp, options)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, false)
      document.removeEventListener('mouseup', handleMouseUp, false)

      if (isTouchDevice) {
        document.removeEventListener('touchmove', handleMouseMove, false)
        document.removeEventListener('touchend', handleMouseUp, false)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to handle image changes
  useEffect(() => {
    if (image) {
      loadImage(image)
    } else if (!image && imageState.x !== 0.5 && imageState.y !== 0.5) {
      clearImage()
    }
  }, [image, width, height, backgroundColor]) // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to repaint canvas whenever relevant props/state change
  useEffect(() => {
    repaint()
  }, [repaint])

  // Effect to trigger onImageChange callback
  const prevPropsRef = useRef({
    image,
    width,
    height,
    position,
    scale,
    rotate,
    mx,
    my,
    imageX: imageState.x,
    imageY: imageState.y,
  })
  useEffect(() => {
    const prev = prevPropsRef.current
    if (
      prev.image !== image ||
      prev.width !== width ||
      prev.height !== height ||
      prev.position !== position ||
      prev.scale !== scale ||
      prev.rotate !== rotate ||
      prev.mx !== mx ||
      prev.my !== my ||
      prev.imageX !== imageState.x ||
      prev.imageY !== imageState.y
    ) {
      onImageChange?.()
      prevPropsRef.current = {
        image,
        width,
        height,
        position,
        scale,
        rotate,
        mx,
        my,
        imageX: imageState.x,
        imageY: imageState.y,
      }
    }
  }, [image, width, height, position, scale, rotate, mx, my, imageState.x, imageState.y, onImageChange])

  const dimensions = coreRef.current.getDimensions()
  const pixelRatio = coreRef.current.getPixelRatio()

  const defaultStyle: CSSProperties = {
    width: dimensions.canvas.width,
    height: dimensions.canvas.height,
    cursor: drag ? 'grabbing' : 'grab',
    touchAction: 'none',
  }

  const attributes: JSX.IntrinsicElements['canvas'] = {
    width: dimensions.canvas.width * pixelRatio,
    height: dimensions.canvas.height * pixelRatio,
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    style: { ...defaultStyle, ...style },
  }

  return React.createElement('canvas', {
    ...attributes,
    ...rest,
    ref: canvas,
  })
})

AvatarEditor.displayName = 'AvatarEditor'

export default AvatarEditor
