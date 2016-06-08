var React = require('react');
var ReactDOM = require('react-dom');
var Editor = require('../dist/index.js');

// Used to display the cropping rect
var ImageWithRect = React.createClass({
    componentDidMount: function() {
        this.redraw();
    },
    componentDidUpdate: function() {
        this.redraw();
    },
    
    redraw: function() {
        var img = new Image();
        
        img.onload = function (ctx, rect, width, height) {
            ctx.drawImage(img, 0, 0, width, height);
            
            if (rect) {
                ctx.strokeStyle = "red";
                ctx.strokeRect (
                    Math.round(rect.x * width) + 0.5,
                    Math.round(rect.y * height) + 0.5,
                    Math.round(rect.width * width),
                    Math.round(rect.height * height)
                );
            }
        }.bind(this, this.refs.root.getContext('2d'), this.props.rect, this.props.width, this.props.height);
        
        img.src = this.props.image;
    },

    render: function() {
        return <canvas
          ref="root"
          style={this.props.style}
          width={this.props.width}
          height={this.props.height} />;
    }
});

// Actual app
var App = React.createClass({

    getInitialState: function() {
        return {
            scale: 1,
            borderRadius: 0,
            preview: null
        };
    },

    componentDidMount: function() {

    },

    handleSave: function(data) {
        var img = this.refs.avatar.getImage().toDataURL();
        var rect = this.refs.avatar.getCroppingRect();
        this.setState({preview: img, croppingRect: rect});
    },

    handleScale: function() {
        var scale = parseFloat(this.refs.scale.value);
        this.setState({scale: scale})
    },

    handleBorderRadius: function() {
        var borderRadius = parseInt(this.refs.borderRadius.value);
        this.setState({borderRadius: borderRadius})
    },

    logCallback: function(e) {
        console.log("callback", e);
    },

    render: function() {
        return <div>
                <Editor
                    ref="avatar"
                    scale={this.state.scale}
                    borderRadius={this.state.borderRadius}
                    onSave={this.handleSave}
                    onLoadFailed={this.logCallback.bind(this, 'onLoadFailed')}
                    onUpload={this.logCallback.bind(this, 'onUpload')}
                    onImageLoad={this.logCallback.bind(this, 'onImageLoad')}
                    image="example/avatar.jpg"/>
                <br />
                Zoom: <input name="scale" type="range" ref="scale" onChange={this.handleScale} min="1" max="2" step="0.01" defaultValue="1" />
                <br />
                Border radius: <input name="scale" type="range" ref="borderRadius" onChange={this.handleBorderRadius} min="0" max="100" step="1" defaultValue="0" />
                <br />
                <br />
                <input type="button" onClick={this.handleSave} value="Preview" />
                <br />
                <img src={this.state.preview} style={{borderRadius: this.state.borderRadius + 5 /* because of the 5px padding */}} />
                
                {this.state.croppingRect? // display only if there is a cropping rect
                    <ImageWithRect
                        width={200 * 478 / 270}
                        height={200}
                        image="example/avatar.jpg"
                        rect={this.state.croppingRect}
                        style={{margin: '10px 24px 32px', padding: 5, border: '1px solid #CCC'}} />
                        :
                        null}
            </div>
    }

});

ReactDOM.render(<App />, document.getElementById('app'));