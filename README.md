# react-avatar-editor

<a href="http://badge.fury.io/js/react-avatar-editor"><img alt="npm version" src="https://badge.fury.io/js/react-avatar-editor.svg"></a>
<a href="https://npmjs.org/package/react-avatar-editor"><img alt="Downloads" src="http://img.shields.io/npm/dm/react-avatar-editor.svg"></a>

Facebook like, avatar / profile picture component.
Resize and crop your uploaded image using a clear user interface.

# Usage


```javascript
import React from 'react'
import AvatarEditor from 'react-avatar-editor'

class MyEditor extends React.Component {
  render () {
    return (
      <AvatarEditor
        image="http://example.com/initialimage.jpg"
        width={250}
        height={250}
        border={50}
        color={[255, 255, 255, 0.6]} // RGBA
        scale={1.2}
      />
    )
  }
}

export default MyEditor
```

## Props
| Prop                   | Type     | Description
| ---------------------- | -------- | ---------------
| width                  | Number   | The total width of the editor
| height                 | Number   | The total width of the editor
| border                 | Number   | The cropping border. Image will be visible through the border, but cut off in the resulting image.
| color                  | Number[] | The color of the cropping border, in the form: [red (0-255), green (0-255), blue (0-255), alpha (0.0-1.0)]
| style                  | Object   | Styles for the canvas element
| scale                  | Number   | The scale of the image. You can use this to add your own resizing slider.
| angle                  | Number   | The rotation angle of the image. Possible options are 0, 90, 180, 270 deg
| onDropFile(event)      | function | Invoked when user drops a file (or more) onto the canvas. Does not perform any further check.
| onLoadFailure(event)   | function | Invoked when an image (whether passed by props or dropped) load fails.
| onLoadSuccess(imgInfo) | function | Invoked when an image (whether passed by props or dropped) load succeeds.
| onImageReady(event)    | function | Invoked when the image is painted on the canvas the first time
| onMouseUp()            | function | Invoked when the user releases their mouse button after interacting with the editor.
| onMouseMove()          | function | Invoked when the user hold and moving the image.
| onImageChange()        | function | Invoked when the user changed the image. Not invoked on the first render, and invoked multiple times during drag, etc.

## Accessing the resulting image

The resulting image will have the same resolution as the original image, regardless of the editor's size.
If you want the image sized in the dimensions of the canvas you can use `getImageScaledToCanvas`.


```javascript
import React from 'react'
import AvatarEditor from 'react-avatar-editor'

const MyEditor extends React.Component {
  onClickSave () {
    // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
    // drawn on another canvas, or added to the DOM.
    const canvas = this.editor.getImage()

    // If you want the image resized to the canvas size (also a HTMLCanvasElement)
    const canvasScaled = this.editor.getImageScaledToCanvas()
  }

  setEditorRef (editor) {
    if (editor) this.editor = editor
  }

  render () {
    return (
        <AvatarEditor
          ref={this.setEditorRef.bind(this)}
          image="http://example.com/initialimage.jpg"
          width={250}
          height={250}
          border={50}
          scale={1.2}
        />
    )
  }
}

export default MyEditor
```

## Accessing the cropping rectangle

Sometimes you will need to get the cropping rectangle (the coordinates of the area of the image to keep),
for example in case you intend to perform the actual cropping server-side.

``getCroppingRect()`` returns an object with four properties: ``x``, ``y``, ``width`` and ``height``;
all relative to the image size (that is, comprised between 0 and 1). It is a method of AvatarEditor elements,
like ``getImage()``.


# Contributing

For development you can use following build tools:

* `npm run build`: Builds the *minified* dist file: `dist/index.js`
* `npm run watch`: Watches for file changes and builds *unminified* into: `dist/index.js`
* `npm run demo:build`: Builds the demo based on the dist file `dist/index.js`
* `npm run demo:watch`: Run webpack-dev-server. Check demo website [localhost:8080](http://localhost:8080)
