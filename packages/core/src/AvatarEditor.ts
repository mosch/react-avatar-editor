import type {
  ImageState,
  Position,
  AvatarEditorConfig,
  Dimensions,
  CroppingRect,
} from './types'
import { drawRoundedRect } from './utils/drawRoundedRect'
import { drawGrid } from './utils/drawGrid'
import { loadImageURL } from './utils/loadImageURL'
import { loadImageFile } from './utils/loadImageFile'
import { isFileAPISupported } from './utils/isFileAPISupported'

const toRadians = (degree: number) => degree * (Math.PI / 180)

const defaultEmptyImage: ImageState = {
  x: 0.5,
  y: 0.5,
}

export class AvatarEditorCore {
  private config: Required<AvatarEditorConfig>
  private imageState: ImageState = defaultEmptyImage
  private pixelRatio: number

  constructor(config: AvatarEditorConfig) {
    this.config = {
      border: 25,
      borderRadius: 0,
      scale: 1,
      rotate: 0,
      color: [0, 0, 0, 0.5],
      backgroundColor: '',
      borderColor: undefined,
      showGrid: false,
      gridColor: '#666',
      disableBoundaryChecks: false,
      disableHiDPIScaling: false,
      disableCanvasRotation: true,
      crossOrigin: undefined,
      ...config,
    } as Required<AvatarEditorConfig>

    this.pixelRatio =
      typeof window !== 'undefined' &&
      window.devicePixelRatio &&
      !this.config.disableHiDPIScaling
        ? window.devicePixelRatio
        : 1
  }

  getPixelRatio(): number {
    return this.pixelRatio
  }

  getImageState(): ImageState {
    return this.imageState
  }

  setImageState(state: ImageState): void {
    this.imageState = state
  }

  updateConfig(config: Partial<AvatarEditorConfig>): void {
    this.config = { ...this.config, ...config } as Required<AvatarEditorConfig>
  }

  isVertical(): boolean {
    return !this.config.disableCanvasRotation && this.config.rotate % 180 !== 0
  }

  getBorders(border?: number | [number, number]): [number, number] {
    const b = border ?? this.config.border
    return Array.isArray(b) ? b : [b, b]
  }

  getDimensions(): Dimensions {
    const { width, height, rotate, border } = this.config
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

  getXScale(): number {
    if (!this.imageState.width || !this.imageState.height) {
      throw new Error('Image dimension is unknown.')
    }

    const canvasAspect = this.config.width / this.config.height
    const imageAspect = this.imageState.width / this.imageState.height

    return Math.min(1, canvasAspect / imageAspect)
  }

  getYScale(): number {
    if (!this.imageState.width || !this.imageState.height) {
      throw new Error('Image dimension is unknown.')
    }

    const canvasAspect = this.config.height / this.config.width
    const imageAspect = this.imageState.height / this.imageState.width

    return Math.min(1, canvasAspect / imageAspect)
  }

  getCroppingRect(position?: Position): CroppingRect {
    if (!this.imageState.width || !this.imageState.height) {
      return { x: 0, y: 0, width: 1, height: 1 }
    }

    const pos = position || {
      x: this.imageState.x,
      y: this.imageState.y,
    }
    const rectWidth = (1 / this.config.scale) * this.getXScale()
    const rectHeight = (1 / this.config.scale) * this.getYScale()

    const croppingRect = {
      x: pos.x - rectWidth / 2,
      y: pos.y - rectHeight / 2,
      width: rectWidth,
      height: rectHeight,
    }

    let xMin = 0
    let xMax = 1 - croppingRect.width
    let yMin = 0
    let yMax = 1 - croppingRect.height

    const isLargerThanImage =
      this.config.disableBoundaryChecks || rectWidth > 1 || rectHeight > 1

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

  getInitialSize(
    imgWidth: number,
    imgHeight: number,
  ): { width: number; height: number } {
    let newHeight: number
    let newWidth: number

    const dimensions = this.getDimensions()
    const canvasRatio = dimensions.height / dimensions.width
    const imageRatio = imgHeight / imgWidth

    if (canvasRatio > imageRatio) {
      newHeight = dimensions.height
      newWidth = imgWidth * (newHeight / imgHeight)
    } else {
      newWidth = dimensions.width
      newHeight = imgHeight * (newWidth / imgWidth)
    }

    return {
      height: newHeight,
      width: newWidth,
    }
  }

  async loadImage(file: File | string): Promise<ImageState> {
    let image: HTMLImageElement

    if (isFileAPISupported && file instanceof File) {
      image = await loadImageFile(file)
    } else if (typeof file === 'string') {
      image = await loadImageURL(file, this.config.crossOrigin)
    } else {
      throw new Error('Invalid image source')
    }

    const imageState: ImageState = {
      ...this.getInitialSize(image.width, image.height),
      resource: image,
      x: 0.5,
      y: 0.5,
    }

    this.imageState = imageState
    return imageState
  }

  clearImage(): void {
    this.imageState = defaultEmptyImage
  }

  calculatePosition(
    image = this.imageState,
    border?: number | [number, number],
  ): {
    x: number
    y: number
    width: number
    height: number
  } {
    const [borderX, borderY] = this.getBorders(border)

    if (!image.width || !image.height) {
      throw new Error('Image dimension is unknown.')
    }

    const croppingRect = this.getCroppingRect()

    const width = image.width * this.config.scale
    const height = image.height * this.config.scale

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

  paint(context: CanvasRenderingContext2D): void {
    context.save()
    context.scale(this.pixelRatio, this.pixelRatio)
    context.translate(0, 0)
    context.fillStyle = 'rgba(' + this.config.color.slice(0, 4).join(',') + ')'

    let borderRad = this.config.borderRadius
    const dimensions = this.getDimensions()
    const [borderSizeX, borderSizeY] = this.getBorders(dimensions.border)
    const h = dimensions.canvas.height
    const w = dimensions.canvas.width

    // clamp border radius between zero (perfect rectangle) and half the size without borders (perfect circle or "pill")
    borderRad = Math.max(borderRad, 0)
    borderRad = Math.min(borderRad, w / 2 - borderSizeX, h / 2 - borderSizeY)

    context.beginPath()
    // inner rect, possibly rounded
    drawRoundedRect(
      context,
      borderSizeX,
      borderSizeY,
      w - borderSizeX * 2,
      h - borderSizeY * 2,
      borderRad,
    )
    context.rect(w, 0, -w, h) // outer rect, drawn "counterclockwise"
    context.fill('evenodd')

    // Draw 1px border around the mask only if borderColor is provided
    if (this.config.borderColor) {
      context.strokeStyle =
        'rgba(' + this.config.borderColor.slice(0, 4).join(',') + ')'
      context.lineWidth = 1
      context.beginPath()
      drawRoundedRect(
        context,
        borderSizeX + 0.5,
        borderSizeY + 0.5,
        w - borderSizeX * 2 - 1,
        h - borderSizeY * 2 - 1,
        borderRad,
      )
      context.stroke()
    }

    if (this.config.showGrid) {
      drawGrid(
        context,
        borderSizeX,
        borderSizeY,
        w - borderSizeX * 2,
        h - borderSizeY * 2,
        this.config.gridColor,
      )
    }
    context.restore()
  }

  paintImage(
    context: CanvasRenderingContext2D,
    image: ImageState,
    borderValue: number | [number, number],
    scaleFactor = this.pixelRatio,
  ): void {
    if (!image.resource) return

    const pos = this.calculatePosition(image, borderValue)

    context.save()

    context.translate(context.canvas.width / 2, context.canvas.height / 2)
    context.rotate((this.config.rotate * Math.PI) / 180)
    context.translate(-(context.canvas.width / 2), -(context.canvas.height / 2))

    if (this.isVertical()) {
      context.translate(
        (context.canvas.width - context.canvas.height) / 2,
        (context.canvas.height - context.canvas.width) / 2,
      )
    }

    context.scale(scaleFactor, scaleFactor)

    context.globalCompositeOperation = 'destination-over'
    context.drawImage(image.resource, pos.x, pos.y, pos.width, pos.height)

    if (this.config.backgroundColor) {
      context.fillStyle = this.config.backgroundColor
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)
    }

    context.restore()
  }

  getImage(): HTMLCanvasElement {
    const cropRect = this.getCroppingRect()
    const image = this.imageState

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
    const canvasEl = document.createElement('canvas')

    if (this.isVertical()) {
      canvasEl.width = Math.round(cropRect.height)
      canvasEl.height = Math.round(cropRect.width)
    } else {
      canvasEl.width = Math.round(cropRect.width)
      canvasEl.height = Math.round(cropRect.height)
    }

    const context = canvasEl.getContext('2d')

    if (!context) {
      throw new Error(
        'No context found, please report this to: https://github.com/mosch/react-avatar-editor/issues',
      )
    }

    context.translate(canvasEl.width / 2, canvasEl.height / 2)
    context.rotate((this.config.rotate * Math.PI) / 180)
    context.translate(-(canvasEl.width / 2), -(canvasEl.height / 2))

    if (this.isVertical()) {
      context.translate(
        (canvasEl.width - canvasEl.height) / 2,
        (canvasEl.height - canvasEl.width) / 2,
      )
    }

    if (this.config.backgroundColor) {
      context.fillStyle = this.config.backgroundColor
      context.fillRect(0, 0, canvasEl.width, canvasEl.height)
    }

    context.drawImage(image.resource, -cropRect.x, -cropRect.y)

    return canvasEl
  }

  getImageScaledToCanvas(): HTMLCanvasElement {
    const dimensions = this.getDimensions()
    const canvasEl = document.createElement('canvas')

    if (this.isVertical()) {
      canvasEl.width = dimensions.height
      canvasEl.height = dimensions.width
    } else {
      canvasEl.width = dimensions.width
      canvasEl.height = dimensions.height
    }

    // don't paint a border here, as it is the resulting image
    this.paintImage(canvasEl.getContext('2d')!, this.imageState, 0, 1)

    return canvasEl
  }

  calculateDragPosition(
    mousePositionX: number,
    mousePositionY: number,
    lastMx: number,
    lastMy: number,
  ): Position {
    const deltaX = lastMx - mousePositionX
    const deltaY = lastMy - mousePositionY

    if (!this.imageState.width || !this.imageState.height) {
      throw new Error('Image dimension is unknown.')
    }

    const w = this.imageState.width * this.config.scale
    const h = this.imageState.height * this.config.scale

    let { x: lastX, y: lastY } = this.getCroppingRect()

    lastX *= w
    lastY *= h

    // helpers to calculate vectors
    let rot = this.config.rotate
    rot %= 360
    rot = rot < 0 ? rot + 360 : rot

    const cos = Math.cos(toRadians(rot))
    const sin = Math.sin(toRadians(rot))

    const x = lastX + deltaX * cos + deltaY * sin
    const y = lastY + -deltaX * sin + deltaY * cos

    const relativeWidth = (1 / this.config.scale) * this.getXScale()
    const relativeHeight = (1 / this.config.scale) * this.getYScale()

    return {
      x: x / w + relativeWidth / 2,
      y: y / h + relativeHeight / 2,
    }
  }
}
