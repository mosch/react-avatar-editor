'use strict';

var React = require('react');

var isTouchDevice = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && ('ontouchstart' in window || navigator.msMaxTouchPoints > 0));
var draggableEvents = {
    mobile: {
        react: {
            down: 'onTouchStart',
            drag: 'onTouchMove',
            drop: 'onTouchEnd',
            move: 'onTouchMove',
            up: 'onTouchUp'
        },
        native: {
            down: 'touchstart',
            drag: 'touchmove',
            drop: 'touchend',
            move: 'touchmove',
            up: 'touchup'
        }
    },
    desktop: {
        react: {
            down: 'onMouseDown',
            drag: 'onDragOver',
            drop: 'onDrop',
            move: 'onMouseMove',
            up: 'onMouseUp'
        },
        native: {
            down: 'mousedown',
            drag: 'dragStart',
            drop: 'drop',
            move: 'mousemove',
            up: 'mouseup'
        }
    }
};
var deviceEvents = isTouchDevice ? draggableEvents.mobile : draggableEvents.desktop;

var ReactAvatarEditor = React.createClass({
    displayName: 'ReactAvatarEditor',

    propTypes: {
        scale: React.PropTypes.number,
        image: React.PropTypes.string,
        border: React.PropTypes.number,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        color: React.PropTypes.arrayOf(React.PropTypes.number),
        onImageReady: React.PropTypes.func,
        style: React.PropTypes.object
    },

    getDefaultProps: function getDefaultProps() {
        return {
            scale: 1,
            border: 25,
            width: 200,
            height: 200,
            color: [0, 0, 0, 0.5],
            onImageReady: function onImageReady() {},
            style: {}
        };
    },

    getInitialState: function getInitialState() {
        return {
            drag: false,
            my: null,
            mx: null,
            image: {
                x: 0,
                y: 0
            }
        };
    },

    getDimensions: function getDimensions() {
        return {
            width: this.props.width,
            height: this.props.height,
            border: this.props.border,
            canvas: {
                width: this.props.width + this.props.border * 2,
                height: this.props.height + this.props.border * 2
            }
        };
    },

    getImage: function getImage(type, quality) {
        var dom = document.createElement('canvas');
        var context = dom.getContext('2d');
        var dimensions = this.getDimensions();

        dom.width = dimensions.width;
        dom.height = dimensions.height;

        context.globalCompositeOperation = 'destination-over';

        var imageState = this.state.image;

        this.paintImage(context, {
            resource: imageState.resource,
            x: imageState.x - dimensions.border,
            y: imageState.y - dimensions.border,
            width: imageState.width,
            height: imageState.height
        });

        return dom.toDataURL(type, quality);
    },

    isDataURL: function isDataURL(str) {
        var regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        return !!str.match(regex);
    },

    loadImage: function loadImage(imageURL) {
        var imageObj = new Image();
        imageObj.onload = this.handleImageReady.bind(this, imageObj);
        if (!this.isDataURL(imageURL)) imageObj.crossOrigin = 'anonymous';
        imageObj.src = imageURL;
    },

    componentDidMount: function componentDidMount() {
        var context = this.getDOMNode().getContext('2d');
        if (this.props.image) {
            this.loadImage(this.props.image);
        }
        this.paint(context);
        document && document.addEventListener(deviceEvents.native.move, this.handleMouseMove, false);
        document && document.addEventListener(deviceEvents.native.up, this.handleMouseUp, false);

        if (isTouchDevice) React.initializeTouchEvents(true);
    },

    componentWillUnmount: function componentWillUnmount() {
        document && document.removeEventListener(deviceEvents.native.move, this.handleMouseMove, false);
        document && document.removeEventListener(deviceEvents.native.up, this.handleMouseUp, false);
    },

    componentDidUpdate: function componentDidUpdate() {
        var context = this.getDOMNode().getContext('2d');
        context.clearRect(0, 0, this.getDimensions().canvas.width, this.getDimensions().canvas.height);
        this.paint(context);
        this.paintImage(context, this.state.image);
    },

    handleImageReady: function handleImageReady(image) {
        var imageState = this.getInitialSize(image.width, image.height);
        imageState.resource = image;
        imageState.x = this.props.border;
        imageState.y = this.props.border;
        this.setState({ drag: false, image: imageState }, this.props.onImageReady);
    },

    getInitialSize: function getInitialSize(width, height) {
        var newHeight, newWidth, dimensions, canvasRatio, imageRatio;

        dimensions = this.getDimensions();

        canvasRatio = dimensions.height / dimensions.width;
        imageRatio = height / width;

        if (canvasRatio > imageRatio) {
            newHeight = this.getDimensions().height;
            newWidth = width * (newHeight / height);
        } else {
            newWidth = this.getDimensions().width;
            newHeight = height * (newWidth / width);
        }

        return {
            height: newHeight,
            width: newWidth
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (this.props.image != newProps.image) {
            this.loadImage(newProps.image);
        }
        if (this.props.scale != newProps.scale) {
            this.squeeze(newProps);
        }
    },

    paintImage: function paintImage(context, image) {
        if (image.resource) {
            var position = this.calculatePosition(image);
            context.save();
            context.globalCompositeOperation = 'destination-over';
            context.drawImage(image.resource, image.x, image.y, position.width, position.height);

            context.restore();
        }
    },

    calculatePosition: function calculatePosition(image) {
        image = image || this.state.image;
        var x,
            y,
            width,
            height,
            dimensions = this.getDimensions();

        width = image.width * this.props.scale;
        height = image.height * this.props.scale;
        var widthDiff = (width - image.width) / 2;
        var heightDiff = (height - image.height) / 2;
        x = image.x - widthDiff;
        y = image.y - heightDiff;

        // top and left border bounding
        x = Math.min(x, dimensions.border);
        y = Math.min(y, dimensions.border);

        // right and bottom
        var fromBottom = height + (y - dimensions.border);
        y = fromBottom > dimensions.height ? y : y + (dimensions.height - fromBottom);
        var fromRight = width + (x - dimensions.border);
        x = fromRight > dimensions.width ? x : x + (dimensions.width - fromRight);

        return {
            x: x,
            y: y,
            height: height,
            width: width
        };
    },

    paint: function paint(context) {
        context.save();
        context.translate(0, 0);
        context.fillStyle = 'rgba(' + this.props.color.slice(0, 4).join(',') + ')';

        var dimensions = this.getDimensions();

        var borderSize = dimensions.border;
        var height = dimensions.canvas.height;
        var width = dimensions.canvas.width;

        context.fillRect(0, 0, width, borderSize); // top
        context.fillRect(0, height - borderSize, width, borderSize); // bottom
        context.fillRect(0, borderSize, borderSize, height - borderSize * 2); // left
        context.fillRect(width - borderSize, borderSize, borderSize, height - borderSize * 2); // right

        context.restore();
    },

    handleMouseDown: function handleMouseDown() {
        this.setState({
            drag: true,
            mx: null,
            my: null
        });
    },
    handleMouseUp: function handleMouseUp() {
        if (this.state.drag) {
            this.setState({ drag: false });
        }
    },

    handleMouseMove: function handleMouseMove(e) {
        if (false == this.state.drag) {
            return;
        }

        var imageState = this.state.image;
        var lastX = imageState.x;
        var lastY = imageState.y;

        var mousePositionX = isTouchDevice ? event.targetTouches[0].pageX : e.clientX;
        var mousePositionY = isTouchDevice ? event.targetTouches[0].pageY : e.clientY;

        var newState = { mx: mousePositionX, my: mousePositionY, image: imageState };

        if (this.state.mx && this.state.my) {
            var xDiff = this.state.mx - mousePositionX;
            var yDiff = this.state.my - mousePositionY;

            imageState.y = this.getBoundedY(lastY - yDiff, this.props.scale);
            imageState.x = this.getBoundedX(lastX - xDiff, this.props.scale);
        }

        this.setState(newState);
    },

    squeeze: function squeeze(props) {
        var imageState = this.state.image;
        imageState.y = this.getBoundedY(imageState.y, props.scale);
        imageState.x = this.getBoundedX(imageState.x, props.scale);
        this.setState({ image: imageState });
    },

    getBoundedX: function getBoundedX(x, scale) {
        var image = this.state.image;
        var dimensions = this.getDimensions();
        var widthDiff = Math.ceil((image.width * scale - image.width) / 2);
        var rightPoint = Math.ceil(-image.width * scale + dimensions.width + dimensions.border);
        var leftPoint = dimensions.border;

        var result;
        if (x - widthDiff >= dimensions.border) result = dimensions.border + widthDiff;
        if (x < rightPoint) result = rightPoint;
        if (x > leftPoint) result = leftPoint;

        return result || x;
    },

    getBoundedY: function getBoundedY(y, scale) {
        var image = this.state.image;
        var dimensions = this.getDimensions();
        var heightDiff = Math.ceil((image.height * scale - image.height) / 2);
        var bottomPoint = Math.ceil(-image.height * scale + dimensions.height + dimensions.border);
        var topPoint = dimensions.border;

        var result;
        if (y - heightDiff >= dimensions.border) result = dimensions.border + heightDiff;
        if (y < bottomPoint) result = bottomPoint;
        if (y > topPoint) result = topPoint;

        return result || y;
    },

    handleDragOver: function handleDragOver(e) {
        e.preventDefault();
    },

    handleDrop: function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        var reader = new FileReader();
        reader.onload = this.handleUploadReady;
        reader.readAsDataURL(e.dataTransfer.files[0]);
    },

    handleUploadReady: function handleUploadReady(e) {
        this.loadImage(e.target.result);
    },

    render: function render() {
        var attributes = {
            width: this.getDimensions().canvas.width,
            height: this.getDimensions().canvas.height,
            style: this.props.style
        };

        attributes[deviceEvents.react.down] = this.handleMouseDown;
        attributes[deviceEvents.react.drag] = this.handleDragOver;
        attributes[deviceEvents.react.drop] = this.handleDrop;

        return React.createElement('canvas', attributes);
    }

});

module.exports = ReactAvatarEditor;
