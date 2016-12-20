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
    this.handleSave = ::this.handleSave.bind
    this.handleScale = ::this.handleScale.bind
    this.handleBorderRadius = ::this.handleBorderRadius.bind
  }

  handleSave (data) {
    const img = this.editor.getImage().toDataURL()
    const rect = this.editor.getCroppingRect()

    this.setState({
      preview: img,
      croppingRect: rect
    })
  }

  handleScale () {
    const scale = parseFloat(this.refs.scale.value)
    this.setState({ scale: scale })
  }

  handleBorderRadius () {
    const borderRadius = parseInt(this.refs.borderRadius.value)
    this.setState({ borderRadius: borderRadius })
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
          image="example/avatar.jpg"
        />
        <br />
        Zoom: <input name="scale" type="range" ref="scale" onChange={this.handleScale} min="1" max="2" step="0.01"
                     defaultValue="1" />
        <br />
        Border radius: <input name="scale" type="range" ref="borderRadius" onChange={this.handleBorderRadius} min="0"
                              max="100" step="1" defaultValue="0" />
        <br />
        <br />
        <input type="button" onClick={this.handleSave} value="Preview" />
        <br />
        <img src={this.state.preview}
             style={{borderRadius: this.state.borderRadius + 5 /* because of the 5px padding */}} />

        {this.state.croppingRect ? // display only if there is a cropping rect
          <ImageWithRect
            width={200 * 478 / 270}
            height={200}
            image="example/avatar.jpg"
            rect={this.state.croppingRect}
            style={{margin: '10px 24px 32px', padding: 5, border: '1px solid #CCC'}} />
          :
          null}
      </div>
    )
  }
}

// Used to display the cropping rect
class ImageWithRect extends React.Component {
  componentDidMount () {
    this.redraw()
  }

  componentDidUpdate () {
    this.redraw()
  }

  redraw () {
    var img = new Image()

    img.onload = function (ctx, rect, width, height) {
      ctx.drawImage(img, 0, 0, width, height)

      if (rect) {
        ctx.strokeStyle = "red"
        ctx.strokeRect(
          Math.round(rect.x * width) + 0.5,
          Math.round(rect.y * height) + 0.5,
          Math.round(rect.width * width),
          Math.round(rect.height * height)
        )
      }
    }.bind(this, this.refs.root.getContext('2d'), this.props.rect, this.props.width, this.props.height)

    img.src = this.props.image
  }

  render () {
    return <canvas
      ref="root"
      style={this.props.style}
      width={this.props.width}
      height={this.props.height} />
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
