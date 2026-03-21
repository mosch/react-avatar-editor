import { type ChangeEvent, type MouseEventHandler, useState } from 'react'
import { useMotionValue, useSpring, useMotionValueEvent } from 'motion/react'
import AvatarEditor, {
  type Position,
  useAvatarEditor,
} from 'react-avatar-editor'
import Dropzone from 'react-dropzone'
import Preview from './Preview'

import AvatarImagePath from './avatar.jpg'

type State = {
  image: string | File
  allowZoomOut: boolean
  position: Position
  scale: number
  rotate: number
  borderRadius: number
  preview?: {
    img: string
    rect: { x: number; y: number; width: number; height: number }
    scale: number
    width: number
    height: number
    borderRadius: number
  }
  width: number
  height: number
  disableCanvasRotation: boolean
  isTransparent: boolean
  backgroundColor?: string
  showGrid: boolean
  borderColor: string
}

function hexToRgba(hex: string): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const a = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1
  return [r, g, b, a]
}

const App = () => {
  const editor = useAvatarEditor()
  const [state, setState] = useState<State>({
    image: AvatarImagePath,
    allowZoomOut: false,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
    borderRadius: 0,
    preview: undefined,
    width: 250,
    height: 250,
    disableCanvasRotation: false,
    isTransparent: false,
    backgroundColor: undefined,
    showGrid: false,
    borderColor: '#ffffff80',
  })

  const update = (patch: Partial<State>) =>
    setState((s) => ({ ...s, ...patch }))

  // Animate rotation with a spring for smooth transitions
  const rotateMotion = useMotionValue(0)
  const rotateSpring = useSpring(rotateMotion, { stiffness: 200, damping: 25 })
  const [animatedRotate, setAnimatedRotate] = useState(0)
  const [isRotating, setIsRotating] = useState(false)

  useMotionValueEvent(rotateSpring, 'change', (v) => setAnimatedRotate(v))
  useMotionValueEvent(rotateSpring, 'animationStart', () => setIsRotating(true))
  useMotionValueEvent(rotateSpring, 'animationComplete', () =>
    setIsRotating(false),
  )

  // Sync spring target when state.rotate changes
  if (rotateMotion.get() !== state.rotate) {
    rotateMotion.set(state.rotate)
  }

  const handleSave = () => {
    const img = editor.getImageScaledToCanvas()?.toDataURL()
    const rect = editor.getCroppingRect()
    if (!img || !rect) return
    update({
      preview: {
        img,
        rect,
        scale: state.scale,
        width: state.width,
        height: state.height,
        borderRadius: state.borderRadius,
      },
    })
  }

  const rotateLeft: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    update({ rotate: (state.rotate - 90) % 360 })
  }

  const rotateRight: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    update({ rotate: (state.rotate + 90) % 360 })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          react-avatar-editor <span>v14</span>
        </h1>
        <p>
          Resize, crop &amp; rotate your avatar.{' '}
          <a href="https://github.com/mosch/react-avatar-editor">GitHub</a>
        </p>
      </header>

      {/* Editor Canvas */}
      <Dropzone
        onDrop={([image]) => update({ image })}
        noClick
        multiple={false}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="canvas-stage">
            <AvatarEditor
              ref={editor.ref}
              image={state.image}
              scale={state.scale}
              width={state.width}
              height={state.height}
              position={state.position}
              rotate={animatedRotate}
              borderRadius={state.width / (100 / state.borderRadius)}
              backgroundColor={state.backgroundColor}
              showGrid={state.showGrid}
              disableCanvasRotation={state.disableCanvasRotation}
              borderColor={hexToRgba(state.borderColor)}
              onPositionChange={(position: Position) => update({ position })}
            />
            <input {...getInputProps()} />
            <span className="dropzone-hint">drop image here</span>
          </div>
        )}
      </Dropzone>

      {/* Controls */}
      <div className="controls">
        {/* Zoom */}
        <div className="control-group">
          <div className="control-label">
            Zoom <span className="value">{state.scale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={state.allowZoomOut ? '0.1' : '1'}
            max="2"
            step="0.01"
            value={state.scale}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update({ scale: parseFloat(e.target.value) })
            }
          />
        </div>

        {/* Border Radius */}
        <div className="control-group">
          <div className="control-label">
            Roundness <span className="value">{state.borderRadius}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={state.borderRadius}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update({ borderRadius: parseInt(e.target.value) })
            }
          />
        </div>

        {/* Rotation */}
        <div className="control-group">
          <div className="control-label">
            Rotation{' '}
            <span className="value">{Math.round(animatedRotate)}°</span>
          </div>
          <div className="inline-row">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={((state.rotate % 360) + 360) % 360}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update({ rotate: parseFloat(e.target.value) })
              }
              style={{ flex: 1 }}
            />
            <div className="btn-row">
              <button
                className="btn btn-icon"
                onClick={rotateLeft}
                title="Rotate left"
              >
                ↺
              </button>
              <button
                className="btn btn-icon"
                onClick={rotateRight}
                title="Rotate right"
              >
                ↻
              </button>
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="control-group">
          <div className="control-label">Size</div>
          <div className="size-row">
            <div className="size-field">
              <label>W</label>
              <input
                type="number"
                min="50"
                max="400"
                step="10"
                value={state.width}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update({ width: parseInt(e.target.value) || 50 })
                }
              />
            </div>
            <span className="size-separator">×</span>
            <div className="size-field">
              <label>H</label>
              <input
                type="number"
                min="50"
                max="400"
                step="10"
                value={state.height}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update({ height: parseInt(e.target.value) || 50 })
                }
              />
            </div>
          </div>
        </div>

        {/* Border Color */}
        <div className="control-group">
          <div className="control-label">
            Border <span className="value">opacity</span>
          </div>
          <div className="inline-row">
            <input
              type="color"
              value={state.borderColor.slice(0, 7)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update({
                  borderColor: e.target.value + state.borderColor.slice(7),
                })
              }
            />
            <input
              type="range"
              min="0"
              max="255"
              value={parseInt(state.borderColor.slice(7, 9), 16)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const opacity = parseInt(e.target.value)
                  .toString(16)
                  .padStart(2, '0')
                update({
                  borderColor: state.borderColor.slice(0, 7) + opacity,
                })
              }}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Background */}
        <div className="control-group">
          <div className="control-label">Background</div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={state.isTransparent}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const isTransparent = e.target.checked
                update({
                  isTransparent,
                  backgroundColor: isTransparent ? '#ffffff' : undefined,
                })
              }}
            />
            <span className="toggle-track" />
            <span className="toggle-text">Solid fill</span>
          </label>
          {state.isTransparent && (
            <input
              type="color"
              value={state.backgroundColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update({ backgroundColor: e.target.value })
              }
            />
          )}
        </div>

        {/* Toggles */}
        <div className="control-group full">
          <div
            style={{
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <label className="toggle">
              <input
                type="checkbox"
                checked={state.showGrid}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update({ showGrid: e.target.checked })
                }
              />
              <span className="toggle-track" />
              <span className="toggle-text">Grid</span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={state.allowZoomOut}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update({ allowZoomOut: e.target.checked })
                }
              />
              <span className="toggle-track" />
              <span className="toggle-text">Zoom out</span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={state.disableCanvasRotation}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update({ disableCanvasRotation: e.target.checked })
                }
              />
              <span className="toggle-track" />
              <span className="toggle-text">Lock canvas rotation</span>
            </label>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isRotating}
            >
              Export Preview
            </button>
          </div>
        </div>
      </div>

      {/* Preview Output */}
      {state.preview && (
        <div className="preview-section">
          <div className="preview-result">
            <img
              alt="Cropped preview"
              src={state.preview.img}
              style={{
                borderRadius: `${
                  (Math.min(state.preview.height, state.preview.width) + 10) *
                  (state.preview.borderRadius / 2 / 100)
                }px`,
              }}
            />
            <Preview
              width={
                state.preview.scale < 1
                  ? state.preview.width
                  : (state.preview.height * 478) / 270
              }
              height={state.preview.height}
              image={AvatarImagePath}
              rect={state.preview.rect}
            />
          </div>
        </div>
      )}

      <footer className="footer">
        <a href="https://github.com/mosch/react-avatar-editor">
          mosch/react-avatar-editor
        </a>
      </footer>
    </div>
  )
}

export default App
