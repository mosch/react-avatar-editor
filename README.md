# react-avatar-editor

<p align="center">
  <a href="http://badge.fury.io/js/react-avatar-editor"><img alt="npm version" src="https://badge.fury.io/js/react-avatar-editor.svg"></a>
  <a href="https://npmjs.org/package/react-avatar-editor"><img alt="Downloads" src="http://img.shields.io/npm/dm/react-avatar-editor.svg"></a>
</p>

Facebook like, avatar / profile picture component.
Resize and crop your uploaded image using a clear user interface.

# Usage


```javascript

var React = require('react'),
  AvatarEditor = require('react-avatar-editor');

var MyEditor = React.createClass({

  render: function() {
    return (
        <AvatarEditor
          image="http://example.com/initialimage.jpg"
          width={250}
          height={250}
          border={50}
          color={[255, 255, 255, 0.6]} // RGBA
          scale={1.2} />
    );
  }

});

module.exports = MyEditor;
```

## Props
| Prop         | Description
| ------------ | ---------------
| width        | The total width of the editor
| height       | The total width of the editor
| border       | The cropping border. Image will be visible through the border, but cut off in the resulting image.
| color        | The color of the cropping border
| style        | Styles for the canvas element
| scale        | The scale of the image. You can use this to add your own resizing slider.
| angle        | The rotation angle of the image. Possible options are 0, 90, 180, 270 deg
| onUpload     | Callback. Invoked when user uploads an image via drag & drop 
| onImageLoad  | Callback. Invoked when a new image is loaded into the editor.
| onLoadFailed | Callback. Invoked when an uploaded image / passed image could not get loaded.

## Accessing the resulting image

The size of the resulting image will have the width and the height of the editor - minus the borders.

```javascript

var React = require('react'),
  AvatarEditor = require('react-avatar-editor');

var MyEditor = React.createClass({
  onClickSave: function() {
    var dataURL = this.refs.editor.getImage();
    // now save it to the state and set it as <img src="…" /> or send it somewhere else
  },
  render: function() {
    return (
        <AvatarEditor
          image="http://example.com/initialimage.jpg"
          width={250}
          height={250}
          border={50}
          scale={1.2} />
    );
  }

});

module.exports = MyEditor;
```

# Development

For development you can use following build tools:

* `npm run build`: Builds a minified dist file: `dist/index.js`
* `npm run build-debug`: Builds an unminified dist file: `dist/index.js`
* `npm run watch`: Watches for file changes and builds unminified into: `dist/index.js`
* `npm run demo`: Builds the demo based on the dist file `dist/index.js`
