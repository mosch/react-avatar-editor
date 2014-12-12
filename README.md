# react-avatar-editor
Facebook like, avatar / profile picture component.
Resize and crop your uploaded image using a clear user interface.

# Usage


```javascript

var React = require('react'),
  AvatarEditor = require('react-avatar-editor');

var MyEditor = React.createClass({

  render: function() {
    return (
        <AvatarEditor image="http://example.com/initialimage.jpg" width="250" height="250" border"50" scale="1.2"/>
    );
  }

});

module.exports = SomeAwesomeComponent;
```

## Props
### width
The total width of the editor
## height
The total width of the editor
## border
The cropping border. Image will be visible through the border, but cut off in the resulting image. 

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
        <AvatarEditor ref="editor" image="http://example.com/initial-image.jpg" width="250" height="250" border"50" scale="1.2"/>
    );
  }

});

module.exports = SomeAwesomeComponent;
```

