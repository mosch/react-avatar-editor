!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("prop-types"),require("react")):"function"==typeof define&&define.amd?define(["prop-types","react"],t):(e="undefined"!=typeof globalThis?globalThis:e||self).AvatarEditor=t(e.PropTypes,e.React)}(this,function(e,t){"use strict";function o(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=o(e),r=o(t);function a(t,e){var o,n=Object.keys(t);return Object.getOwnPropertySymbols&&(o=Object.getOwnPropertySymbols(t),e&&(o=o.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),n.push.apply(n,o)),n}function d(t){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{};e%2?a(Object(o),!0).forEach(function(e){s(t,e,o[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(o)):a(Object(o)).forEach(function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(o,e))})}return t}function i(e,t){for(var o=0;o<t.length;o++){var n=t[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function s(e,t,o){return t in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e}function u(){return(u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var o,n=arguments[t];for(o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e}).apply(this,arguments)}function h(e){return(h=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function c(e,t){return(c=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function l(e,t){if(null==e)return{};var o,n=function(e,t){if(null==e)return{};for(var o,n={},a=Object.keys(e),r=0;r<a.length;r++)o=a[r],0<=t.indexOf(o)||(n[o]=e[o]);return n}(e,t);if(Object.getOwnPropertySymbols)for(var a=Object.getOwnPropertySymbols(e),r=0;r<a.length;r++)o=a[r],0<=t.indexOf(o)||Object.prototype.propertyIsEnumerable.call(e,o)&&(n[o]=e[o]);return n}function p(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function g(o){var n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(e){return!1}}();return function(){var e,t=h(o);return e=n?(e=h(this).constructor,Reflect.construct(t,arguments,e)):t.apply(this,arguments),t=this,!(e=e)||"object"!=typeof e&&"function"!=typeof e?p(t):e}}function f(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var o=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=o){var n,a,r=[],i=!0,s=!1;try{for(o=o.call(e);!(i=(n=o.next()).done)&&(r.push(n.value),!t||r.length!==t);i=!0);}catch(e){s=!0,a=e}finally{try{i||null==o.return||o.return()}finally{if(s)throw a}}return r}}(e,t)||m(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function m(e,t){if(e){if("string"==typeof e)return v(e,t);var o=Object.prototype.toString.call(e).slice(8,-1);return"Map"===(o="Object"===o&&e.constructor?e.constructor.name:o)||"Set"===o?Array.from(e):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?v(e,t):void 0}}function v(e,t){(null==t||t>e.length)&&(t=e.length);for(var o=0,n=new Array(t);o<t;o++)n[o]=e[o];return n}function y(n,a){return new Promise(function(e,t){var o=new Image;o.onload=function(){return e(o)},o.onerror=t,!1==(null!==(t=n)&&!!t.match(/^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i))&&a&&(o.crossOrigin=a),o.src=n})}var b,w=["scale","rotate","image","border","borderRadius","width","height","position","color","backgroundColor","style","crossOrigin","onLoadFailure","onLoadSuccess","onImageReady","onImageChange","onMouseUp","onMouseMove","onPositionChange","disableBoundaryChecks","disableHiDPIScaling","disableCanvasRotation"],M=!("undefined"==typeof window||"undefined"==typeof navigator||!("ontouchstart"in window||0<navigator.msMaxTouchPoints)),O="undefined"!=typeof File,t={touch:{react:{down:"onTouchStart",mouseDown:"onMouseDown",drag:"onTouchMove",move:"onTouchMove",mouseMove:"onMouseMove",up:"onTouchEnd",mouseUp:"onMouseUp"},native:{down:"touchstart",mouseDown:"mousedown",drag:"touchmove",move:"touchmove",mouseMove:"mousemove",up:"touchend",mouseUp:"mouseup"}},desktop:{react:{down:"onMouseDown",drag:"onDragOver",move:"onMouseMove",up:"onMouseUp"},native:{down:"mousedown",drag:"dragStart",move:"mousemove",up:"mouseup"}}},I=M?t.touch:t.desktop,P="undefined"!=typeof window&&window.devicePixelRatio?window.devicePixelRatio:1,C={x:.5,y:.5},t=function(){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&c(e,t)}(a,r["default"].Component);var e,t,o,n=g(a);function a(e){var l;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),s(p(l=n.call(this,e)),"state",{drag:!1,my:null,mx:null,image:C}),s(p(l),"handleImageReady",function(e){var t=l.getInitialSize(e.width,e.height);t.resource=e,t.x=.5,t.y=.5,t.backgroundColor=l.props.backgroundColor,l.setState({drag:!1,image:t},l.props.onImageReady),l.props.onLoadSuccess(t)}),s(p(l),"clearImage",function(){l.canvas.getContext("2d").clearRect(0,0,l.canvas.width,l.canvas.height),l.setState({image:C})}),s(p(l),"handleMouseDown",function(e){(e=e||window.event).preventDefault(),l.setState({drag:!0,mx:null,my:null})}),s(p(l),"handleMouseUp",function(){l.state.drag&&(l.setState({drag:!1}),l.props.onMouseUp())}),s(p(l),"handleMouseMove",function(e){var t,o,n,a,r,i,s,u,h,c;e=e||window.event,!1!==l.state.drag&&(e.preventDefault(),t={mx:i=e.targetTouches?e.targetTouches[0].pageX:e.clientX,my:u=e.targetTouches?e.targetTouches[0].pageY:e.clientY},c=l.props.rotate,c=(c%=360)<0?c+360:c,l.state.mx&&l.state.my&&(o=l.state.mx-i,n=l.state.my-u,a=l.state.image.width*l.props.scale,h=l.state.image.height*l.props.scale,r=(s=l.getCroppingRect()).x,i=s.y,r*=a,i*=h,u=function(e){return e*(Math.PI/180)},s=Math.cos(u(c)),c=i+-o*(u=Math.sin(u(c)))+n*s,h={x:(r+o*s+n*u)/a+1/l.props.scale*l.getXScale()/2,y:c/h+1/l.props.scale*l.getYScale()/2},l.props.onPositionChange(h),t.image=d(d({},l.state.image),h)),l.setState(t),l.props.onMouseMove(e))}),s(p(l),"setCanvas",function(e){l.canvas=e}),l.canvas=null,l}return e=a,(t=[{key:"componentDidMount",value:function(){this.props.disableHiDPIScaling&&(P=1);var e,t=this.canvas.getContext("2d");this.props.image&&this.loadImage(this.props.image),this.paint(t),document&&(e=!!function(){var t=!1;try{var e=Object.defineProperty({},"passive",{get:function(){t=!0}});window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){t=!1}return t}()&&{passive:!1},t=I.native,document.addEventListener(t.move,this.handleMouseMove,e),document.addEventListener(t.up,this.handleMouseUp,e),M&&(document.addEventListener(t.mouseMove,this.handleMouseMove,e),document.addEventListener(t.mouseUp,this.handleMouseUp,e)))}},{key:"componentDidUpdate",value:function(e,t){this.props.image&&this.props.image!==e.image||this.props.width!==e.width||this.props.height!==e.height||this.props.backgroundColor!==e.backgroundColor?this.loadImage(this.props.image):this.props.image||t.image===C||this.clearImage();var o=this.canvas.getContext("2d");o.clearRect(0,0,this.canvas.width,this.canvas.height),this.paint(o),this.paintImage(o,this.state.image,this.props.border),e.image===this.props.image&&e.width===this.props.width&&e.height===this.props.height&&e.position===this.props.position&&e.scale===this.props.scale&&e.rotate===this.props.rotate&&t.my===this.state.my&&t.mx===this.state.mx&&t.image.x===this.state.image.x&&t.image.y===this.state.image.y&&t.backgroundColor===this.state.backgroundColor||this.props.onImageChange()}},{key:"componentWillUnmount",value:function(){var e;document&&(e=I.native,document.removeEventListener(e.move,this.handleMouseMove,!1),document.removeEventListener(e.up,this.handleMouseUp,!1),M&&(document.removeEventListener(e.mouseMove,this.handleMouseMove,!1),document.removeEventListener(e.mouseUp,this.handleMouseUp,!1)))}},{key:"isVertical",value:function(){return!this.props.disableCanvasRotation&&this.props.rotate%180!=0}},{key:"getBorders",value:function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:this.props.border;return Array.isArray(e)?e:[e,e]}},{key:"getDimensions",value:function(){var e=this.props,t=e.width,o=e.height,n=e.rotate,a=e.border,r={},i=f(this.getBorders(a),2),s=i[0],u=i[1],e=t,i=o;return this.isVertical()?(r.width=i,r.height=e):(r.width=e,r.height=i),r.width+=2*s,r.height+=2*u,{canvas:r,rotate:n,width:t,height:o,border:a}}},{key:"getImage",value:function(){var e=this.getCroppingRect(),t=this.state.image;e.x*=t.resource.width,e.y*=t.resource.height,e.width*=t.resource.width,e.height*=t.resource.height;var o=document.createElement("canvas");this.isVertical()?(o.width=e.height,o.height=e.width):(o.width=e.width,o.height=e.height);var n=o.getContext("2d");return n.translate(o.width/2,o.height/2),n.rotate(this.props.rotate*Math.PI/180),n.translate(-o.width/2,-o.height/2),this.isVertical()&&n.translate((o.width-o.height)/2,(o.height-o.width)/2),t.backgroundColor&&(n.fillStyle=t.backgroundColor,n.fillRect(-e.x,-e.y,t.resource.width,t.resource.height)),n.drawImage(t.resource,-e.x,-e.y),o}},{key:"getImageScaledToCanvas",value:function(){var e=this.getDimensions(),t=e.width,o=e.height,e=document.createElement("canvas");return this.isVertical()?(e.width=o,e.height=t):(e.width=t,e.height=o),this.paintImage(e.getContext("2d"),this.state.image,0,1),e}},{key:"getXScale",value:function(){var e=this.props.width/this.props.height,t=this.state.image.width/this.state.image.height;return Math.min(1,e/t)}},{key:"getYScale",value:function(){var e=this.props.height/this.props.width,t=this.state.image.height/this.state.image.width;return Math.min(1,e/t)}},{key:"getCroppingRect",value:function(){var e=this.props.position||{x:this.state.image.x,y:this.state.image.y},t=1/this.props.scale*this.getXScale(),o=1/this.props.scale*this.getYScale(),n={x:e.x-t/2,y:e.y-o/2,width:t,height:o},a=0,r=1-n.width,i=0,e=1-n.height;return(this.props.disableBoundaryChecks||1<t||1<o)&&(a=-n.width,i=-n.height,e=r=1),d(d({},n),{},{x:Math.max(a,Math.min(n.x,r)),y:Math.max(i,Math.min(n.y,e))})}},{key:"loadImage",value:function(e){var t;O&&e instanceof File?this.loadingImage=(t=e,new Promise(function(o,n){var e=new FileReader;e.onload=function(e){try{var t=y(e.target.result);o(t)}catch(e){n(e)}},e.readAsDataURL(t)}).then(this.handleImageReady).catch(this.props.onLoadFailure)):"string"==typeof e&&(this.loadingImage=y(e,this.props.crossOrigin).then(this.handleImageReady).catch(this.props.onLoadFailure))}},{key:"getInitialSize",value:function(e,t){var o,n,a=this.getDimensions();return t/e<a.height/a.width?n=e*((o=this.getDimensions().height)/t):o=t*((n=this.getDimensions().width)/e),{height:o,width:n}}},{key:"paintImage",value:function(e,t,o){var n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:P;t.resource&&(o=this.calculatePosition(t,o),e.save(),e.translate(e.canvas.width/2,e.canvas.height/2),e.rotate(this.props.rotate*Math.PI/180),e.translate(-e.canvas.width/2,-e.canvas.height/2),this.isVertical()&&e.translate((e.canvas.width-e.canvas.height)/2,(e.canvas.height-e.canvas.width)/2),e.scale(n,n),e.globalCompositeOperation="destination-over",e.drawImage(t.resource,o.x,o.y,o.width,o.height),t.backgroundColor&&(e.fillStyle=t.backgroundColor,e.fillRect(o.x,o.y,o.width,o.height)),e.restore())}},{key:"calculatePosition",value:function(e,t){e=e||this.state.image;var o=f(this.getBorders(t),2),n=o[0],a=o[1],r=this.getCroppingRect(),t=e.width*this.props.scale,o=e.height*this.props.scale,e=-r.x*t,r=-r.y*o;return this.isVertical()?(e+=a,r+=n):(e+=n,r+=a),{x:e,y:r,height:o,width:t}}},{key:"paint",value:function(e){e.save(),e.scale(P,P),e.translate(0,0),e.fillStyle="rgba("+this.props.color.slice(0,4).join(",")+")";var t,o,n,a=this.props.borderRadius,r=this.getDimensions(),i=f(this.getBorders(r.border),2),s=i[0],u=i[1],h=r.canvas.height,c=r.canvas.width,a=Math.max(a,0);a=Math.min(a,c/2-s,h/2-u),e.beginPath(),t=e,n=c-2*(o=s),r=h-2*(i=u),0===(s=a)?t.rect(o,i,n,r):(u=n-s,a=r-s,t.translate(o,i),t.arc(s,s,s,Math.PI,1.5*Math.PI),t.lineTo(u,0),t.arc(u,s,s,1.5*Math.PI,2*Math.PI),t.lineTo(n,a),t.arc(u,a,s,2*Math.PI,.5*Math.PI),t.lineTo(s,r),t.arc(s,a,s,.5*Math.PI,Math.PI),t.translate(-o,-i)),e.rect(c,0,-c,h),e.fill("evenodd"),e.restore()}},{key:"render",value:function(){var e=this.props;e.scale,e.rotate,e.image,e.border,e.borderRadius,e.width,e.height,e.position,e.color,e.backgroundColor;var t=e.style;e.crossOrigin,e.onLoadFailure,e.onLoadSuccess,e.onImageReady,e.onImageChange,e.onMouseUp,e.onMouseMove,e.onPositionChange,e.disableBoundaryChecks,e.disableHiDPIScaling,e.disableCanvasRotation;var o=l(e,w),n=this.getDimensions(),e={width:n.canvas.width,height:n.canvas.height,cursor:this.state.drag?"grabbing":"grab",touchAction:"none"},t={width:n.canvas.width*P,height:n.canvas.height*P,style:d(d({},e),t)};return t[I.react.down]=this.handleMouseDown,M&&(t[I.react.mouseDown]=this.handleMouseDown),r.default.createElement("canvas",u({ref:this.setCanvas},t,o))}}])&&i(e.prototype,t),o&&i(e,o),a}();return s(t,"propTypes",{scale:n.default.number,rotate:n.default.number,image:n.default.oneOfType([n.default.string].concat(function(e){if(Array.isArray(e))return v(e)}(b=O?[n.default.instanceOf(File)]:[])||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(b)||m(b)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())),border:n.default.oneOfType([n.default.number,n.default.arrayOf(n.default.number)]),borderRadius:n.default.number,width:n.default.number,height:n.default.number,position:n.default.shape({x:n.default.number,y:n.default.number}),color:n.default.arrayOf(n.default.number),backgroundColor:n.default.string,crossOrigin:n.default.oneOf(["","anonymous","use-credentials"]),onLoadFailure:n.default.func,onLoadSuccess:n.default.func,onImageReady:n.default.func,onImageChange:n.default.func,onMouseUp:n.default.func,onMouseMove:n.default.func,onPositionChange:n.default.func,disableBoundaryChecks:n.default.bool,disableHiDPIScaling:n.default.bool,disableCanvasRotation:n.default.bool}),s(t,"defaultProps",{scale:1,rotate:0,border:25,borderRadius:0,width:200,height:200,color:[0,0,0,.5],onLoadFailure:function(){},onLoadSuccess:function(){},onImageReady:function(){},onImageChange:function(){},onMouseUp:function(){},onMouseMove:function(){},onPositionChange:function(){},disableBoundaryChecks:!1,disableHiDPIScaling:!1,disableCanvasRotation:!0}),t});
