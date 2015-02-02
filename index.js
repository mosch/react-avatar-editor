(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['react'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('react'));
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.react);
    }
}(this, function (React) {

    return React.createClass({
        propTypes: {
            scale: React.PropTypes.number,
            image: React.PropTypes.string,
            border: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number
        },
        getDefaultProps: function () {
            return {
                scale: 1,
                border: 25,
                width: 200,
                height: 200
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

        getImage: function () {
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

            return dom.toDataURL();
        },

        loadImage: function (imageURL) {
            var imageObj = new Image();
            imageObj.onload = this.handleImageReady.bind(this, imageObj);
            imageObj.crossOrigin = 'anonymous';
            imageObj.src = imageURL;
        },

        componentDidMount: function () {
            var context = this.getDOMNode().getContext('2d');
            if (this.props.image) {
                this.loadImage(this.props.image);
            }
            this.paint(context);
            document.addEventListener('mousemove', this.handleMouseMove, false);
            document.addEventListener('mouseup', this.handleMouseUp, false);
        },

        componentWillUnmount: function () {
            document.removeEventListener('mousemove', this.handleMouseMove, false);
            document.removeEventListener('mouseup', this.handleMouseUp, false);
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
            this.setState({drag: false, image: imageState});
        },

        getInitialSize: function (width, height) {
            var newHeight, newWidth;

            if (width > height) {
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
            } else if (this.props.scale !== newProps.scale) {
                this.setState({lastScale: this.props.scale});
            }
        },

        paintImage: function (context, image) {
            if (image.resource) {
                var position = this.calculatePosition(image);
                context.save();
                context.globalCompositeOperation = 'destination-over';
                context.drawImage(image.resource, position.x, position.y, position.width, position.height);
                context.restore();
            }
        },

        calculatePosition: function (image) {
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
            context.fillStyle = "rgba(0, 0, 0, 0.5)";

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

            var mousePositionX = e.clientX;
            var mousePositionY = e.clientY;

            newState = {mx: mousePositionX, my: mousePositionY, image: imageState};

            if (this.state.mx && this.state.my) {
                var xDiff = this.state.mx - mousePositionX;
                var yDiff = this.state.my - mousePositionY;
                xDiff = Math.max(-5, Math.min(5, xDiff));
                yDiff = Math.max(-5, Math.min(5, yDiff));

                var x = lastX - xDiff;
                var y = lastY - yDiff;

                var yMove = yDiff < 0 ? 'down' : 'up';
                var xMove = xDiff < 0 ? 'right' : 'left';
                imageState.y = this.getBoundedY(y);
                imageState.x = this.getBoundedX(x);
            }

            this.setState(newState);
        },

        getBoundedX: function (x) {
            var image = this.state.image;
            var imageDiff = image.width*this.props.scale - image.width;
            var cropWidth = this.getDimensions().width;
            var left = Math.floor(imageDiff/2 + this.props.border - x);
            var right = Math.floor(image.width*this.props.scale - cropWidth - this.props.border - (imageDiff/2) + x);
            if (left < 0)  return image.x;
            if (right < 0) return image.x;
            return x;
        },

        getBoundedY: function (y) {
            var image = this.state.image;
            var imageDiff = image.height*this.props.scale - image.height;
            var cropHeight = this.getDimensions().height;
            var top = Math.floor(imageDiff/2 + this.props.border - y);
            var bottom = Math.floor(image.height*this.props.scale - cropHeight - this.props.border - (imageDiff/2) + y);
            if (top < 0)  return image.y;
            if (bottom < 0) return image.y;
            return y;
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
            return React.createElement('canvas', {
                width: this.getDimensions().canvas.width,
                height: this.getDimensions().canvas.height,
                onMouseDown: this.handleMouseDown,
                onDragOver: this.handleDragOver,
                onDrop: this.handleDrop
            }, null);
        }

    });

}));