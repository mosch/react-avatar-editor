import React, { ChangeEvent, MouseEventHandler, useRef, useState } from 'react'
import AvatarEditor, { type Position } from 'react-avatar-editor'
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
    rect: {
      x: number
      y: number
      width: number
      height: number
    }
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

const App = () => {
  const editor = useRef<AvatarEditor>(null)
  const [state, setState] = useState<State>({
    image: AvatarImagePath,
    allowZoomOut: false,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
    borderRadius: 0,
    preview: undefined,
    width: 200,
    height: 200,
    disableCanvasRotation: false,
    isTransparent: false,
    backgroundColor: undefined,
    showGrid: false,
    borderColor: '#ffffff80', // Default border color (white with 50% opacity)
  })

  const handleNewImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setState({ ...state, image: e.target.files[0] })
    }
  }

  const handleSave = () => {
    const img = editor.current?.getImageScaledToCanvas().toDataURL()
    const rect = editor.current?.getCroppingRect()

    if (!img || !rect) return

    setState({
      ...state,
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

  const handleScale = (e: ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value)
    setState({ ...state, scale })
  }

  const handleAllowZoomOut = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, allowZoomOut: e.target.checked })
  }

  const handleDisableCanvasRotation = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, disableCanvasRotation: e.target.checked })
  }

  const rotateScale = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setState({ ...state, rotate: parseFloat(e.target.value) })
  }

  const rotateLeft: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    setState({ ...state, rotate: (state.rotate - 90) % 360 })
  }

  const rotateRight: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    setState({ ...state, rotate: (state.rotate + 90) % 360 })
  }

  const handleBorderRadius = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, borderRadius: parseInt(e.target.value) })
  }

  const handleXPosition = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      position: { ...state.position, x: parseFloat(e.target.value) },
    })
  }

  const handleYPosition = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      position: { ...state.position, y: parseFloat(e.target.value) },
    })
  }

  const handleWidth = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, width: parseInt(e.target.value) })
  }

  const handleHeight = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, height: parseInt(e.target.value) })
  }

  const logCallback = (e: any) => {
    console.log('callback', e)
  }

  const handlePositionChange = (position: Position) => {
    setState({ ...state, position })
  }

  const setBackgroundColor = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, backgroundColor: e.target.value })
  }

  const setTransparent = (e: ChangeEvent<HTMLInputElement>) => {
    const isTransparent = e.target.checked
    // set color to white initially
    const backgroundColor = isTransparent ? '#fff' : undefined

    setState({ ...state, backgroundColor, isTransparent })
  }

  const handleShowGrid = (e: ChangeEvent<HTMLInputElement>) =>
    setState({ ...state, showGrid: e.target.checked })

  const handleBorderColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, borderColor: e.target.value })
  }

  return (
    <div>
      <Dropzone
        onDrop={([image]) => setState({ ...state, image })}
        noClick
        multiple={false}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="preview">
            <AvatarEditor
              ref={editor}
              scale={state.scale}
              width={state.width}
              height={state.height}
              position={state.position}
              showGrid={state.showGrid}
              onPositionChange={handlePositionChange}
              rotate={state.rotate}
              borderRadius={state.width / (100 / state.borderRadius)}
              backgroundColor={state.backgroundColor}
              onLoadFailure={logCallback.bind(this, 'onLoadFailed')}
              onLoadSuccess={logCallback.bind(this, 'onLoadSuccess')}
              onImageReady={logCallback.bind(this, 'onImageReady')}
              image={state.image}
              disableCanvasRotation={state.disableCanvasRotation}
              borderColor={hexToRgba(state.borderColor)}
            />
            <input
              name="newImage"
              type="file"
              onChange={handleNewImage}
              {...getInputProps()}
            />
          </div>
        )}
      </Dropzone>
      <br />
      <h3>Props</h3>
      Zoom:{' '}
      <input
        name="scale"
        type="range"
        onChange={handleScale}
        min={state.allowZoomOut ? '0.1' : '1'}
        max="2"
        step="0.01"
        defaultValue="1"
      />
      <br />
      {'Allow Scale < 1'}
      <input
        name="allowZoomOut"
        type="checkbox"
        onChange={handleAllowZoomOut}
        checked={state.allowZoomOut}
      />
      <br />
      Show grid:{' '}
      <input
        type="checkbox"
        checked={state.showGrid}
        onChange={handleShowGrid}
      />
      <br />
      Border radius:
      <input
        name="scale"
        type="range"
        onChange={handleBorderRadius}
        min="0"
        max="50"
        step="1"
        defaultValue="0"
      />
      <br />
      Avatar Width:
      <input
        name="width"
        type="number"
        onChange={handleWidth}
        min="50"
        max="400"
        step="10"
        value={state.width}
      />
      <br />
      Avatar Height:
      <input
        name="height"
        type="number"
        onChange={handleHeight}
        min="50"
        max="400"
        step="10"
        value={state.height}
      />
      <br />
      Rotate:
      <button onClick={rotateLeft}>Left</button>
      <button onClick={rotateRight}>Right</button>
      <br />
      Disable Canvas Rotation
      <input
        name="disableCanvasRotation"
        type="checkbox"
        onChange={handleDisableCanvasRotation}
        checked={state.disableCanvasRotation}
      />
      <br />
      Rotation:
      <input
        name="rotation"
        type="range"
        onChange={rotateScale}
        min="0"
        max="180"
        step="1"
        defaultValue="0"
      />
      <br />
      Transparent image?
      <input
        type="checkbox"
        onChange={setTransparent}
        defaultChecked={state.isTransparent}
      ></input>
      <br />
      {state.isTransparent && (
        <div style={{ marginLeft: '1rem' }}>
          Background color:
          <input
            name="backgroundColor"
            type="color"
            defaultValue={state.backgroundColor}
            onChange={setBackgroundColor}
          />
          <br />
        </div>
      )}
      <br />
      Border Color:
      <input
        name="borderColor"
        type="color"
        value={state.borderColor.slice(0, 7)}
        onChange={handleBorderColorChange}
      />
      Opacity:
      <input
        name="borderOpacity"
        type="range"
        min="0"
        max="255"
        value={parseInt(state.borderColor.slice(7, 9), 16)}
        onChange={(e) => {
          const opacity = parseInt(e.target.value).toString(16).padStart(2, '0')
          setState({ ...state, borderColor: state.borderColor.slice(0, 7) + opacity })
        }}
      />
      <br />
      <input type="button" onClick={handleSave} value="Preview" />
      <br />
      {state.preview && (
        <>
          <img
            alt=""
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
        </>
      )}
    </div>
  )
}

// Helper function to convert hex color with alpha to RGBA array
function hexToRgba(hex: string): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const a = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1
  return [r, g, b, a]
}

export default App