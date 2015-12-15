var React = require('react');
var ReactDOM = require('react-dom');

var isTouchDevice =
    !!(typeof window !== 'undefined' &&
       typeof navigator !== 'undefined' &&
       ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
      );
var draggableEvents = {
    touch: {
        react: {
            down: 'onTouchStart',
            mouseDown: 'onMouseDown',
            drag: 'onTouchMove',
            drop: 'onTouchEnd',
            move: 'onTouchMove',
            mouseMove: 'onMouseMove',
            up: 'onTouchEnd',
            mouseUp: 'onMouseUp'
        },
        native: {
            down: 'touchstart',
            mouseDown: 'mousedown',
            drag: 'touchmove',
            drop: 'touchend',
            move: 'touchmove',
            mouseMove: 'mousemove',
            up: 'touchend',
            mouseUp: 'mouseup'
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
var deviceEvents = isTouchDevice ? draggableEvents.touch : draggableEvents.desktop;

// Draws a rounded rectangle on a 2D context.
var drawRoundedRect = function(context, x, y, width, height, borderRadius) {
    if (borderRadius === 0) {
        context.rect(x, y, width, height);
    } else {
        var widthMinusRad = width - borderRadius;
        var heightMinusRad = height - borderRadius;
        context.translate(x, y);
        context.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI*1.5);
        context.lineTo(widthMinusRad, 0);
        context.arc(widthMinusRad, borderRadius, borderRadius, Math.PI*1.5, Math.PI*2);
        context.lineTo(width, heightMinusRad);
        context.arc(widthMinusRad, heightMinusRad, borderRadius, Math.PI*2, Math.PI*0.5);
        context.lineTo(borderRadius, height);
        context.arc(borderRadius, heightMinusRad, borderRadius, Math.PI*0.5, Math.PI);
        context.translate(-x, -y);
    }
}

var AvatarEditor = React.createClass({
    propTypes: {
        scale: React.PropTypes.number,
        image: React.PropTypes.string,
        border: React.PropTypes.number,
        borderRadius: React.PropTypes.number,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        color: React.PropTypes.arrayOf(React.PropTypes.number),
        style: React.PropTypes.object,

        onDropFile: React.PropTypes.func,
        onLoadFailure: React.PropTypes.func,
        onLoadSuccess: React.PropTypes.func,
        onImageReady: React.PropTypes.func,
    },

    getDefaultProps() {
        return {
            scale: 1,
            border: 25,
            borderRadius: 0,
            width: 200,
            height: 200,
            color: [0, 0, 0, 0.5],
            style: {},
            onDropFile() {},
            onLoadFailure() {},
            onLoadSuccess() {},
            onImageReady() {},
        }
    },

    getInitialState() {
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

    getDimensions() {
        return {
            width: this.props.width,
            height: this.props.height,
            border: this.props.border,
            canvas: {
                width: this.props.width + (this.props.border * 2),
                height: this.props.height + (this.props.border * 2)
            }
        }
    },

    getImage(type, quality) {
        var dom = document.createElement('canvas');
        var context = dom.getContext('2d');
        var dimensions = this.getDimensions();
        var border = 0;

        dom.width = dimensions.width;
        dom.height = dimensions.height;

        context.globalCompositeOperation = 'destination-over';

        this.paintImage(context, this.state.image, border);

        return dom.toDataURL(type, quality);
    },
    
    getCroppingRect() {
        var dim = this.getDimensions();
        var frameRect = {x: dim.border, y: dim.border, width: dim.width, height: dim.height};
        var imageRect = this.calculatePosition(this.state.image, dim.border);
        return {
            x: (frameRect.x - imageRect.x) / imageRect.width,
            y: (frameRect.y - imageRect.y) / imageRect.height,
            width: frameRect.width / imageRect.width,
            height: frameRect.height / imageRect.height,
        };
    },

    isDataURL(str) {
        var regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        return !!str.match(regex);
    },

    loadImage(imageURL) {
        var imageObj = new Image();
        imageObj.onload = this.handleImageReady.bind(this, imageObj);
        imageObj.onerror = this.props.onLoadFailure;
        if (!this.isDataURL(imageURL)) imageObj.crossOrigin = 'anonymous';
        imageObj.src = imageURL;
    },

    componentDidMount() {
        var context = ReactDOM.findDOMNode(this.refs.canvas).getContext('2d');
        if (this.props.image) {
            this.loadImage(this.props.image);
        }
        this.paint(context);
        if (document) {
            var nativeEvents = deviceEvents.native;
            document.addEventListener(nativeEvents.move, this.handleMouseMove, false);
            document.addEventListener(nativeEvents.up, this.handleMouseUp, false);
            if (isTouchDevice) {
                document.addEventListener(nativeEvents.mouseMove, this.handleMouseMove, false);
                document.addEventListener(nativeEvents.mouseUp, this.handleMouseUp, false);
            }
        }

        if (isTouchDevice && React.initializeTouchEvents) React.initializeTouchEvents(true);
    },

    componentWillUnmount() {
        if (document) {
            var nativeEvents = deviceEvents.native;
            document.removeEventListener(nativeEvents.move, this.handleMouseMove, false);
            document.removeEventListener(nativeEvents.up, this.handleMouseUp, false);
            if (isTouchDevice) {
                document.removeEventListener(nativeEvents.mouseMove, this.handleMouseMove, false);
                document.removeEventListener(nativeEvents.mouseUp, this.handleMouseUp, false);
            }
        }
    },

    componentDidUpdate() {
        var context = ReactDOM.findDOMNode(this.refs.canvas).getContext('2d');
        context.clearRect(0, 0, this.getDimensions().canvas.width, this.getDimensions().canvas.height);
        this.paint(context);
        this.paintImage(context, this.state.image, this.props.border);
    },

    handleImageReady(image) {
        var imageState = this.getInitialSize(image.width, image.height);
        imageState.resource = image;
        imageState.x = 0;
        imageState.y = 0;
        this.props.onLoadSuccess(imageState);
        this.setState({drag: false, image: imageState}, this.props.onImageReady);
    },

    getInitialSize(width, height) {
        var newHeight, newWidth, dimensions, canvasRatio, imageRatio;

        dimensions = this.getDimensions();

        canvasRatio = dimensions.height / dimensions.width;
        imageRatio = height / width;

        if (canvasRatio > imageRatio) {
            newHeight = (this.getDimensions().height);
            newWidth = (width * (newHeight / height));
        } else {
            newWidth = (this.getDimensions().width);
            newHeight = (height * (newWidth / width));
        }

        return {
            height: newHeight,
            width: newWidth
        };
    },

    componentWillReceiveProps(newProps) {
        if (this.props.image != newProps.image) {
            this.loadImage(newProps.image);
        }
        if (
            this.props.scale != newProps.scale
            || this.props.height != newProps.height
            || this.props.width != newProps.width
            || this.props.border != newProps.border
        ) {
            this.squeeze(newProps);
        }
    },

    paintImage(context, image, border) {
        if (image.resource) {
            var position = this.calculatePosition(image, border);
            context.save();
            context.globalCompositeOperation = 'destination-over';
            context.drawImage(image.resource, position.x, position.y, position.width, position.height);

            context.restore();
        }
    },

    calculatePosition(image, border) {
        image = image || this.state.image;
        var x, y, width, height, dimensions = this.getDimensions();
        width = image.width * this.props.scale;
        height = image.height * this.props.scale;

        var widthDiff = (width - dimensions.width) / 2;
        var heightDiff = (height - dimensions.height) / 2;
        x = image.x * this.props.scale - widthDiff + border;
        y = image.y * this.props.scale - heightDiff + border;

        return {
            x: x,
            y: y,
            height: height,
            width: width
        }
    },

    paint(context) {
        context.save();
        context.translate(0, 0);
        context.fillStyle = "rgba("+this.props.color.slice(0, 4).join(",")+")";

        var dimensions = this.getDimensions();

        var borderSize = dimensions.border;
        var borderRadius = this.props.borderRadius;
        var height = dimensions.canvas.height;
        var width = dimensions.canvas.width;
        
        // clamp border radius between zero (perfect rectangle) and half the size without borders (perfect circle or "pill")
        borderRadius = Math.max(borderRadius, 0);
        borderRadius = Math.min(borderRadius, width/2 - borderSize, height/2 - borderSize);
        
        context.beginPath();
        drawRoundedRect(context, borderSize, borderSize, width - borderSize*2, height - borderSize*2, borderRadius); // inner rect, possibly rounded
        context.rect(width, 0, -width, height); // outer rect, drawn "counterclockwise"
        context.fill();

        context.restore();
    },

    handleMouseDown(e) {
        var e = e || window.event;
        // if e is a touch event, preventDefault keeps
        // corresponding mouse events from also being fired
        // later.
        e.preventDefault();
        this.setState({
            drag: true,
            mx: null,
            my: null
        });
    },
    handleMouseUp() {
        if (this.state.drag) {
            this.setState({drag: false});
        }
    },

    handleMouseMove(e) {
        var e = e || window.event;
        if (false == this.state.drag) {
            return;
        }

        var imageState = this.state.image;
        var lastX = imageState.x;
        var lastY = imageState.y;

        var mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX;
        var mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY;

        var newState = { mx: mousePositionX, my: mousePositionY, image: imageState };

        if (this.state.mx && this.state.my) {
            var xDiff = (this.state.mx - mousePositionX) / this.props.scale;
            var yDiff = (this.state.my - mousePositionY) / this.props.scale;

            imageState.y = this.getBoundedY(lastY - yDiff, this.props.scale);
            imageState.x = this.getBoundedX(lastX - xDiff, this.props.scale);
        }

        this.setState(newState);
    },

    squeeze(props) {
        var imageState = this.state.image;
        imageState.y = this.getBoundedY(imageState.y, props.scale);
        imageState.x = this.getBoundedX(imageState.x, props.scale);
        this.setState({ image: imageState });
    },

    getBoundedX(x, scale) {
        var image = this.state.image;
        var dimensions = this.getDimensions();
        var widthDiff = Math.floor((image.width - dimensions.width / scale) / 2);
        widthDiff = Math.max(0, widthDiff);
        return Math.max(-widthDiff, Math.min(x, widthDiff));
    },

    getBoundedY(y, scale) {
        var image = this.state.image;
        var dimensions = this.getDimensions();
        var heightDiff = Math.floor((image.height - dimensions.height / scale) / 2);
        heightDiff = Math.max(0, heightDiff);
        return Math.max(-heightDiff, Math.min(y, heightDiff));
    },

    handleDragOver(e) {
        var e = e || window.event;
        e.preventDefault();
    },

    handleDrop(e) {
        var e = e || window.event;
        e.stopPropagation();
        e.preventDefault();
        
        if (e.dataTransfer && e.dataTransfer.files.length) {
            this.props.onDropFile(e);
            let reader = new FileReader();
            let file = e.dataTransfer.files[0];
            reader.onload = (e) => this.loadImage(e.target.result);
            reader.readAsDataURL(file);
        }
    },

    render() {
        var defaultStyle = {
            cursor: this.state.drag? 'grabbing' : 'grab'
        };
    
        var attributes = {
            width: this.getDimensions().canvas.width,
            height: this.getDimensions().canvas.height,
            style: {...defaultStyle, ...this.props.style}
        };

        attributes[deviceEvents.react.down] = this.handleMouseDown;
        attributes[deviceEvents.react.drag] = this.handleDragOver;
        attributes[deviceEvents.react.drop] = this.handleDrop;
        if (isTouchDevice) attributes[deviceEvents.react.mouseDown] = this.handleMouseDown;

        return <canvas ref='canvas' {...attributes} />;
    }
});

export default AvatarEditor;
