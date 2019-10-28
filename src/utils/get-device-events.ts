const draggableEvents = {
  touch: {
    react: {
      down: 'onTouchStart',
      drag: 'onTouchMove',
      move: 'onTouchMove',
      up: 'onTouchEnd',
      mouseMove: 'onMouseMove',
      mouseDown: 'onMouseDown',
      mouseUp: 'onMouseUp',
    },
    native: {
      down: 'touchstart',
      drag: 'touchmove',
      move: 'touchmove',
      up: 'touchend',
      mouseDown: 'mousedown',
      mouseMove: 'mousemove',
      mouseUp: 'mouseup',
    },
  },
  desktop: {
    react: {
      down: 'onMouseDown',
      drag: 'onDragOver',
      move: 'onMouseMove',
      up: 'onMouseUp',
    },
    native: {
      down: 'mousedown',
      drag: 'dragStart',
      move: 'mousemove',
      up: 'mouseup',
    },
  },
}

interface IDeviceEvents {
  react: {
    down: string
    drag: string
    move: string
    up: string
    mouseDown?: string
    mouseMove?: string
    mouseUp?: string
  }
  native: {
    down: string
    drag: string
    move: string
    up: string
    mouseDown?: string
    mouseMove?: string
    mouseUp?: string
  }
}

const isTouchDevice = () =>
  !!(
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
  )

export default (): IDeviceEvents =>
  isTouchDevice() ? draggableEvents.touch : draggableEvents.desktop
