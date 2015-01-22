/** @jsx React.DOM */
(function(root) {
    var factory = function(React) {
        return React.createClass({
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
                    image: {
                        x: 0,
                        y: 0
                    }
                };
            },

            getDimensions: function() {
                return {
                    width:  this.props.width,
                    height: this.props.height,
                    border: this.props.border,
                    canvas: {
                        width:  this.props.width  + (this.props.border * 2),
                        height: this.props.height + (this.props.border * 2)
                    }
                }
            },

            getImage: function() {
                var dom = document.createElement('canvas');
                var context = dom.getContext('2d');
                var border = this.getDimensions().border;
                var image = this.state.image;

                dom.width  = this.props.width;
                dom.height = this.props.height;

                context.globalCompositeOperation = 'destination-over';
                context.drawImage(image.resource, image.x - border, image.y - border, image.width, image.height);

                return dom.toDataURL();
            },

            loadImage: function(imageURL) {
                var imageObj = new Image();
                imageObj.onload = this.handleImageReady.bind(this, imageObj);
                imageObj.crossOrigin = 'anonymous';
                imageObj.src = imageURL;
            },

            componentDidMount: function() {
                var context = this.getDOMNode().getContext('2d');
                if (this.props.image) {
                    this.loadImage(this.props.image);
                }
                this.paint(context);
                document.addEventListener('mousemove', this.handleMouseMove, false);
                document.addEventListener('mouseup', this.handleMouseUp, false);
            },

            componentWillUnmount: function() {
                document.removeEventListener('mousemove', this.handleMouseMove, false);
                document.removeEventListener('mouseup', this.handleMouseUp, false);
            },

            componentDidUpdate: function() {
                var context = this.getDOMNode().getContext('2d');
                context.clearRect(0, 0, this.getDimensions().canvas.width, this.getDimensions().canvas.height);
                this.paint(context);
                this.drawImage(context);
            },

            handleImageReady: function(image) {
                var imageState = this.getInitialSizeAndPosition(image.width, image.height);
                imageState.resource = image;
                this.setState({ drag: false, image: imageState });
            },

            getInitialSizeAndPosition: function(width, height) {
                var newHeight, newWidth;

                if (width > height) {
                    newHeight = (this.getDimensions().height);
                    newWidth  = (width * (newHeight / height));
                } else {
                    newWidth  = (this.getDimensions().width);
                    newHeight = (height * (newWidth / width));
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
                var dimensions = this.getDimensions();
                var borderX = dimensions.height + dimensions.border;
                var borderY = dimensions.width  + dimensions.border;

                var lastX = this.state.image.x;
                var lastY = this.state.image.y;

                var x = Math.round((width  + lastX <= borderX) ? lastX + (borderX - (width  + lastX)) : lastX);
                var y = Math.round((height + lastY <= borderY) ? lastY + (borderY - (height + lastY)) : lastY);

                return {
                    x: x,
                    y: y
                };
            },

            componentWillReceiveProps: function(newProps) {
                var image = this.state.image;

                if (this.props.image != newProps.image) {
                    this.loadImage(newProps.image);
                } else  if (image.resource) {
                    var width =  (image.width / this.props.scale) * newProps.scale;
                    var height = (image.width / this.props.scale) * newProps.scale;

                    var minHeight = this.props.height;
                    var minWidth  = this.props.width;

                    if (width > height) {
                        // this is an horizontal image
                        height = height <= minHeight ? minHeight : height;
                        width  = (image.width*(height / image.height));
                    } else {
                        // this is an vertical image
                        width  = width <= minWidth ? minWidth : width;
                        height = (image.height*(width / image.width));
                    }

                    var position = this.calculatePosition(width, height);

                    this.setState({ image: { height: height, width: width, x: position.x, y: position.y, resource: image.resource }});
                }
            },

            drawImage: function(context) {
                var image = this.state.image;
                if (image.resource) {
                    context.save();
                    context.globalCompositeOperation = 'destination-over';
                    context.drawImage(image.resource, image.x, image.y, image.width, image.height);
                    context.restore();
                }
            },

            paint: function(context) {
                context.save();
                context.translate(0, 0);
                context.fillStyle = "rgba(255, 255, 255, 0.5)";

                var dimensions = this.getDimensions();

                var borderSize = dimensions.border;
                var height = dimensions.canvas.height;
                var width = dimensions.canvas.width;

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
                if (this.state.drag) {
                    this.setState({ drag: false });
                }
            },

            handleMouseMove: function(e) {
                if (this.state.drag) {
                    var dimensions = this.getDimensions();

                    var imageState = this.state.image;
                    var lastX = imageState.x;
                    var lastY = imageState.y;

                    if (this.state.mx && this.state.my) {
                        var xDiff = this.state.mx - e.clientX;
                        var yDiff = this.state.my - e.clientY;
                        var x = Math.min(lastX - xDiff, dimensions.border);
                        var y = Math.min(lastY - yDiff, dimensions.border);
                    } else {
                        var x = lastX;
                        var y = lastY;
                    }
                    var width  = imageState.width;
                    var height = imageState.height;

                    var left = (width  <= dimensions.width)  ? dimensions.border : (width  + x <= dimensions.width  + dimensions.border ? lastX : x);
                    var top =  (height <= dimensions.height) ? dimensions.border : (height + y <= dimensions.height + dimensions.border ? lastY : y);

                    imageState.x = left;
                    imageState.y = top;
                    this.setState({ mx: e.clientX, my: e.clientY, image: imageState });
                }
            },

            handleDragOver: function(e) {
                e.preventDefault();
            },
            handleDrop: function(e) {
                e.stopPropagation();
                e.preventDefault();

                var reader = new FileReader();
                reader.onload = this.handleUploadReady;
                reader.readAsDataURL(e.dataTransfer.files[0]);
            },
            handleUploadReady: function(e) {
                this.loadImage(e.target.result);
            },

            render: function() {
                return React.createElement('canvas', {
                    width: this.getDimensions().canvas.width,
                    height: this.getDimensions().canvas.height,
                    onMouseDown: this.handleMouseDown,
                    onDragOver: this.handleDragOver,
                    onDrop: this.handleDrop
                }, null);
            }


        });
    };

    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory(require("react"));
    } else if (typeof define === 'function' && define.amd) {
        define(["react"], factory);
    } else if (typeof exports === 'object') {
        exports.AvatarEditor = factory(require("react"));
    } else {
        root.AvatarEditor = factory(root.react);
    }
}(this));
