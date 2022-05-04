import React, { ChangeEvent, MouseEventHandler } from 'react'
import AvatarEditor, { type Position } from 'react-avatar-editor'
import Dropzone from 'react-dropzone'
import Preview from './Preview.js'

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
}

export default class App extends React.Component<{}, State> {
  private editor = React.createRef<AvatarEditor>()

  state: State = {
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
  }

  handleNewImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      this.setState({ image: e.target.files[0] })
    }
  }

  handleSave = () => {
    const img = this.editor.current?.getImageScaledToCanvas().toDataURL()
    const rect = this.editor.current?.getCroppingRect()

    if (!img || !rect) return

    this.setState({
      preview: {
        img,
        rect,
        scale: this.state.scale,
        width: this.state.width,
        height: this.state.height,
        borderRadius: this.state.borderRadius,
      },
    })
  }

  handleScale = (e: ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value)
    this.setState({ scale })
  }

  handleAllowZoomOut = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ allowZoomOut: e.target.checked })
  }

  handleDisableCanvasRotation = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ disableCanvasRotation: e.target.checked })
  }

  rotateScale = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    this.setState({ rotate: parseFloat(e.target.value) })
  }

  rotateLeft: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    this.setState({ rotate: (this.state.rotate - 90) % 360 })
  }

  rotateRight: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    this.setState({ rotate: (this.state.rotate + 90) % 360 })
  }

  handleBorderRadius = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ borderRadius: parseInt(e.target.value) })
  }

  handleXPosition = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      position: { ...this.state.position, x: parseFloat(e.target.value) },
    })
  }

  handleYPosition = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      position: { ...this.state.position, y: parseFloat(e.target.value) },
    })
  }

  handleWidth = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ width: parseInt(e.target.value) })
  }

  handleHeight = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ height: parseInt(e.target.value) })
  }

  logCallback(e: any) {
    console.log('callback', e)
  }

  handlePositionChange = (position: Position) => {
    this.setState({ position })
  }

  setBackgroundColor = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ backgroundColor: e.target.value })
  }

  setTransparent = (e: ChangeEvent<HTMLInputElement>) => {
    const isTransparent = e.target.checked
    // set color to white initially
    const backgroundColor = isTransparent ? '#fff' : undefined

    this.setState({ backgroundColor, isTransparent })
  }

  render() {
    return (
      <div>
        <Dropzone
          onDrop={([image]) => this.setState({ image })}
          noClick
          multiple={false}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="preview">
              <AvatarEditor
                ref={this.editor}
                scale={this.state.scale}
                width={this.state.width}
                height={this.state.height}
                position={this.state.position}
                onPositionChange={this.handlePositionChange}
                rotate={this.state.rotate}
                borderRadius={
                  this.state.width / (100 / this.state.borderRadius)
                }
                backgroundColor={this.state.backgroundColor}
                onLoadFailure={this.logCallback.bind(this, 'onLoadFailed')}
                onLoadSuccess={this.logCallback.bind(this, 'onLoadSuccess')}
                onImageReady={this.logCallback.bind(this, 'onImageReady')}
                image={this.state.image}
                disableCanvasRotation={this.state.disableCanvasRotation}
              />
              <input
                name="newImage"
                type="file"
                onChange={this.handleNewImage}
                {...getInputProps()}
              />
            </div>
          )}
        </Dropzone>
        <br />
        <h3>Props</h3>
        Zoom:
        <input
          name="scale"
          type="range"
          onChange={this.handleScale}
          min={this.state.allowZoomOut ? '0.1' : '1'}
          max="2"
          step="0.01"
          defaultValue="1"
        />
        <br />
        {'Allow Scale < 1'}
        <input
          name="allowZoomOut"
          type="checkbox"
          onChange={this.handleAllowZoomOut}
          checked={this.state.allowZoomOut}
        />
        <br />
        Border radius:
        <input
          name="scale"
          type="range"
          onChange={this.handleBorderRadius}
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
          onChange={this.handleWidth}
          min="50"
          max="400"
          step="10"
          value={this.state.width}
        />
        <br />
        Avatar Height:
        <input
          name="height"
          type="number"
          onChange={this.handleHeight}
          min="50"
          max="400"
          step="10"
          value={this.state.height}
        />
        <br />
        Rotate:
        <button onClick={this.rotateLeft}>Left</button>
        <button onClick={this.rotateRight}>Right</button>
        <br />
        Disable Canvas Rotation
        <input
          name="disableCanvasRotation"
          type="checkbox"
          onChange={this.handleDisableCanvasRotation}
          checked={this.state.disableCanvasRotation}
        />
        <br />
        Rotation:
        <input
          name="rotation"
          type="range"
          onChange={this.rotateScale}
          min="0"
          max="180"
          step="1"
          defaultValue="0"
        />
        <br />
        Transparent image?
        <input
          type="checkbox"
          onChange={this.setTransparent}
          defaultChecked={this.state.isTransparent}
        ></input>
        <br />
        {this.state.isTransparent && (
          <div style={{ marginLeft: '1rem' }}>
            Background color:
            <input
              name="backgroundColor"
              type="color"
              defaultValue={this.state.backgroundColor}
              onChange={this.setBackgroundColor}
            />
            <br />
          </div>
        )}
        <br />
        <input type="button" onClick={this.handleSave} value="Preview" />
        <br />
        {this.state.preview && (
          <>
            <img
              src={this.state.preview.img}
              style={{
                borderRadius: `${
                  (Math.min(
                    this.state.preview.height,
                    this.state.preview.width,
                  ) +
                    10) *
                  (this.state.preview.borderRadius / 2 / 100)
                }px`,
              }}
            />
            <Preview
              width={
                this.state.preview.scale < 1
                  ? this.state.preview.width
                  : (this.state.preview.height * 478) / 270
              }
              height={this.state.preview.height}
              image={AvatarImagePath}
              rect={this.state.preview.rect}
            />
          </>
        )}
      </div>
    )
  }
}
