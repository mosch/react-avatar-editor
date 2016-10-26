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
const AvatarEditor = React.createClass({
  propTypes: {
    scale: React.PropTypes.number,
    image: React.PropTypes.string,
    border: React.PropTypes.number,
    borderRadius: React.PropTypes.number,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    color: React.PropTypes.arrayOf(React.PropTypes.number),
    style: React.PropTypes.object,

    onDropFile: React.PropTypes.func,
    onLoadFailure: React.PropTypes.func,
    onLoadSuccess: React.PropTypes.func,
    onImageReady: React.PropTypes.func,
    onImageChange: React.PropTypes.func,
    onMouseUp: React.PropTypes.func,
    onMouseMove: React.PropTypes.func
  },

  getDefaultProps () {
    return {
      scale: 1,
      border: 25,
      borderRadius: 0,
      width: 200,
      height: 200,
      color: [0, 0, 0, 0.5],
      style: {},
      onDropFile () {
      },
      onLoadFailure () {
      },
      onLoadSuccess () {
      },
      onImageReady () {
      },
      onImageChange () {
      },
      onMouseUp () {
      },
      onMouseMove () {
      }
    }
  },

  getInitialState () {
    return {
      drag: false,
      my: null,
      mx: null,
      image: {
        x: 0,
        y: 0
      }
    }
  },

  getDimensions () {
    return {
      width: this.props.width,
      height: this.props.height,
      border: this.props.border,
      canvas: {
        width: this.props.width + (this.props.border * 2),
        height: this.props.height + (this.props.border * 2)
      }
    }
  },

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
    canvas.width = cropRect.width
    canvas.height = cropRect.height

    // draw the full-size image at the correct position,
    // the image gets truncated to the size of the canvas.
    canvas.getContext('2d').drawImage(image.resource, -cropRect.x, -cropRect.y)

    return canvas
  },

  /**
   * Get the image scaled to original canvas size.
   * This was default in 4.x and is now kept as a legacy method.
   */
  getImageScaledToCanvas () {
    const { width, height } = this.getDimensions()

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    // don't paint a border here, as it is the resulting image
    this.paintImage(canvas.getContext('2d'), this.state.image, 0)

    return canvas
  },

  getCroppingRect () {
    const dim = this.getDimensions()
    const frameRect = { x: dim.border, y: dim.border, width: dim.width, height: dim.height }
    const imageRect = this.calculatePosition(this.state.image, dim.border)
    return {
      x: (frameRect.x - imageRect.x) / imageRect.width,
      y: (frameRect.y - imageRect.y) / imageRect.height,
      width: frameRect.width / imageRect.width,
      height: frameRect.height / imageRect.height
    }
  },

  isDataURL (str) {
    if (str === null) {
      return false
    }
    const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+=[a-z\-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@\/?%\s]*\s*$/i
    return !!str.match(regex)
  },

  loadImage (imageURL) {
    const imageObj = new Image()
    imageObj.onload = this.handleImageReady.bind(this, imageObj)
    imageObj.onerror = this.props.onLoadFailure
    if (!this.isDataURL(imageURL)) imageObj.crossOrigin = 'anonymous'
    imageObj.src = imageURL
  },

  componentDidMount () {
    const context = ReactDOM.findDOMNode(this.refs.canvas).getContext('2d')
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
  },

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
  },

  componentDidUpdate (prevProps, prevState) {
    const context = ReactDOM.findDOMNode(this.refs.canvas).getContext('2d')
    context.clearRect(0, 0, this.getDimensions().canvas.width, this.getDimensions().canvas.height)
    this.paint(context)
    this.paintImage(context, this.state.image, this.props.border)

    if (prevProps.image !== this.props.image ||
        prevProps.scale !== this.props.scale ||
        prevState.my !== this.state.my ||
        prevState.mx !== this.state.mx ||
        prevState.image.x !== this.state.image.x ||
        prevState.image.y !== this.state.image.y) {
      this.props.onImageChange()
    }
  },

  handleImageReady (image) {
    const imageState = this.getInitialSize(image.width, image.height)
    imageState.resource = image
    imageState.x = 0
    imageState.y = 0
    this.setState({ drag: false, image: imageState }, this.props.onImageReady)
    this.props.onLoadSuccess(imageState)
  },

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
  },

  componentWillReceiveProps (newProps) {
    if (newProps.image && this.props.image !== newProps.image) {
      this.loadImage(newProps.image)
    }
    if (
      this.props.scale !== newProps.scale ||
      this.props.height !== newProps.height ||
      this.props.width !== newProps.width ||
      this.props.border !== newProps.border
    ) {
      this.squeeze(newProps)
    }
  },

  paintImage (context, image, border) {
    if (image.resource) {
      const position = this.calculatePosition(image, border)
      context.save()
      context.globalCompositeOperation = 'destination-over'
      context.drawImage(image.resource, position.x, position.y, position.width, position.height)

      context.restore()
    }
  },

  calculatePosition (image, border) {
    image = image || this.state.image
    const dimensions = this.getDimensions()
    const width = image.width * this.props.scale
    const height = image.height * this.props.scale

    const widthDiff = (width - dimensions.width) / 2
    const heightDiff = (height - dimensions.height) / 2
    const x = image.x * this.props.scale - widthDiff + border
    const y = image.y * this.props.scale - heightDiff + border

    return {
      x,
      y,
      height,
      width
    }
  },

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
  },

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
  },
  handleMouseUp () {
    if (this.state.drag) {
      this.setState({ drag: false })
      this.props.onMouseUp()
    }
  },

  handleMouseMove (e) {
    e = e || window.event
    if (this.state.drag === false) {
      return
    }

    let imageState = this.state.image
    const lastX = imageState.x
    const lastY = imageState.y

    const mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
    const mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY

    const newState = { mx: mousePositionX, my: mousePositionY, image: imageState }

    if (this.state.mx && this.state.my) {
      const xDiff = (this.state.mx - mousePositionX) / this.props.scale
      const yDiff = (this.state.my - mousePositionY) / this.props.scale

      imageState.y = this.getBoundedY(lastY - yDiff, this.props.scale)
      imageState.x = this.getBoundedX(lastX - xDiff, this.props.scale)
    }

    this.setState(newState)
    this.props.onMouseMove()
  },

  squeeze (props) {
    let imageState = this.state.image
    imageState.y = this.getBoundedY(imageState.y, props.scale)
    imageState.x = this.getBoundedX(imageState.x, props.scale)
    this.setState({ image: imageState })
  },

  getBoundedX (x, scale) {
    const image = this.state.image
    const dimensions = this.getDimensions()
    let widthDiff = Math.floor((image.width - dimensions.width / scale) / 2)
    widthDiff = Math.max(0, widthDiff)

    return Math.max(-widthDiff, Math.min(x, widthDiff))
  },

  getBoundedY (y, scale) {
    const image = this.state.image
    const dimensions = this.getDimensions()
    let heightDiff = Math.floor((image.height - dimensions.height / scale) / 2)
    heightDiff = Math.max(0, heightDiff)

    return Math.max(-heightDiff, Math.min(y, heightDiff))
  },

  handleDragOver (e) {
    e = e || window.event
    e.preventDefault()
  },

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
  },

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
      <canvas ref='canvas' {...attributes} />
    )
  }
})

export default AvatarEditor
