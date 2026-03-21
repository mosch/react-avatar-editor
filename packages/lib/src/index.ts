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

  // Use refs for drag state to avoid stale closures in document-level listeners.
  // These values are read/written in handlers registered once on mount.
  const dragRef = useRef(false)
  const mxRef = useRef<number | undefined>(undefined)
  const myRef = useRef<number | undefined>(undefined)

  // Keep state for `drag` to trigger re-renders for cursor style
  const [drag, setDrag] = useState(false)
  const [imageState, setImageState] = useState<ImageState>(coreRef.current.getImageState())

  // Store latest callback props in refs so document handlers always call current versions
  const onMouseUpRef = useRef(onMouseUp)
  onMouseUpRef.current = onMouseUp
  const onMouseMoveRef = useRef(onMouseMove)
  onMouseMoveRef.current = onMouseMove
  const onPositionChangeRef = useRef(onPositionChange)
  onPositionChangeRef.current = onPositionChange

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
        dragRef.current = false
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
    dragRef.current = true
    mxRef.current = undefined
    myRef.current = undefined
    setDrag(true)
  }, [])

  const handleTouchStart: TouchEventHandler<HTMLCanvasElement> = useCallback(() => {
    dragRef.current = true
    mxRef.current = undefined
    myRef.current = undefined
    setDrag(true)
  }, [])

  // Expose imperative methods via ref
  useImperativeHandle(
    ref,
    () => ({
      getImage: () => coreRef.current.getImage(),
      getImageScaledToCanvas: () => coreRef.current.getImageScaledToCanvas(),
    }),
    []
  )

  // Mount effect - setup document-level event listeners.
  // Handlers read from refs (not closures) to always have current values.
  useEffect(() => {
    const context = getContext()

    if (image) {
      loadImage(image)
    }
    coreRef.current.paint(context)

    const handleDocumentMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) {
        return
      }

      e.preventDefault()

      const mousePositionX =
        'targetTouches' in e ? e.targetTouches[0].pageX : e.clientX
      const mousePositionY =
        'targetTouches' in e ? e.targetTouches[0].pageY : e.clientY

      const prevMx = mxRef.current
      const prevMy = myRef.current

      mxRef.current = mousePositionX
      myRef.current = mousePositionY

      if (prevMx !== undefined && prevMy !== undefined) {
        const currentImageState = coreRef.current.getImageState()
        if (currentImageState.width && currentImageState.height) {
          const newPosition = coreRef.current.calculateDragPosition(
            mousePositionX,
            mousePositionY,
            prevMx,
            prevMy,
          )

          onPositionChangeRef.current?.(newPosition)

          const updatedImageState = { ...currentImageState, ...newPosition }
          coreRef.current.setImageState(updatedImageState)
          setImageState(updatedImageState)
        }
      }

      onMouseMoveRef.current?.(e)
    }

    const handleDocumentMouseUp = () => {
      if (dragRef.current) {
        dragRef.current = false
        setDrag(false)
        onMouseUpRef.current?.()
      }
    }

    const options = isPassiveSupported() ? { passive: false } : false
    document.addEventListener('mousemove', handleDocumentMouseMove, options)
    document.addEventListener('mouseup', handleDocumentMouseUp, options)

    if (isTouchDevice) {
      document.addEventListener('touchmove', handleDocumentMouseMove, options)
      document.addEventListener('touchend', handleDocumentMouseUp, options)
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove, false)
      document.removeEventListener('mouseup', handleDocumentMouseUp, false)

      if (isTouchDevice) {
        document.removeEventListener('touchmove', handleDocumentMouseMove, false)
        document.removeEventListener('touchend', handleDocumentMouseUp, false)
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
        imageX: imageState.x,
        imageY: imageState.y,
      }
    }
  }, [image, width, height, position, scale, rotate, imageState.x, imageState.y, onImageChange])

  const dimensions = coreRef.current.getDimensions()
  const pixelRatio = coreRef.current.getPixelRatio()

  const defaultStyle: CSSProperties = {
    width: dimensions.canvas.width,
    height: dimensions.canvas.height,
    cursor: drag ? 'grabbing' : 'grab',
    touchAction: 'none',
    // Prevent CSS resets (common in Next.js/Tailwind) from shrinking the
    // canvas when devicePixelRatio > 1 (e.g. Windows display scaling > 100%)
    maxWidth: 'none',
    maxHeight: 'none',
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
