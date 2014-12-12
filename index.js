/** @jsx React.DOM */
var React = require('react');

var AvatarEditor = React.createClass({
    propTypes: {
        scale: React.PropTypes.number,
        image: React.PropTypes.string,
        border: React.PropTypes.number,
        width: React.PropTypes.number,
        height: React.PropTypes.number
    },
    getDefaultProps: function() {
        return {
            scale: 1,
            border: 25,
            width: 250,
            height: 250
        }
    },
    getInitialState: function() {
        return {
            drag: false,
            my: null,
            mx: null,
            y: 0,
            x: 0,
            image: null,
            initialWidth: null,
            initialHeight: null,
            height: null,
            width: null
        };
    },

    getDimensions: function() {
        return {
            width: this.props.width,
            height: this.props.height,
            border: this.props.border,
            canvas: {
                height: this.props.height+(this.props.border*2),
                width: this.props.width+(this.props.width*2)
            }
        }
    },

    getImage: function() {
        var dom = document.createElement('canvas');
        dom.width  = this.props.width-(this.props.border*2);
        dom.height = this.props.height-(this.props.border*2);

        var context = dom.getContext('2d');
        context.globalCompositeOperation='destination-over';
        context.drawImage(this.state.image, this.state.x-this.props.border, this.state.y-this.props.border, this.state.width, this.state.height);

        return dom.toDataURL();
    },

    componentDidMount: function() {
        var context = this.getDOMNode().getContext('2d');
        if (this.props.image) {
            var imageObj = new Image();
            imageObj.onload = this.handleImageReady;
            imageObj.src = this.props.image;
            this.setState({image: imageObj});
        }
        this.paint(context);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    },

    componentWillUnmount: function() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    },

    componentDidUpdate: function() {
        var context = this.getDOMNode().getContext('2d');
        context.clearRect(0, 0, this.props.width, this.props.height);
        this.paint(context);
        this.drawImage(context);
    },

    handleImageReady: function() {
        this.setState(this.getInitialSizeAndPosition(this.state.image.width, this.state.image.height));
    },

    getInitialSizeAndPosition: function(width, height) {
        var newHeight, newWidth;

        if (width > height) {
            newHeight = (this.props.height-(this.props.border*2));
            newWidth = (width*(newHeight / height));
        } else {
            newWidth = (this.props.width-(this.props.border*2));
            newHeight = (height*(newWidth / width));
        }

        var position = this.calculatePosition(newWidth, newHeight);

        return {
            height: newHeight,
            width: newWidth,
            x: position.x,
            y: position.y
        };
    },

    calculatePosition: function(width, height) {

        var borderX = (this.props.height-this.props.border);
        var borderY = (this.props.width-this.props.border);

        var x = Math.round((width+this.state.x <= borderX) ? this.state.x+(borderX-(width+this.state.x)) : this.state.x);
        var y = Math.round((height+this.state.y <= borderY) ? this.state.y+(borderY-(height+this.state.y)) : this.state.y);

        return { x: x, y: y }
    },

    componentWillReceiveProps: function(props) {
        var image = this.state.image;
        var width = (this.state.width/this.props.scale)*props.scale;
        var height = (this.state.width/this.props.scale)*props.scale;

        var minHeight = (this.props.height-(this.props.border*2));
        var minWidth = (this.props.width-(this.props.border*2));

        var horizontal = width > height;
        // size
        if (horizontal) {
            height = height <= minHeight ? minHeight : height;
            width = (image.width*(height / image.height));
        } else {
            width  = width <= minWidth ? minWidth : width;
            height = (image.height*(width / image.width));
        }

        var position = this.calculatePosition(width, height);

        this.setState({height: height, width: width, x: position.x, y: position.y});
    },

    drawImage: function(context) {
        context.save();
        context.globalCompositeOperation='destination-over';
        context.drawImage(this.state.image, this.state.x, this.state.y, this.state.width, this.state.height);
        context.restore();
    },

    paint: function(context) {
        context.save();
        context.translate(0, 0);
        context.fillStyle = "rgba(255, 255, 255, 0.5)";

        var borderSize = this.props.border;
        var height = this.props.height;
        var width = this.props.width;

        context.fillRect(0, 0, width, borderSize); // top
        context.fillRect(0, height-borderSize, width, borderSize); // bottom
        context.fillRect(0, borderSize, borderSize, height-(borderSize*2)); // left
        context.fillRect(width-borderSize, borderSize, borderSize, height-(borderSize*2)); // right

        context.restore();
    },

    handleMouseDown: function() {
        this.setState({
            drag: true,
            mx: null,
            my: null
        });
    },
    handleMouseUp: function() {
        this.setState({drag: false});
    },

    handleMouseMove: function(e) {
        if (this.state.drag) {
            if (this.state.mx && this.state.my) {
                var xDiff = this.state.mx - e.clientX;
                var yDiff = this.state.my - e.clientY;
                var x = Math.min(this.state.x-xDiff, this.props.border);
                var y = Math.min(this.state.y-yDiff, this.props.border);
            } else {
                var x = this.state.x;
                var y = this.state.y;
            }
            var width = this.state.width;
            var height = this.state.height;

            var left = (width <= 200) ? 25 : (width+x <= 225 ? this.state.x : x);
            var top = (height <= 200) ? 25 : (height+y <= 225 ? this.state.y : y);

            this.setState({mx: e.clientX, my: e.clientY, x: left, y: top});
        }
    },

    handleDragOver: function(e) {
        e.preventDefault();
    },
    handleDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var reader = new FileReader();
        reader.onload = this.onUploadReady;
        reader.readAsDataURL(e.dataTransfer.files[0]);
    },
    onUploadReady: function(e) {
        var image = new Image();
        image.src = e.target.result;
        var state = this.getInitialSizeAndPosition(image.width, image.height);
        state.image = image;
        this.setState(state);
    },

    render: function() {
        return <canvas width={250} height={250}
        onMouseDown={this.handleMouseDown}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop} />;
    }

});


module.exports = AvatarEditor;