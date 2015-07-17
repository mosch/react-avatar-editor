# react-avatar-editor
[![SemVer]](http://semver.org)

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
| onImageReady | Callback function for when the image has been loaded into the editor
| style        | Styles for the canvas element 


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

* `npm run build`: Builds a minified dist file: `dist/build.min.js`
* `npm run build-debug`: Builds an unminified dist file with integrated source maps: `dist/build.js`
* `npm run build-watch`: The same as `build-debug`, but it watches `index.js` and dependencies for changes and rebuilds then.
* `npm run demo`: Builds the demo app in the `example/` directory.

[SemVer]: http://img.shields.io/:semver-1.2.6-brightgreen.svg?style=flat-square
