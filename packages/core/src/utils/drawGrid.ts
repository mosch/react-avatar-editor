/**
 * Draws a "Rule of Three" grid on the canvas.
 */
export const drawGrid = (
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
