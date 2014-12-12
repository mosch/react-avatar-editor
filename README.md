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

![demo](http://media.giphy.com/media/yoJC2BbQgfX99p7Fe0/giphy.gif)
