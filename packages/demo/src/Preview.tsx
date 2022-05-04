import React from 'react'

type Props = {
  rect: { x: number; y: number; width: number; height: number }
  image: string
  width: number
  height: number
}

export default class Preview extends React.Component<Props> {
  private canvas = React.createRef<HTMLCanvasElement>()
  private image: HTMLImageElement | null = null

  componentDidMount() {
    this.redraw()
  }

  componentDidUpdate() {
    this.redraw()
  }

  handleImageLoad = () => {
    const ctx = this.canvas.current?.getContext('2d')

    if (!ctx || !this.image) return

    const { rect, width, height } = this.props

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = 'red'

    if (rect && (rect.width > 1 || rect.height > 1)) {
      ctx.drawImage(
        this.image,
        Math.round(-rect.x * (width / rect.width)),
        Math.round(-rect.y * (height / rect.height)),
        Math.round(width / rect.width),
        Math.round(height / rect.height),
      )

      if (rect) {
        ctx.strokeRect(1, 1, Math.round(width) - 2, Math.round(height) - 2)
      }
    } else {
      ctx.drawImage(this.image, 0, 0, width, height)

      if (rect) {
        ctx.strokeRect(
          Math.round(rect.x * width) + 0.5,
          Math.round(rect.y * height) + 0.5,
          Math.round(rect.width * width),
          Math.round(rect.height * height),
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
