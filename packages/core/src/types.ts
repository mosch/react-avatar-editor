export interface ImageState {
  x: number
  y: number
  width?: number
  height?: number
  resource?: HTMLImageElement
}

export interface Position {
  x: number
  y: number
}

export interface AvatarEditorConfig {
  width: number
  height: number
  border?: number | [number, number]
  borderRadius?: number
  scale?: number
  rotate?: number
  color?: [number, number, number, number?]
  backgroundColor?: string
  borderColor?: [number, number, number, number?]
  showGrid?: boolean
  gridColor?: string
  disableBoundaryChecks?: boolean
  disableHiDPIScaling?: boolean
  disableCanvasRotation?: boolean
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export interface Dimensions {
  canvas: {
    width: number
    height: number
  }
  rotate: number
  width: number
  height: number
  border: number | [number, number]
}

export interface CroppingRect {
  x: number
  y: number
  width: number
  height: number
}
