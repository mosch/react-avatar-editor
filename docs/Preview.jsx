/* eslint-env browser */
import React from 'react'
import { shape, number, string } from 'prop-types'

export default class Preview extends React.Component {
  static propTypes = {
    rect: shape({
      width: number,
      height: number,
    }),
    image: string,
    width: number,
    height: number,
  }

  componentDidMount() {
    this.redraw()
  }

  componentDidUpdate() {
    this.redraw()
  }

  setCanvas = canvas => (this.canvas = canvas)

  handleImageLoad = () => {
    const ctx = this.canvas.getContext('2d')
    const { rect, width, height } = this.props

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = 'red'

    if (rect && (rect.width > 1 || rect.height > 1)) {
      ctx.drawImage(
        this.image,
        Math.round(-rect.x * (width / rect.width)),
        Math.round(-rect.y * (height / rect.height)),
        Math.round(width / rect.width),
        Math.round(height / rect.height)
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
        ref={this.setCanvas}
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
