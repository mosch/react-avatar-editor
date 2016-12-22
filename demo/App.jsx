import React from 'react'
import ReactDOM from 'react-dom'
import ReactAvatarEditor from '../src/index'

class App extends React.Component {
  state = {
    scale: 1,
    borderRadius: 0,
    preview: null
  }

  constructor (props) {
    super(props)

    this.setEditorRef = ::this.setEditorRef
    this.handleSave = ::this.handleSave
    this.handleScale = ::this.handleScale
    this.handleBorderRadius = ::this.handleBorderRadius
  }

  handleSave (data) {
    const img = this.editor.getImage().toDataURL()
    const rect = this.editor.getCroppingRect()

    this.setState({
      preview: img,
      croppingRect: rect
    })
  }

  handleScale (e) {
    const scale = parseFloat(e.target.value)
    this.setState({ scale })
  }

  handleBorderRadius (e) {
    const borderRadius = parseInt(e.target.value)
    this.setState({ borderRadius })
  }

  logCallback (e) {
    console.log('callback', e)
  }

  setEditorRef (editor) {
    if (editor) this.editor = editor
  }

  render () {
    return (
      <div>
        <ReactAvatarEditor
          ref={this.setEditorRef}
          scale={parseFloat(this.state.scale)}
          borderRadius={this.state.borderRadius}
          onSave={this.handleSave}
          onLoadFailure={this.logCallback.bind(this, 'onLoadFailed')}
          onLoadSuccess={this.logCallback.bind(this, 'onLoadSuccess')}
          onImageReady={this.logCallback.bind(this, 'onImageReady')}
          onImageLoad={this.logCallback.bind(this, 'onImageLoad')}
          onDropFile={this.logCallback.bind(this, 'onDropFile')}
          image="avatar.jpg"
        />
        <br />
        Zoom:
        <input
          name="scale"
          type="range"
          onChange={this.handleScale}
          min="1"
          max="2"
          step="0.01"
          defaultValue="1"
        />
        <br />
        Border radius:
        <input
          name="scale"
          type="range"
          onChange={this.handleBorderRadius}
          min="0"
          max="100"
          step="1"
          defaultValue="0"
        />
        <br />
        <br />
        <input type="button" onClick={this.handleSave} value="Preview" />
        <br />
        <img
          src={this.state.preview}
          style={{ borderRadius: `${this.state.borderRadius / 2}%` }}
        />

        {this.state.croppingRect ? // display only if there is a cropping rect
          <ImageWithRect
            width={200 * 478 / 270}
            height={200}
            image="avatar.jpg"
            rect={this.state.croppingRect}
            style={{margin: '10px 24px 32px', padding: 5, border: '1px solid #CCC'}}
          />
          :
          null}
      </div>
    )
  }
}

// Used to display the cropping rect
class ImageWithRect extends React.Component {
  constructor (props) {
    super(props)

    this.setCanvas = ::this.setCanvas
    this.handleImageLoad = ::this.handleImageLoad
  }

  componentDidMount () {
    this.redraw()
  }

  componentDidUpdate () {
    this.redraw()
  }

  setCanvas (canvas) {
    if (canvas) this.canvas = canvas
  }

  handleImageLoad () {
    const ctx = this.canvas.getContext('2d')
    const { image, rect, width, height} = this.props

    ctx.drawImage(this.imgElement, 0, 0, width, height)

    if (rect) {
      ctx.strokeStyle = 'red'
      ctx.strokeRect(
        Math.round(rect.x * width) + 0.5,
        Math.round(rect.y * height) + 0.5,
        Math.round(rect.width * width),
        Math.round(rect.height * height)
      )
    }
  }

  redraw () {
    const img = new Image()

    img.src = this.props.image
    img.onload = this.handleImageLoad
    this.imgElement = img
  }

  render () {
    return (
      <canvas
        ref={this.setCanvas}
        style={this.props.style}
        width={this.props.width}
        height={this.props.height}
      />
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
