import React from 'react'
import ReactDOM from 'react-dom'

const isTouchDevice = !!(
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
)

const draggableEvents = {
  touch: {
    react: {
      down: 'onTouchStart',
      mouseDown: 'onMouseDown',
      drag: 'onTouchMove',
      drop: 'onTouchEnd',
      move: 'onTouchMove',
      mouseMove: 'onMouseMove',
      up: 'onTouchEnd',
      mouseUp: 'onMouseUp'
    },
    native: {
      down: 'touchstart',
      mouseDown: 'mousedown',
      drag: 'touchmove',
      drop: 'touchend',
      move: 'touchmove',
      mouseMove: 'mousemove',
      up: 'touchend',
      mouseUp: 'mouseup'
    }
  },
  desktop: {
    react: {
      down: 'onMouseDown',
      drag: 'onDragOver',
      drop: 'onDrop',
      move: 'onMouseMove',
      up: 'onMouseUp'
    },
    native: {
      down: 'mousedown',
      drag: 'dragStart',
      drop: 'drop',
      move: 'mousemove',
      up: 'mouseup'
    }
  }
}
const deviceEvents = isTouchDevice ? draggableEvents.touch : draggableEvents.desktop

// Draws a rounded rectangle on a 2D context.
const drawRoundedRect = (context, x, y, width, height, borderRadius) => {
  if (borderRadius === 0) {
    context.rect(x, y, width, height)
  } else {
    const widthMinusRad = width - borderRadius
    const heightMinusRad = height - borderRadius
    context.translate(x, y)
    context.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5)
    context.lineTo(widthMinusRad, 0)
    context.arc(widthMinusRad, borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2)
    context.lineTo(width, heightMinusRad)
    context.arc(widthMinusRad, heightMinusRad, borderRadius, Math.PI * 2, Math.PI * 0.5)
    context.lineTo(borderRadius, height)
    context.arc(borderRadius, heightMinusRad, borderRadius, Math.PI * 0.5, Math.PI)
    context.translate(-x, -y)
  }
}

// Define global variables for standard.js
/* global Image, FileReader */
class AvatarEditor extends React.Component {
  static propTypes = {
    scale: React.PropTypes.number,
    rotate: React.PropTypes.number,
    image: React.PropTypes.string,
    border: React.PropTypes.number,
    borderRadius: React.PropTypes.number,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    position: React.PropTypes.shape({
        x: React.PropTypes.number,
        y: React.PropTypes.number
    }),
    color: React.PropTypes.arrayOf(React.PropTypes.number),
    style: React.PropTypes.object,
    crossOrigin: React.PropTypes.oneOf(['', 'anonymous', 'use-credentials']),

    onDropFile: React.PropTypes.func,
    onLoadFailure: React.PropTypes.func,
    onLoadSuccess: React.PropTypes.func,
    onImageReady: React.PropTypes.func,
    onImageChange: React.PropTypes.func,
    onMouseUp: React.PropTypes.func,
    onMouseMove: React.PropTypes.func,
    onPositionChange: React.PropTypes.func
  }

  static defaultProps = {
    scale: 1,
    rotate: 0,
    border: 25,
    borderRadius: 0,
    width: 200,
    height: 200,
    color: [0, 0, 0, 0.5],
    style: {},
    crossOrigin: 'anonymous',
    onDropFile () {},
    onLoadFailure () {},
    onLoadSuccess () {},
    onImageReady () {},
    onImageChange () {},
    onMouseUp () {},
    onMouseMove () {},
    onPositionChange () {}
  }

  constructor (props) {
    super(props)

    this.setCanvas = ::this.setCanvas
    this.handleMouseMove = ::this.handleMouseMove
    this.handleMouseDown = ::this.handleMouseDown
    this.handleMouseUp = ::this.handleMouseUp
    this.handleDragOver = ::this.handleDragOver
    this.handleDrop = ::this.handleDrop
  }

  state = {
    drag: false,
    my: null,
    mx: null,
    image: {
      x: 0.5,
      y: 0.5
    }
  }

  isVertical () {
      return this.props.rotate % 180 !== 0
  }

  getDimensions () {
    const { width, height, rotate, border } = this.props

    const canvas = {}

    const canvasWidth = width + (border * 2);
    const canvasHeight = height + (border * 2);

    if (this.isVertical()) {
      canvas.width = canvasHeight;
      canvas.height = canvasWidth;
    } else {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    return {
      canvas,
      rotate,
      width,
      height,
      border
    }
  }

  getImage () {
    // get relative coordinates (0 to 1)
    const cropRect = this.getCroppingRect()
    const image = this.state.image

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
    const context = canvas.getContext('2d')

    context.translate((canvas.width / 2), (canvas.height / 2));
    context.rotate((this.props.rotate * Math.PI / 180))
    context.translate(-(canvas.width / 2), -(canvas.height / 2));

    if (this.isVertical()) {
        context.translate((canvas.width - canvas.height) / 2, (canvas.height - canvas.width) / 2)
    }

    context.drawImage(image.resource, -cropRect.x, -cropRect.y)

    return canvas
  }

  /**
   * Get the image scaled to original canvas size.
   * This was default in 4.x and is now kept as a legacy method.
   */
  getImageScaledToCanvas () {
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
    this.paintImage(canvas.getContext('2d'), this.state.image, 0)

    return canvas
  }

  getXScale() {
    let canvasAspect = this.props.width / this.props.height
    let imageAspect = this.state.image.width / this.state.image.height

    return Math.min(1, canvasAspect / imageAspect)
  }

  getYScale() {
    let canvasAspect = this.props.height / this.props.width
    let imageAspect = this.state.image.height / this.state.image.width

    return Math.min(1, canvasAspect / imageAspect)
  }

  getCroppingRect () {
    let position = this.props.position || { x: this.state.image.x, y: this.state.image.y },
        width = (1 / this.props.scale) * this.getXScale(),
        height = (1 / this.props.scale) * this.getYScale()

    let croppingRect = {
      x: position.x - (width / 2),
      y: position.y - (height / 2),
      width,
      height
    };

    let xMin = 0,
      xMax = 1 - croppingRect.width,
      yMin = 0,
      yMax = 1 - croppingRect.height

    // If the cropping rect is larger than the image, then we need to change
    // our maxima & minima for x & y to allow the image to appear anywhere up
    // to the very edge of the cropping rect.
    let isLargerThanImage = width > 1 || height > 1

    if (isLargerThanImage) {
      xMin = -croppingRect.width
      xMax = 1
      yMin = -croppingRect.height
      yMax = 1
    }

    return {
      ...croppingRect,
      x: Math.max(xMin, Math.min(croppingRect.x, xMax)),
      y: Math.max(yMin, Math.min(croppingRect.y, yMax))
    }
  }

  isDataURL (str) {
    if (str === null) {
      return false
    }
    const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+=[a-z\-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@\/?%\s]*\s*$/i
    return !!str.match(regex)
  }

  loadImage (imageURL) {
    const imageObj = new Image()
    imageObj.onload = this.handleImageReady.bind(this, imageObj)
    imageObj.onerror = this.props.onLoadFailure
    if (!this.isDataURL(imageURL) && this.props.crossOrigin) imageObj.crossOrigin = this.props.crossOrigin
    imageObj.src = imageURL
  }

  componentDidMount () {
    const context = ReactDOM.findDOMNode(this.canvas).getContext('2d')
    if (this.props.image) {
      this.loadImage(this.props.image)
    }
    this.paint(context)
    if (document) {
      const nativeEvents = deviceEvents.native
      document.addEventListener(nativeEvents.move, this.handleMouseMove, false)
      document.addEventListener(nativeEvents.up, this.handleMouseUp, false)
      if (isTouchDevice) {
        document.addEventListener(nativeEvents.mouseMove, this.handleMouseMove, false)
        document.addEventListener(nativeEvents.mouseUp, this.handleMouseUp, false)
      }
    }
  }

  componentWillUnmount () {
    if (document) {
      const nativeEvents = deviceEvents.native
      document.removeEventListener(nativeEvents.move, this.handleMouseMove, false)
      document.removeEventListener(nativeEvents.up, this.handleMouseUp, false)
      if (isTouchDevice) {
        document.removeEventListener(nativeEvents.mouseMove, this.handleMouseMove, false)
        document.removeEventListener(nativeEvents.mouseUp, this.handleMouseUp, false)
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const context = ReactDOM.findDOMNode(this.canvas).getContext('2d')
    context.clearRect(0, 0, this.getDimensions().canvas.width, this.getDimensions().canvas.height)
    this.paint(context)
    this.paintImage(context, this.state.image, this.props.border)

    if (prevProps.image !== this.props.image ||
        prevProps.width !== this.props.width ||
        prevProps.height !== this.props.height ||
        prevProps.position !== this.props.position ||
        prevProps.scale !== this.props.scale ||
        prevProps.rotate !== this.props.rotate ||
        prevState.my !== this.state.my ||
        prevState.mx !== this.state.mx ||
        prevState.image.x !== this.state.image.x ||
        prevState.image.y !== this.state.image.y) {
      this.props.onImageChange()
    }
  }

  handleImageReady (image) {
    const imageState = this.getInitialSize(image.width, image.height)
    imageState.resource = image
    imageState.x = 0.5;
    imageState.y = 0.5;
    this.setState({ drag: false, image: imageState }, this.props.onImageReady)
    this.props.onLoadSuccess(imageState)
  }

  getInitialSize (width, height) {
    let newHeight
    let newWidth

    const dimensions = this.getDimensions()
    const canvasRatio = dimensions.height / dimensions.width
    const imageRatio = height / width

    if (canvasRatio > imageRatio) {
      newHeight = (this.getDimensions().height)
      newWidth = (width * (newHeight / height))
    } else {
      newWidth = (this.getDimensions().width)
      newHeight = (height * (newWidth / width))
    }

    return {
      height: newHeight,
      width: newWidth
    }
  }

  componentWillReceiveProps (newProps) {
    if ((newProps.image && this.props.image !== newProps.image) ||
        this.props.width !== newProps.width ||
        this.props.height !== newProps.height) {
      this.loadImage(newProps.image)
    }
  }

  paintImage (context, image, border) {
    if (image.resource) {
      const position = this.calculatePosition(image, border)

      context.save()

      context.translate((context.canvas.width / 2), (context.canvas.height / 2));
      context.rotate((this.props.rotate * Math.PI / 180))
      context.translate(-(context.canvas.width / 2), -(context.canvas.height / 2));

      if (this.isVertical()) {
          context.translate((context.canvas.width - context.canvas.height) / 2, (context.canvas.height - context.canvas.width) / 2)
      }

      context.globalCompositeOperation = 'destination-over'
      context.drawImage(image.resource, position.x, position.y, position.width, position.height)

      context.restore()
    }
  }

  calculatePosition (image, border) {
    image = image || this.state.image

    const croppingRect = this.getCroppingRect()

    const width = image.width * this.props.scale
    const height = image.height * this.props.scale

    const x = border - (croppingRect.x * width)
    const y = border - (croppingRect.y * height)

    return {
      x,
      y,
      height,
      width
    }
  }

  paint (context) {
    context.save()
    context.translate(0, 0)
    context.fillStyle = 'rgba(' + this.props.color.slice(0, 4).join(',') + ')'

    let borderRadius = this.props.borderRadius
    const dimensions = this.getDimensions()
    const borderSize = dimensions.border
    const height = dimensions.canvas.height
    const width = dimensions.canvas.width

    // clamp border radius between zero (perfect rectangle) and half the size without borders (perfect circle or "pill")
    borderRadius = Math.max(borderRadius, 0)
    borderRadius = Math.min(borderRadius, width / 2 - borderSize, height / 2 - borderSize)

    context.beginPath()
    // inner rect, possibly rounded
    drawRoundedRect(context, borderSize, borderSize, width - borderSize * 2, height - borderSize * 2, borderRadius)
    context.rect(width, 0, -width, height) // outer rect, drawn "counterclockwise"
    context.fill('evenodd')

    context.restore()
  }

  handleMouseDown (e) {
    e = e || window.event
    // if e is a touch event, preventDefault keeps
    // corresponding mouse events from also being fired
    // later.
    e.preventDefault()
    this.setState({
      drag: true,
      mx: null,
      my: null
    })
  }
  handleMouseUp () {
    if (this.state.drag) {
      this.setState({ drag: false })
      this.props.onMouseUp()
    }
  }

  handleMouseMove (e) {
    e = e || window.event
    if (this.state.drag === false) {
      return
    }

    const mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
    const mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY

    const newState = {
      mx: mousePositionX,
      my: mousePositionY
    }

    let rotate = this.props.rotate

    rotate %= 360
    rotate = (rotate < 0) ? rotate + 360 : rotate
    rotate -= rotate % 90

    if (this.state.mx && this.state.my) {
      const mx = this.state.mx - mousePositionX
      const my = this.state.my - mousePositionY

      const width = this.state.image.width * this.props.scale
      const height = this.state.image.height * this.props.scale

      let {
        x: lastX,
        y: lastY
      } = this.getCroppingRect()

      lastX *= width
      lastY *= height

      const xDiff = (rotate === 0 || rotate === 180 ? mx : my)
      const yDiff = (rotate === 0 || rotate === 180 ? my : mx)

      let y
      let x

      if (rotate === 0) {
        y = lastY + yDiff
        x = lastX + xDiff
      }

      if (rotate === 90) {
        y = lastY - yDiff
        x = lastX + xDiff
      }

      if (rotate === 180) {
        y = lastY - yDiff
        x = lastX - xDiff
      }

      if (rotate === 270) {
        y = lastY + yDiff
        x = lastX - xDiff
      }

      let relativeWidth = (1 / this.props.scale) * this.getXScale()
      let relativeHeight = (1 / this.props.scale) * this.getYScale()

      const position = {
          x: (x / width) + (relativeWidth / 2),
          y: (y / height) + (relativeHeight / 2)
      }

      this.props.onPositionChange(position)

      newState.image = {
        ...this.state.image,
        ...position
      }
    }

    this.setState(newState)

    this.props.onMouseMove()
  }

  handleDragOver (e) {
    e = e || window.event
    e.preventDefault()
  }

  handleDrop (e) {
    e = e || window.event
    e.stopPropagation()
    e.preventDefault()

    if (e.dataTransfer && e.dataTransfer.files.length) {
      this.props.onDropFile(e)
      const reader = new FileReader()
      const file = e.dataTransfer.files[0]
      reader.onload = (e) => this.loadImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  setCanvas (canvas) {
    this.canvas = canvas
  }

  render () {
    const defaultStyle = {
      cursor: this.state.drag ? 'grabbing' : 'grab'
    }

    const attributes = {
      width: this.getDimensions().canvas.width,
      height: this.getDimensions().canvas.height,
      style: {
        ...defaultStyle,
        ...this.props.style
      }
    }

    attributes[deviceEvents.react.down] = this.handleMouseDown
    attributes[deviceEvents.react.drag] = this.handleDragOver
    attributes[deviceEvents.react.drop] = this.handleDrop
    if (isTouchDevice) attributes[deviceEvents.react.mouseDown] = this.handleMouseDown

    return (
      <canvas ref={this.setCanvas} {...attributes} />
    )
  }
}

export default AvatarEditor
