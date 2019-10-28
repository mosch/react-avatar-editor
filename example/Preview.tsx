import * as React from 'react'

interface IPreviewProps {
  rect: {
    width: number
    height: number
    x: number
    y: number
  }
  image: string
  width: number
  height: number
}

export default class Preview extends React.Component<IPreviewProps> {
  private canvas = React.createRef<HTMLCanvasElement>()
  private image = new HTMLImageElement()

  componentDidMount() {
    this.redraw()
  }

  componentDidUpdate() {
    this.redraw()
  }

  handleImageLoad = () => {
    const { current } = this.canvas
    if (!current) {
      return
    }
    const context = current.getContext('2d')
    if (!context) {
      return
    }
    const { rect, width, height } = this.props

    context.clearRect(0, 0, width, height)
    context.strokeStyle = 'red'

    if (rect && (rect.width > 1 || rect.height > 1)) {
      context.drawImage(
        this.image,
        Math.round(-rect.x * (width / rect.width)),
        Math.round(-rect.y * (height / rect.height)),
        Math.round(width / rect.width),
        Math.round(height / rect.height)
      )

      context.strokeRect(1, 1, Math.round(width) - 2, Math.round(height) - 2)
    } else {
      context.drawImage(this.image, 0, 0, width, height)

      if (rect) {
        context.strokeRect(
          Math.round(rect.x * width) + 0.5,
          Math.round(rect.y * height) + 0.5,
          Math.round(rect.width * width),
          Math.round(rect.height * height)
        )
      }
    }
  }

  redraw() {
    const image = new Image()
    image.src = this.props.image
    image.onload = this.handleImageLoad
    this.image = image
  }

  render() {
    const { width, height } = this.props
    return (
      <canvas
        ref={this.canvas}
        style={{
          margin: '10px 24px 32px',
          padding: 5,
          border: '1px solid #CCC',
        }}
        width={width}
        height={height}
      />
    )
  }
}
