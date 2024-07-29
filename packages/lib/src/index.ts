import React, {
  type TouchEventHandler,
  type CSSProperties,
  type MouseEventHandler,
} from 'react'

import { loadImageURL } from './utils/loadImageURL'
import { loadImageFile } from './utils/loadImageFile'
import { isPassiveSupported } from './utils/isPassiveSupported'
import { isTouchDevice } from './utils/isTouchDevice'
import { isFileAPISupported } from './utils/isFileAPISupported'

// Draws a rounded rectangle on a 2D context.
const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  borderRadius: number,
) => {
  if (borderRadius === 0) {
    context.rect(x, y, width, height)
  } else {
    const widthMinusRad = width - borderRadius
    const heightMinusRad = height - borderRadius
    context.translate(x, y)
    context.arc(
      borderRadius,
      borderRadius,
      borderRadius,
      Math.PI,
      Math.PI * 1.5,
    )
    context.lineTo(widthMinusRad, 0)
    context.arc(
      widthMinusRad,
      borderRadius,
      borderRadius,
      Math.PI * 1.5,
      Math.PI * 2,
    )
    context.lineTo(width, heightMinusRad)
    context.arc(
      widthMinusRad,
      heightMinusRad,
      borderRadius,
      Math.PI * 2,
      Math.PI * 0.5,
    )
    context.lineTo(borderRadius, height)
    context.arc(
      borderRadius,
      heightMinusRad,
      borderRadius,
      Math.PI * 0.5,
      Math.PI,
    )
    context.closePath()
    context.translate(-x, -y)
  }
}

// Draws a "Rule of Three" grid on the canvas.
const drawGrid = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  gridColor: string,
) => {
  context.fillStyle = gridColor
  const thirdsX = width / 3
  const thirdsY = height / 3

  // vertical bars
  context.fillRect(x, y, 1, height)
  context.fillRect(thirdsX + x, y, 1, height)
  context.fillRect(thirdsX * 2 + x, y, 1, height)
  context.fillRect(thirdsX * 3 + x, y, 1, height)
  context.fillRect(thirdsX * 4 + x, y, 1, height)

  // horizontal bars
  context.fillRect(x, y, width, 1)
  context.fillRect(x, thirdsY + y, width, 1)
  context.fillRect(x, thirdsY * 2 + y, width, 1)
  context.fillRect(x, thirdsY * 3 + y, width, 1)
  context.fillRect(x, thirdsY * 4 + y, width, 1)
}

const defaultEmptyImage = {
  x: 0.5,
  y: 0.5,
}

type BorderType = [number, number] | number

interface ImageState {
  x: number
  y: number
  width?: number
  height?: number
  resource?: HTMLImageElement
}

export interface Props {
  width: number
  height: number
  style?: CSSProperties
  image?: string | File
  border?: BorderType
  position?: Position
  scale?: number
  rotate?: number
  borderRadius?: number
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  onLoadFailure?: () => void
  onLoadSuccess?: (image: ImageState) => void
  onImageReady?: () => void
  onImageChange?: () => void
  onMouseUp?: () => void
  onMouseMove?: (e: TouchEvent | MouseEvent) => void
  onPositionChange?: (position: Position) => void
  color?: [number, number, number, number?]
  backgroundColor?: string
  disableBoundaryChecks?: boolean
  disableHiDPIScaling?: boolean
  disableCanvasRotation?: boolean
  borderColor?: [number, number, number, number?]
}

export interface Position {
  x: number
  y: number
}

interface State {
  drag: boolean
  mx?: number
  my?: number
  image: ImageState
}

type PropsWithDefaults = typeof AvatarEditor.defaultProps &
  Omit<Props, keyof typeof AvatarEditor.defaultProps>

class AvatarEditor extends React.Component<PropsWithDefaults, State> {
  private canvas = React.createRef<HTMLCanvasElement>()
  private pixelRatio =
    typeof window !== 'undefined' && window.devicePixelRatio
      ? window.devicePixelRatio
      : 1

  static defaultProps = {
    scale: 1,
    rotate: 0,
    border: 25,
    borderRadius: 0,
    width: 200,
    height: 200,
    color: [0, 0, 0, 0.5],
    showGrid: false,
    gridColor: '#666',
    disableBoundaryChecks: false,
    disableHiDPIScaling: false,
    disableCanvasRotation: true,
  }

  state: State = {
    drag: false,
    my: undefined,
    mx: undefined,
    image: defaultEmptyImage,
  }

  componentDidMount() {
    // scaling by the devicePixelRatio can impact performance on mobile as it creates a very large canvas.
    // This is an override to increase performance.
    if (this.props.disableHiDPIScaling) {
      this.pixelRatio = 1
    }
    const context = this.getContext()

    if (this.props.image) {
      this.loadImage(this.props.image)
    }
    this.paint(context)

    const options = isPassiveSupported() ? { passive: false } : false
    document.addEventListener('mousemove', this.handleMouseMove, options)
    document.addEventListener('mouseup', this.handleMouseUp, options)

    if (isTouchDevice) {
      document.addEventListener('touchmove', this.handleMouseMove, options)
      document.addEventListener('touchend', this.handleMouseUp, options)
    }
  }

  componentDidUpdate(prevProps: PropsWithDefaults, prevState: State) {
    if (
      this.props.image &&
      (this.props.image !== prevProps.image ||
        this.props.width !== prevProps.width ||
        this.props.height !== prevProps.height ||
        this.props.backgroundColor !== prevProps.backgroundColor)
    ) {
      this.loadImage(this.props.image)
    } else if (!this.props.image && prevState.image !== defaultEmptyImage) {
      this.clearImage()
    }

    const context = this.getContext()
    context.clearRect(0, 0, this.getCanvas().width, this.getCanvas().height)
    this.paint(context)
    this.paintImage(context, this.state.image, this.props.border)

    if (
      prevProps.image !== this.props.image ||
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height ||
      prevProps.position !== this.props.position ||
      prevProps.scale !== this.props.scale ||
      prevProps.rotate !== this.props.rotate ||
      prevState.my !== this.state.my ||
      prevState.mx !== this.state.mx ||
      prevState.image.x !== this.state.image.x ||
      prevState.image.y !== this.state.image.y
    ) {
      this.props.onImageChange?.()
    }
  }

  private getCanvas(): HTMLCanvasElement {
    if (!this.canvas.current) {
      throw new Error(
        'No canvas found, please report this to: https://github.com/mosch/react-avatar-editor/issues',
      )
    }

    return this.canvas.current
  }

  private getContext() {
    const context = this.getCanvas().getContext('2d')
    if (!context) {
      throw new Error(
        'No context found, please report this to: https://github.com/mosch/react-avatar-editor/issues',
      )
    }

    return context
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove, false)
    document.removeEventListener('mouseup', this.handleMouseUp, false)

    if (isTouchDevice) {
      document.removeEventListener('touchmove', this.handleMouseMove, false)
      document.removeEventListener('touchend', this.handleMouseUp, false)
    }
  }

  isVertical() {
    return !this.props.disableCanvasRotation && this.props.rotate % 180 !== 0
  }

  getBorders(border = this.props.border) {
    return Array.isArray(border) ? border : [border, border]
  }

  getDimensions() {
    const { width, height, rotate, border } = this.props

    const canvas = { width: 0, height: 0 }

    const [borderX, borderY] = this.getBorders(border)

    if (this.isVertical()) {
      canvas.width = height
      canvas.height = width
    } else {
      canvas.width = width
      canvas.height = height
    }

    canvas.width += borderX * 2
    canvas.height += borderY * 2

    return {
      canvas,
      rotate,
      width,
      height,
      border,
    }
  }

  getImage() {
    // get relative coordinates (0 to 1)
    const cropRect = this.getCroppingRect()
    const image = this.state.image

    if (!image.resource) {
      throw new Error(
        'No image resource available, please report this to: https://github.com/mosch/react-avatar-editor/issues',
      )
    }

    // get actual pixel coordinates
    cropRect.x *= image.resource.width
    cropRect.y *= image.resource.height
    cropRect.width *= image.resource.width
    cropRect.height *= image.resource.height

    // create a canvas with the correct dimensions
    const canvas = document.createElement('canvas')

    if (this.isVertical()) {
      canvas.width = cropRect.height
      canvas.height = cropRect.width
    } else {
      canvas.width = cropRect.width
      canvas.height = cropRect.height
    }

    // draw the full-size image at the correct position,
    // the image gets truncated to the size of the canvas.
    const context = this.getContext()

    context.translate(canvas.width / 2, canvas.height / 2)
    context.rotate((this.props.rotate * Math.PI) / 180)
    context.translate(-(canvas.width / 2), -(canvas.height / 2))

    if (this.isVertical()) {
      context.translate(
        (canvas.width - canvas.height) / 2,
        (canvas.height - canvas.width) / 2,
      )
    }

    if (this.props.backgroundColor) {
      context.fillStyle = this.props.backgroundColor
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    context.drawImage(image.resource, -cropRect.x, -cropRect.y)

    return canvas
  }

  /**
   * Get the image scaled to original canvas size.
   * This was default in 4.x and is now kept as a legacy method.
   */
  getImageScaledToCanvas() {
    const { width, height } = this.getDimensions()

    const canvas = document.createElement('canvas')

    if (this.isVertical()) {
      canvas.width = height
      canvas.height = width
    } else {
      canvas.width = width
      canvas.height = height
    }

    // don't paint a border here, as it is the resulting image
    this.paintImage(canvas.getContext('2d')!, this.state.image, 0, 1)

    return canvas
  }

  getXScale() {
    if (!this.state.image.width || !this.state.image.height)
      throw new Error('Image dimension is unknown.')

    const canvasAspect = this.props.width / this.props.height
    const imageAspect = this.state.image.width / this.state.image.height

    return Math.min(1, canvasAspect / imageAspect)
  }

  getYScale() {
    if (!this.state.image.width || !this.state.image.height)
      throw new Error('Image dimension is unknown.')

    const canvasAspect = this.props.height / this.props.width
    const imageAspect = this.state.image.height / this.state.image.width

    return Math.min(1, canvasAspect / imageAspect)
  }

  getCroppingRect() {
    const position = this.props.position || {
      x: this.state.image.x,
      y: this.state.image.y,
    }
    const width = (1 / this.props.scale) * this.getXScale()
    const height = (1 / this.props.scale) * this.getYScale()

    const croppingRect = {
      x: position.x - width / 2,
      y: position.y - height / 2,
      width,
      height,
    }

    let xMin = 0
    let xMax = 1 - croppingRect.width
    let yMin = 0
    let yMax = 1 - croppingRect.height

    // If the cropping rect is larger than the image, then we need to change
    // our maxima & minima for x & y to allow the image to appear anywhere up
    // to the very edge of the cropping rect.
    const isLargerThanImage =
      this.props.disableBoundaryChecks || width > 1 || height > 1

    if (isLargerThanImage) {
      xMin = -croppingRect.width
      xMax = 1
      yMin = -croppingRect.height
      yMax = 1
    }

    return {
      ...croppingRect,
      x: Math.max(xMin, Math.min(croppingRect.x, xMax)),
      y: Math.max(yMin, Math.min(croppingRect.y, yMax)),
    }
  }

  async loadImage(file: File | string) {
    if (isFileAPISupported && file instanceof File) {
      try {
        const image = await loadImageFile(file)
        this.handleImageReady(image)
      } catch (error) {
        this.props.onLoadFailure?.()
      }
    } else if (typeof file === 'string') {
      try {
        const image = await loadImageURL(file, this.props.crossOrigin)
        this.handleImageReady(image)
      } catch {
        this.props.onLoadFailure?.()
      }
    }
  }

  handleImageReady = (image: HTMLImageElement) => {
    const imageState: ImageState = {
      ...this.getInitialSize(image.width, image.height),
      resource: image,
      x: 0.5,
      y: 0.5,
    }

    this.setState({ drag: false, image: imageState }, this.props.onImageReady)
    this.props.onLoadSuccess?.(imageState)
  }

  getInitialSize(width: number, height: number) {
    let newHeight: number
    let newWidth: number

    const dimensions = this.getDimensions()
    const canvasRatio = dimensions.height / dimensions.width
    const imageRatio = height / width

    if (canvasRatio > imageRatio) {
      newHeight = dimensions.height
      newWidth = width * (newHeight / height)
    } else {
      newWidth = dimensions.width
      newHeight = height * (newWidth / width)
    }

    return {
      height: newHeight,
      width: newWidth,
    }
  }

  clearImage = () => {
    const canvas = this.getCanvas()
    const context = this.getContext()

    context.clearRect(0, 0, canvas.width, canvas.height)
    this.setState({ image: defaultEmptyImage })
  }

  paintImage(
    context: CanvasRenderingContext2D,
    image: ImageState,
    border: number,
    scaleFactor = this.pixelRatio,
  ) {
    if (!image.resource) return

    const position = this.calculatePosition(image, border)

    context.save()

    context.translate(context.canvas.width / 2, context.canvas.height / 2)
    context.rotate((this.props.rotate * Math.PI) / 180)
    context.translate(-(context.canvas.width / 2), -(context.canvas.height / 2))

    if (this.isVertical()) {
      context.translate(
        (context.canvas.width - context.canvas.height) / 2,
        (context.canvas.height - context.canvas.width) / 2,
      )
    }

    context.scale(scaleFactor, scaleFactor)

    context.globalCompositeOperation = 'destination-over'
    context.drawImage(
      image.resource,
      position.x,
      position.y,
      position.width,
      position.height,
    )

    if (this.props.backgroundColor) {
      context.fillStyle = this.props.backgroundColor
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)
    }

    context.restore()
  }

  calculatePosition(image = this.state.image, border?: number) {
    const [borderX, borderY] = this.getBorders(border)

    if (!image.width || !image.height) {
      throw new Error('Image dimension is unknown.')
    }

    const croppingRect = this.getCroppingRect()

    const width = image.width * this.props.scale
    const height = image.height * this.props.scale

    let x = -croppingRect.x * width
    let y = -croppingRect.y * height

    if (this.isVertical()) {
      x += borderY
      y += borderX
    } else {
      x += borderX
      y += borderY
    }

    return { x, y, height, width }
  }

  paint(context: CanvasRenderingContext2D) {
    context.save()
    context.scale(this.pixelRatio, this.pixelRatio)
    context.translate(0, 0)
    context.fillStyle = 'rgba(' + this.props.color.slice(0, 4).join(',') + ')'

    let borderRadius = this.props.borderRadius
    const dimensions = this.getDimensions()
    const [borderSizeX, borderSizeY] = this.getBorders(dimensions.border)
    const height = dimensions.canvas.height
    const width = dimensions.canvas.width

    // clamp border radius between zero (perfect rectangle) and half the size without borders (perfect circle or "pill")
    borderRadius = Math.max(borderRadius, 0)
    borderRadius = Math.min(
      borderRadius,
      width / 2 - borderSizeX,
      height / 2 - borderSizeY,
    )

    context.beginPath()
    // inner rect, possibly rounded
    drawRoundedRect(
      context,
      borderSizeX,
      borderSizeY,
      width - borderSizeX * 2,
      height - borderSizeY * 2,
      borderRadius,
    )
    context.rect(width, 0, -width, height) // outer rect, drawn "counterclockwise"
    context.fill('evenodd')

    // Draw 1px border around the mask only if borderColor is provided
    if (this.props.borderColor) {
      context.strokeStyle = 'rgba(' + this.props.borderColor.slice(0, 4).join(',') + ')'
      context.lineWidth = 1
      context.beginPath()
      drawRoundedRect(
        context,
        borderSizeX + 0.5,
        borderSizeY + 0.5,
        width - borderSizeX * 2 - 1,
        height - borderSizeY * 2 - 1,
        borderRadius,
      )
      context.stroke()
    }

    if (this.props.showGrid) {
      drawGrid(
        context,
        borderSizeX,
        borderSizeY,
        width - borderSizeX * 2,
        height - borderSizeY * 2,
        this.props.gridColor,
      )
    }
    context.restore()
  }

  handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (e) => {
    // if e is a touch event, preventDefault keeps
    // corresponding mouse events from also being fired
    // later.
    e.preventDefault()
    this.setState({ drag: true, mx: undefined, my: undefined })
  }

  handleTouchStart: TouchEventHandler<HTMLCanvasElement> = (e) => {
    // if e is a touch event, preventDefault keeps
    // corresponding mouse events from also being fired
    // later.
    this.setState({ drag: true, mx: undefined, my: undefined })
  }

  handleMouseUp = () => {
    if (this.state.drag) {
      this.setState({ drag: false })
      this.props.onMouseUp?.()
    }
  }

  handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!this.state.drag) {
      return
    }

    e.preventDefault() // stop scrolling on iOS Safari

    const mousePositionX =
      'targetTouches' in e ? e.targetTouches[0].pageX : e.clientX
    const mousePositionY =
      'targetTouches' in e ? e.targetTouches[0].pageY : e.clientY

    this.setState({ mx: mousePositionX, my: mousePositionY })

    let rotate = this.props.rotate

    rotate %= 360
    rotate = rotate < 0 ? rotate + 360 : rotate

    if (
      this.state.mx &&
      this.state.my &&
      this.state.image.width &&
      this.state.image.height
    ) {
      const mx = this.state.mx - mousePositionX
      const my = this.state.my - mousePositionY

      const width = this.state.image.width * this.props.scale
      const height = this.state.image.height * this.props.scale

      let { x: lastX, y: lastY } = this.getCroppingRect()

      lastX *= width
      lastY *= height

      // helpers to calculate vectors
      const toRadians = (degree: number) => degree * (Math.PI / 180)
      const cos = Math.cos(toRadians(rotate))
      const sin = Math.sin(toRadians(rotate))

      const x = lastX + mx * cos + my * sin
      const y = lastY + -mx * sin + my * cos

      const relativeWidth = (1 / this.props.scale) * this.getXScale()
      const relativeHeight = (1 / this.props.scale) * this.getYScale()

      const position = {
        x: x / width + relativeWidth / 2,
        y: y / height + relativeHeight / 2,
      }

      this.props.onPositionChange?.(position)

      this.setState({ image: { ...this.state.image, ...position } })
    }

    this.props.onMouseMove?.(e)
  }

  render() {
    const {
      scale,
      rotate,
      image,
      border,
      borderRadius,
      width,
      height,
      position,
      color,
      backgroundColor,
      style,
      crossOrigin,
      onLoadFailure,
      onLoadSuccess,
      onImageReady,
      onImageChange,
      onMouseUp,
      onMouseMove,
      onPositionChange,
      disableBoundaryChecks,
      disableHiDPIScaling,
      disableCanvasRotation,
      showGrid,
      gridColor,
      borderColor,
      ...rest
    } = this.props

    const dimensions = this.getDimensions()

    const defaultStyle: CSSProperties = {
      width: dimensions.canvas.width,
      height: dimensions.canvas.height,
      cursor: this.state.drag ? 'grabbing' : 'grab',
      touchAction: 'none',
    }

    const attributes: JSX.IntrinsicElements['canvas'] = {
      width: dimensions.canvas.width * this.pixelRatio,
      height: dimensions.canvas.height * this.pixelRatio,
      onMouseDown: this.handleMouseDown,
      onTouchStart: this.handleTouchStart,
      style: { ...defaultStyle, ...style },
    }

    return React.createElement('canvas', {
      ...attributes,
      ...rest,
      ref: this.canvas,
    })
  }
}

export default AvatarEditor
