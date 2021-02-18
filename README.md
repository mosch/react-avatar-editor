# react-avatar-editor

<a href="https://www.npmjs.com/package/react-avatar-editor"><img alt="npm version" src="https://badge.fury.io/js/react-avatar-editor.svg"></a>
<a href="https://npmjs.org/package/react-avatar-editor"><img alt="Downloads" src="http://img.shields.io/npm/dm/react-avatar-editor.svg"></a>
[![Build Status](https://travis-ci.org/mosch/react-avatar-editor.svg?branch=master)](https://travis-ci.org/mosch/react-avatar-editor)

Facebook like, avatar / profile picture component.
Resize, crop and rotate your uploaded image using a clear user interface.

# Install

Just use yarn or npm to add it to your project:

```
yarn add react-avatar-editor
```

respective

```
npm install --save react-avatar-editor
```

# Demo

![](https://thumbs.gfycat.com/FlawedBlushingGermanwirehairedpointer-size_restricted.gif)

[Demo](https://react-avatar-editor.netlify.com/)

# Usage

```javascript
import React from 'react'
import AvatarEditor from 'react-avatar-editor'

class MyEditor extends React.Component {
  render() {
    return (
      <AvatarEditor
        image="http://example.com/initialimage.jpg"
        width={250}
        height={250}
        border={50}
        color={[255, 255, 255, 0.6]} // RGBA
        scale={1.2}
        rotate={0}
      />
    )
  }
}

export default MyEditor
```

## Props

| Prop                   | Type             | Description                                                                                                                                                                                                                                                          |
| ---------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| image                  | String\|File     | The URL of the image to use, or a File (e.g. from a file input).                                                                                                                                                                                                     |
| width                  | Number           | The total width of the editor.                                                                                                                                                                                                                                       |
| height                 | Number           | The total height of the editor.                                                                                                                                                                                                                                      |
| border                 | Number\|Number[] | The cropping border. Image will be visible through the border, but cut off in the resulting image. Treated as horizontal and vertical borders when passed an array.                                                                                                  |
| borderRadius           | Number           | The cropping area border radius.                                                                                                                                                                                                                                     |
| color                  | Number[]         | The color of the cropping border, in the form: [red (0-255), green (0-255), blue (0-255), alpha (0.0-1.0)].                                                                                                                                                          |
| backgroundColor        | String           | The background color of the image if it's transparent.                                                                                                                                                                                                               |
| style                  | Object           | Styles for the canvas element.                                                                                                                                                                                                                                       |
| scale                  | Number           | The scale of the image. You can use this to add your own resizing slider.                                                                                                                                                                                            |
| position               | Object           | The x and y co-ordinates (in the range 0 to 1) of the center of the cropping area of the image. Note that if you set this prop, you will need to keep it up to date via onPositionChange in order for panning to continue working.                                   |
| rotate                 | Number           | The rotation degree of the image. You can use this to rotate image (e.g 90, 270 degrees).                                                                                                                                                                            |
| crossOrigin            | String           | The value to use for the crossOrigin property of the image, if loaded from a non-data URL. Valid values are `"anonymous"` and `"use-credentials"`. See [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for more information. |
| className              | String\|String[] | className property passed to the canvas element                                                                                                                                                                                                                      |
| onLoadFailure(event)   | function         | Invoked when an image (whether passed by props or dropped) load fails.                                                                                                                                                                                               |
| onLoadSuccess(imgInfo) | function         | Invoked when an image (whether passed by props or dropped) load succeeds.                                                                                                                                                                                            |
| onImageReady(event)    | function         | Invoked when the image is painted on the canvas the first time.                                                                                                                                                                                                      |
| onMouseUp()            | function         | Invoked when the user releases their mouse button after interacting with the editor.                                                                                                                                                                                 |
| onMouseMove(event)     | function         | Invoked when the user hold and moving the image.                                                                                                                                                                                                                     |
| onImageChange()        | function         | Invoked when the user changed the image. Not invoked on the first render, and invoked multiple times during drag, etc.                                                                                                                                               |
| onPositionChange()     | function         | Invoked when the user pans the editor to change the selected area of the image. Passed a position object in the form `{ x: 0.5, y: 0.5 }` where x and y are the relative x and y coordinates of the center of the selected area.                                     |
| disableBoundaryChecks  | Boolean          | Set to `true` to allow the image to be moved outside the cropping boundary.                                                                                                                                                                                          |
| disableHiDPIScaling    | Boolean          | Set to `true` to disable devicePixelRatio based canvas scaling. Can improve perfermance of very large canvases on mobile devices.                                                                                                                                    |

## Accessing the resulting image

The resulting image will have the same resolution as the original image, regardless of the editor's size.
If you want the image sized in the dimensions of the canvas you can use `getImageScaledToCanvas`.

```javascript
import React from 'react'
import AvatarEditor from 'react-avatar-editor'

class MyEditor extends React.Component {
  onClickSave = () => {
    if (this.editor) {
      // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
      // drawn on another canvas, or added to the DOM.
      const canvas = this.editor.getImage()

      // If you want the image resized to the canvas size (also a HTMLCanvasElement)
      const canvasScaled = this.editor.getImageScaledToCanvas()
    }
  }

  setEditorRef = (editor) => (this.editor = editor)

  render() {
    return (
      <AvatarEditor
        ref={this.setEditorRef}
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

## Adding drag and drop

We recommend using [react-dropzone](https://github.com/react-dropzone/react-dropzone). It allows you to add
drag and drop support to anything really easy. Here is an example how to use it with react-avatar-editor:

```javascript
import React from 'react'
import AvatarEditor from 'react-avatar-editor'
import Dropzone from 'react-dropzone'

class MyEditor extends React.Component {
  state = {
    image: 'http://example.com/initialimage.jpg',
  }

  handleDrop = (dropped) => {
    this.setState({ image: dropped[0] })
  }

  render() {
    return (
      <Dropzone
        onDrop={this.handleDrop}
        noClick
        noKeyboard
        style={{ width: '250px', height: '250px' }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <AvatarEditor width={250} height={250} image={this.state.image} />
            <input {...getInputProps()} />
          </div>
        )}
      </Dropzone>
    )
  }
}
```

## Accessing the cropping rectangle

Sometimes you will need to get the cropping rectangle (the coordinates of the area of the image to keep),
for example in case you intend to perform the actual cropping server-side.

`getCroppingRect()` returns an object with four properties: `x`, `y`, `width` and `height`;
all relative to the image size (that is, comprised between 0 and 1). It is a method of AvatarEditor elements,
like `getImage()`.

_Note that:_ `getImage()` returns a canvas element and if you want to use it in `src` attribute of `img`, convert it into a blob url.

```js
const canvas = this.editor.getImage().toDataURL();
let imageURL;
fetch(canvas)
  .then(res => res.blob())
  .then(blob => (imageURL = window.URL.createObjectURL(blob)));

// Usage
<img src={imageURL} ... />
```

# Contributing

For development you can use following build tools:

- `npm run build`: Builds the _minified_ dist file: `dist/index.js`
- `npm run watch`: Watches for file changes and builds _unminified_ into: `dist/index.js`
- `npm run demo:build`: Builds the demo based on the dist file `dist/index.js`
- `npm run demo:watch`: Run webpack-dev-server. Check demo website [localhost:8080](http://localhost:8080)

## Kudos

Kudos and thanks to [danlee](https://github.com/dan-lee) for the imporant work & many contributions to this project!
Also thanks to [oyeanuj](https://github.com/oyeanuj), [mtlewis](https://github.com/mtlewis) and [hu9o](https://github.com/hu9o) and all other awesome people contributing to this.
