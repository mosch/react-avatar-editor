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
            height: React.PropTypes.number,
            showFullImage: React.PropTypes.bool
        },
        getDefaultProps: function () {
            return {
                scale: 1,
                border: 25,
                width: 200,
                height: 200,
                showFullImage: true
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
            var frameWidth  = this.getDimensions().width,
                frameHeight = this.getDimensions().height,
                newHeight,
                newWidth;

            if (width > height) {
                newHeight = (this.getDimensions().height);
                newWidth = (width * (newHeight / height));
                if (this.props.showFullImage && newWidth > frameWidth) {
                    newWidth = frameWidth;
                    newHeight = frameWidth * (height/width);
                }
            } else {
                newWidth = (this.getDimensions().width);
                newHeight = (height * (newWidth / width));
                if (this.props.showFullImage && newHeight > frameHeight) {
                    newWidth = frameWidth;
                    newHeight = frameWidth * (height/width);
                }
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
                context.drawImage(image.resource, position.centerX, position.centerY, position.width, position.height);
                context.restore();
            }
        },

        calculatePosition: function (image) {
            image = image || this.state.image;

            var x = image.x,
                y = image.y;
            
            var width = image.width * this.props.scale,
                height = height = image.height * this.props.scale,
                dimensions = this.getDimensions();

            var widthDiff = (width - image.width) / 2;
            var heightDiff = (height - image.height) / 2;
            
            var px = Math.min(x - widthDiff, dimensions.border);
            var py = Math.min(y - heightDiff, dimensions.border);

            var fromRight  = width + (px - dimensions.border);
            var fromBottom = height + (py - dimensions.border);
            
            px = fromRight  > dimensions.width  ? px : (px + (dimensions.width - fromRight));
            py = fromBottom > dimensions.height ? py : (py + (dimensions.height - fromBottom));

            var centerX = width  > dimensions.width ? px : (px + width / 2) - (dimensions.width/2);
            var centerY = height > dimensions.height ? py : (py + height / 2) - (dimensions.height/2);

            return {
                x: x,
                y: y,
                centerX: centerX,
                centerY: centerY,
                height: height,
                width: width
            };
        },

        getCroppingArea: function () {
            var imagePosition = this.calculatePosition();
            var image = this.state.image.resource;
            var scaleW = image.naturalWidth / imagePosition.width;
            var scaleH = image.naturalHeight / imagePosition.height;

            var border = this.props.border;
            var x = [-imagePosition.x+border] * scaleW;
            var y = [-imagePosition.y+border] * scaleH;
            var dimensions = this.getDimensions();

            var value = {
              x1: Math.floor(Math.max(x, 0)),
              y1: Math.floor(Math.max(y, 0))
            };

            value.x2 = Math.ceil(x + (dimensions.width * scaleW));
            value.y2 = Math.ceil(value.y1 + (dimensions.height * scaleH));
            return value;
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

                imageState.y = y;
                imageState.x = x;

            }

            this.setState(newState);
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