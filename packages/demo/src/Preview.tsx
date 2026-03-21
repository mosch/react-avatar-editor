import React from 'react'

type Props = {
  rect: { x: number; y: number; width: number; height: number }
  image: string
  width: number
  height: number
}

const Preview = ({ rect, image, width, height }: Props) => {
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const imageRef = React.useRef<HTMLImageElement | null>(null)

  React.useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx || !imageRef.current) return

    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = 'rgba(224, 108, 64, 0.8)'
    ctx.lineWidth = 1.5

    if (rect && (rect.width > 1 || rect.height > 1)) {
      ctx.drawImage(
        imageRef.current,
        Math.round(-rect.x * (width / rect.width)),
        Math.round(-rect.y * (height / rect.height)),
        Math.round(width / rect.width),
        Math.round(height / rect.height),
      )
      ctx.strokeRect(1, 1, Math.round(width) - 2, Math.round(height) - 2)
    } else {
      ctx.drawImage(imageRef.current, 0, 0, width, height)
      if (rect) {
        ctx.strokeRect(
          Math.round(rect.x * width) + 0.5,
          Math.round(rect.y * height) + 0.5,
          Math.round(rect.width * width),
          Math.round(rect.height * height),
        )
      }
    }
  }, [rect, width, height])

  React.useEffect(() => {
    const img = new Image()
    img.src = image
    img.addEventListener('load', () => {
      imageRef.current = img
    })
  }, [image])

  return (
    <canvas
      ref={canvas}
      style={{
        borderRadius: '6px',
        border: '1px solid var(--border)',
      }}
      width={width}
      height={height}
    />
  )
}

export default Preview
