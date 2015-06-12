(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['react'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('react'), root);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.React, root);
    }
}(this, function (React, global) {
    global = global || window
    var TOUCH = global.document && ( 'ontouchstart' in global.document || (global.document.navigator && global.document.navigator.msMaxTouchPoints) );
    var MOBILE_EVENTS = { down: 'onTouchStart', drag: 'onTouchMove', drop: 'onTouchEnd', move: 'touchmove', up: 'touchend' };
    var DESKTOP_EVENTS = { down: 'onMouseDown', drag: 'onDragOver', drop: 'onDrop', move: 'mousemove', up: 'mouseup' }
    var DEVICE_EVENTS = TOUCH ? MOBILE_EVENTS : DESKTOP_EVENTS;

    return React.createClass({
        propTypes: {
            scale: React.PropTypes.number,
            image: React.PropTypes.string,
            border: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number,
            color: React.PropTypes.arrayOf(React.PropTypes.number),
            onImageReady: React.PropTypes.func,
        },

        getDefaultProps: function () {
            return {
                scale: 1,
                border: 25,
                width: 200,
                height: 200,
                color: [0, 0, 0, 0.5],
                onImageReady: function() {}
            }
        },

        getInitialState: function () {
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

        getDimensions: function () {
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

        getImage: function (type, quality) {
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

        isDataURL: function(str) {
            regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
            return !!str.match(regex);
        },

        loadImage: function (imageURL) {
            var imageObj = new Image();
            imageObj.onload = this.handleImageReady.bind(this, imageObj);
            if (!this.isDataURL(imageURL)) imageObj.crossOrigin = 'anonymous';
            imageObj.src = imageURL;
        },

        componentDidMount: function () {
            var context = this.getDOMNode().getContext('2d');
            if (this.props.image) {
                this.loadImage(this.props.image);
            }
            this.paint(context);
            document && document.addEventListener('mousemove', this.handleMouseMove, false);
            document && document.addEventListener('mouseup', this.handleMouseUp, false);
        },

        componentWillUnmount: function () {
            document && document.removeEventListener('mousemove', this.handleMouseMove, false);
            document && document.removeEventListener('mouseup', this.handleMouseUp, false);
        },

        componentDidUpdate: function () {
            var context = this.getDOMNode().getContext('2d');
            context.clearRect(0, 0, this.getDimensions().canvas.width, this.getDimensions().canvas.height);
            this.paint(context);
            this.paintImage(context, this.state.image);
        },

        handleImageReady: function (image) {
            var imageState = this.getInitialSize(image.width, image.height);
            imageState.resource = image;
            imageState.x = this.props.border;
            imageState.y = this.props.border;
            this.setState({drag: false, image: imageState}, this.props.onImageReady);                        
        },

        getInitialSize: function (width, height) {
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

        componentWillReceiveProps: function (newProps) {
            var image = this.state.image;

            if (this.props.image != newProps.image) {
                this.loadImage(newProps.image);
            }
        },

        paintImage: function (context, image) {
            if (image.resource) {
                var position = this.calculatePosition(image);
                context.save();
                context.globalCompositeOperation = 'destination-over';
                context.drawImage(image.resource, image.x, image.y, position.width, position.height);
                context.restore();
            }
        },

        calculatePosition: function (image) {
            image = image || this.state.image;
            var x, y, width, height, dimensions = this.getDimensions();

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
            y = fromBottom > dimensions.height ? y : (y + (dimensions.height - fromBottom));
            var fromRight = width + (x - dimensions.border);
            x = fromRight > dimensions.width ? x : (x + (dimensions.width - fromRight));

            return {
                x: x,
                y: y,
                height: height,
                width: width
            }
        },

        paint: function (context) {
            context.save();
            context.translate(0, 0);
            context.fillStyle = "rgba("+this.props.color.slice(0, 4).join(",")+")";

            var dimensions = this.getDimensions();

            var borderSize = dimensions.border;
            var height = dimensions.canvas.height;
            var width = dimensions.canvas.width;

            context.fillRect(0, 0, width, borderSize); // top
            context.fillRect(0, height - borderSize, width, borderSize); // bottom
            context.fillRect(0, borderSize, borderSize, height - (borderSize * 2)); // left
            context.fillRect(width - borderSize, borderSize, borderSize, height - (borderSize * 2)); // right

            context.restore();
        },

        handleMouseDown: function () {
            this.setState({
                drag: true,
                mx: null,
                my: null
            });
        },
        handleMouseUp: function () {
            if (this.state.drag) {
                this.setState({drag: false});
            }
        },

        handleMouseMove: function (e) {
            if (false == this.state.drag) {
                return;
            }

            var newState = {}
            var dimensions = this.getDimensions();
            var imageState = this.state.image;
            var lastX = imageState.x;
            var lastY = imageState.y;

            var mousePositionX = TOUCH ? event.targetTouches[0].pageX : e.clientX;
            var mousePositionY = TOUCH ? event.targetTouches[0].pageY : e.clientY;

            newState = { mx: mousePositionX, my: mousePositionY, image: imageState };

            if (this.state.mx && this.state.my) {
                var xDiff = this.state.mx - mousePositionX;
                var yDiff = this.state.my - mousePositionY;

                imageState.y = this.getBoundedY(lastY - yDiff);
                imageState.x = this.getBoundedX(lastX - xDiff);
            }

            this.setState(newState);
        },

        getBoundedX: function (x) {
            var image = this.state.image;
            var dimensions = this.getDimensions();
            var scale = this.props.scale;
            var widthDiff = Math.ceil((image.width * scale - image.width) / 2);
            var rightPoint = Math.floor(-image.width*scale + dimensions.width + dimensions.border);
            var leftPoint = dimensions.border;

            var result;
            if (x - widthDiff >= dimensions.border) result = dimensions.border + widthDiff;
            if (x < rightPoint) result = rightPoint;
            if (x > leftPoint) result = leftPoint;

            return result || x;
        },

        getBoundedY: function (y) {
            var image = this.state.image;
            var dimensions = this.getDimensions();
            var scale = this.props.scale;
            var heightDiff = Math.ceil((image.height * scale - image.height) / 2);
            var bottomPoint = Math.ceil((-image.height * scale + dimensions.height + dimensions.border));
            var topPoint = dimensions.border;

            var result;
            if (y - heightDiff >= dimensions.border) result = dimensions.border + heightDiff;
            if (y < bottomPoint) result = bottomPoint;
            if (y > topPoint) result = topPoint;

            return result || y;
        },

        handleDragOver: function (e) {
            e.preventDefault();
        },

        handleDrop: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var reader = new FileReader();
            reader.onload = this.handleUploadReady;
            reader.readAsDataURL(e.dataTransfer.files[0]);
        },

        handleUploadReady: function (e) {
            this.loadImage(e.target.result);
        },

        render: function () {
            var attributes = {
                width: this.getDimensions().canvas.width,
                height: this.getDimensions().canvas.height,
            }
            attributes[DESKTOP_EVENTS['down']] =  this.handleMouseDown;
            attributes[DESKTOP_EVENTS['drag']] =  this.handleDragOver;
            attributes[DESKTOP_EVENTS['drop']] =  this.handleDrop;
            if(TOUCH){
                attributes[MOBILE_EVENTS['down']] =  this.handleMouseDown;
                attributes[MOBILE_EVENTS['drag']] =  this.handleDragOver;
                attributes[MOBILE_EVENTS['drop']] =  this.handleDrop;
            }
            return React.createElement('canvas', attributes, null);
        }

    });

}));
