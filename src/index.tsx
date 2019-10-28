import * as React from 'react'
import loadImageURL from './utils/load-image-url'
import loadImageFile from './utils/load-image-file'
import toRadians from './utils/to-radians'
import { DraggableCore, DraggableEvent, DraggableData } from 'react-draggable'

type BorderType = [number, number] | number

interface IAvatarEditorProps {
  scale: number
  rotate: number
  image: string | File
  border: BorderType
  borderRadius: number
  style: any
  width: number
  height: number
  position: IPosition
  color: ReadonlyArray<number>
  crossOrigin: '' | 'anonymous' | 'use-credentials'
  onLoadFailure: () => void
  onLoadSuccess: (image: IImageState) => void
  onImageReady: () => void
  onImageChange: () => void
  onMouseUp: () => void
  onMouseMove: (e: React.TouchEvent | React.MouseEvent) => void
  onPositionChange: (position: IPosition) => void
  disableBoundaryChecks: boolean
  disableHiDPIScaling: boolean
}

interface IPosition {
  x: number
  y: number
}

interface IImageState {
  x: number
  y: number
  width: number
  height: number
  resource?: HTMLImageElement
}

interface IAvatarEditorState {
  dragging: boolean
  image: IImageState
}

const isFileAPISupported = typeof File !== 'undefined'
const defaultPixelRatio =
  typeof window !== 'undefined' && window.devicePixelRatio
    ? window.devicePixelRatio
    : 1

// Draws a rounded rectangle on a 2D context.
const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  borderRadius: number
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
      Math.PI * 1.5
    )
    context.lineTo(widthMinusRad, 0)
    context.arc(
      widthMinusRad,
      borderRadius,
      borderRadius,
      Math.PI * 1.5,
      Math.PI * 2
    )
    context.lineTo(width, heightMinusRad)
    context.arc(
      widthMinusRad,
      heightMinusRad,
      borderRadius,
      Math.PI * 2,
      Math.PI * 0.5
    )
    context.lineTo(borderRadius, height)
    context.arc(
      borderRadius,
      heightMinusRad,
      borderRadius,
      Math.PI * 0.5,
      Math.PI
    )
    context.translate(-x, -y)
  }
}

const defaultEmptyImage = {
  x: 0.5,
  y: 0.5,
  width: 0,
  height: 0,
}

class AvatarEditor extends React.Component<
  IAvatarEditorProps,
  IAvatarEditorState
> {
  static defaultProps = {
    scale: 1,
    rotate: 0,
    border: 25,
    borderRadius: 0,
    width: 200,
    height: 200,
    color: [0, 0, 0, 0.5],
    onLoadFailure() {},
    onLoadSuccess() {},
    onImageReady() {},
    onImageChange() {},
    onMouseUp() {},
    onMouseMove() {},
    onPositionChange() {},
    disableBoundaryChecks: false,
    disableHiDPIScaling: false,
  }

  private canvas: React.RefObject<HTMLCanvasElement>
  private pixelRatio = defaultPixelRatio

  constructor(props: IAvatarEditorProps) {
    super(props)
    this.state = {
      dragging: false,
      image: defaultEmptyImage,
    }
    this.canvas = React.createRef()
    this.pixelRatio = props.disableHiDPIScaling ? 1 : defaultPixelRatio
  }

  componentDidMount() {
    this.loadImage()
    const context = this.getContext()
    this.paint(context)
  }

  componentDidUpdate(
    prevProps: IAvatarEditorProps,
    prevState: IAvatarEditorState
  ) {
    if (
      (this.props.image && this.props.image !== prevProps.image) ||
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this.loadImage()
    } else if (!this.props.image) {
      this.clearImage()
    }

    const canvas = this.getCanvas()
    const context = this.getContext()
    context.clearRect(0, 0, canvas.width, canvas.height)
    this.paint(context)
    this.paintImage(context, this.state.image, this.props.border)

    if (
      prevProps.image !== this.props.image ||
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height ||
      prevProps.position !== this.props.position ||
      prevProps.scale !== this.props.scale ||
      prevProps.rotate !== this.props.rotate ||
      prevState.image.x !== this.state.image.x ||
      prevState.image.y !== this.state.image.y
    ) {
      this.props.onImageChange()
    }
  }

  private getCanvas(): HTMLCanvasElement {
    if (!this.canvas.current) {
      throw new Error(
        'No canvas found, please report this to: https://github.com/mosch/react-avatar-editor/issues'
      )
    }

    return this.canvas.current
  }

  private getContext() {
    const context = this.getCanvas().getContext('2d')
    if (!context) {
      throw new Error(
        ' No context found, please report this to: https://github.com/mosch/react-avatar-editor/issues'
      )
    }

    return context
  }

  private isVertical() {
    return this.props.rotate % 180 !== 0
  }

  private getBorders(border = this.props.border) {
    return Array.isArray(border) ? border : [border, border]
  }

  private getDimensions() {
    const { width, height, rotate, border } = this.props
    const [borderX, borderY] = this.getBorders(border)
    const canvas = this.isVertical()
      ? { width: height + borderX * 2, height: width + borderY * 2 }
      : {
          width: width + borderX * 2,
          height: height + borderY * 2,
        }

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

    // create a canvas with the correct dimensions
    const canvas = document.createElement('canvas')

    if (image.resource) {
      // get actual pixel coordinates
      const actualCropRect = {
        ...cropRect,
        x: cropRect.x * image.resource.width,
        y: cropRect.y * image.resource.height,
        width: cropRect.width * image.resource.width,
        height: cropRect.height * image.resource.height,
      }

      if (this.isVertical()) {
        canvas.width = actualCropRect.height
        canvas.height = actualCropRect.width
      } else {
        canvas.width = actualCropRect.width
        canvas.height = actualCropRect.height
      }

      // draw the full-size image at the correct position,
      // the image gets truncated to the size of the canvas.
      const context = canvas.getContext('2d')
      if (context) {
        context.translate(canvas.width / 2, canvas.height / 2)
        context.rotate((this.props.rotate * Math.PI) / 180)
        context.translate(-(canvas.width / 2), -(canvas.height / 2))

        if (this.isVertical()) {
          context.translate(
            (canvas.width - canvas.height) / 2,
            (canvas.height - canvas.width) / 2
          )
        }

        context.drawImage(image.resource, -cropRect.x, -cropRect.y)
      }
    }

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

    const context = canvas.getContext('2d')
    if (context) {
      // don't paint a border here, as it is the resulting image
      this.paintImage(context, this.state.image, 0, 1)
    }

    return canvas
  }

  private getXScale() {
    const canvasAspect = this.props.width / this.props.height
    const imageAspect = this.state.image.width / this.state.image.height

    return Math.min(1, canvasAspect / imageAspect)
  }

  private getYScale() {
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

  private loadImage() {
    const {
      image,
      onLoadFailure,
      onImageReady,
      onLoadSuccess,
      crossOrigin,
    } = this.props

    const handleImageReady = (image: HTMLImageElement) => {
      const imageState = {
        ...this.getInitialSize(image.width, image.height),
        resource: image,
        x: 0.5,
        y: 0.5,
      }

      this.setState({ image: imageState }, onImageReady)
      onLoadSuccess(imageState)
    }

    if (isFileAPISupported && image instanceof File) {
      loadImageFile(image)
        .then(handleImageReady)
        .catch(onLoadFailure)
    } else if (typeof image === 'string') {
      loadImageURL(image, crossOrigin)
        .then(handleImageReady)
        .catch(onLoadFailure)
    }
  }

  private getInitialSize(width: number, height: number) {
    const dimensions = this.getDimensions()
    const canvasRatio = dimensions.height / dimensions.width
    const imageRatio = height / width

    if (canvasRatio > imageRatio) {
      return {
        height: dimensions.height,
        width: width * (dimensions.height / height),
      }
    } else {
      return {
        width: dimensions.width,
        height: height * (dimensions.width / width),
      }
    }
  }

  private clearImage = () => {
    const canvas = this.getCanvas()
    const context = this.getContext()
    context.clearRect(0, 0, canvas.width, canvas.height)
    this.setState({
      image: defaultEmptyImage,
    })
  }

  private paintImage(
    context: CanvasRenderingContext2D,
    image: IImageState,
    border: BorderType,
    scaleFactor = defaultPixelRatio
  ) {
    if (image.resource) {
      const position = this.calculatePosition(image, border)
      const { x, y } = this.getCroppingRect()

      context.fillStyle = 'red'
      context.fillRect(x, y, 3, 3)

      context.save()

      context.translate(context.canvas.width / 2, context.canvas.height / 2)
      context.rotate((this.props.rotate * Math.PI) / 180)
      context.translate(
        -(context.canvas.width / 2),
        -(context.canvas.height / 2)
      )

      if (this.isVertical()) {
        context.translate(
          (context.canvas.width - context.canvas.height) / 2,
          (context.canvas.height - context.canvas.width) / 2
        )
      }

      context.scale(scaleFactor, scaleFactor)

      context.globalCompositeOperation = 'destination-over'
      context.drawImage(
        image.resource,
        position.x,
        position.y,
        position.width,
        position.height
      )

      context.restore()
    }
  }

  private calculatePosition(image: IImageState, border: BorderType) {
    const [borderX, borderY] = this.getBorders(border)

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

    return {
      x,
      y,
      height,
      width,
    }
  }

  private paint(context: CanvasRenderingContext2D) {
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
      height / 2 - borderSizeY
    )

    context.beginPath()
    // inner rect, possibly rounded
    drawRoundedRect(
      context,
      borderSizeX,
      borderSizeY,
      width - borderSizeX * 2,
      height - borderSizeY * 2,
      borderRadius
    )
    context.rect(width, 0, -width, height) // outer rect, drawn "counterclockwise"
    context.fill('evenodd')

    context.restore()
  }

  private handleDrag = (_: DraggableEvent, data: DraggableData) => {
    const { deltaX, deltaY } = data
    const { rotate, scale, onPositionChange } = this.props
    const { image } = this.state

    const nextRotate = rotate % 360 < 0 ? rotate + 360 : rotate % 360
    const width = image.width * scale
    const height = image.height * scale

    const { x: lastX, y: lastY } = this.getCroppingRect()

    const cos = Math.cos(toRadians(nextRotate))
    const sin = Math.sin(toRadians(nextRotate))

    const x = lastX * width + -deltaX * cos + deltaY * sin
    const y = lastY * height + deltaX * sin + -deltaY * cos

    const relativeWidth = (1 / scale) * this.getXScale()
    const relativeHeight = (1 / scale) * this.getYScale()

    const position = {
      x: x / width + relativeWidth / 2,
      y: y / height + relativeHeight / 2,
    }

    onPositionChange(position)

    this.setState({
      image: {
        ...this.state.image,
        ...position,
      },
    })
  }

  private handleStartDrag = () => this.setState({ dragging: true })
  private handleStopDrag = () => this.setState({ dragging: false })

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
      ...rest
    } = this.props

    const dimensions = this.getDimensions()
    const defaultStyle = {
      width: dimensions.canvas.width,
      height: dimensions.canvas.height,
      cursor: this.state.dragging ? 'grabbing' : 'grab',
      touchAction: 'none',
    }

    const attributes = {
      width: dimensions.canvas.width * this.pixelRatio,
      height: dimensions.canvas.height * this.pixelRatio,
      style: {
        ...defaultStyle,
        ...style,
      },
    }

    return (
      <DraggableCore
        onStart={this.handleStartDrag}
        onStop={this.handleStopDrag}
        onDrag={this.handleDrag}
      >
        <canvas ref={this.canvas} {...attributes} {...rest} />
      </DraggableCore>
    )
  }
}

export default AvatarEditor
