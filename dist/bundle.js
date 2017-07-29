/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* global window screen */

const MIN_SWIPE_DIST = 5;
const MOTION_TOLERANCE = 15;
const startPoints = {};

function onSwipe(element, callback) {
  element.addEventListener('touchmove', touchMoveHandler);

  element.addEventListener('touchstart', touchStartHandler);

  element.addEventListener('touchend', evt => touchEndHandler(evt, callback));
}

function touchStartHandler(evt) {
  Array.prototype.slice.apply(evt.changedTouches).forEach(touch => {
    startPoints[touch.identifier] = {
      x: touch.clientX,
      y: touch.clientY
    };
  });
}

function touchMoveHandler(evt) {
  evt.preventDefault();
}

function touchEndHandler(evt, callback) {
  Array.prototype.slice.apply(evt.changedTouches).forEach(touch => {
    const start = startPoints[touch.identifier];
    const end = {
      x: touch.clientX,
      y: touch.clientY
    };

    const diffX = Math.abs(end.x - start.x);
    const diffY = Math.abs(end.y - start.y);

    const vertBorder = window.innerHeight / 10;
    const horBorder = window.innerWidth / 10;

    if (diffX > diffY && diffX > MIN_SWIPE_DIST) {
      if (end.x < start.x && end.x <= horBorder) {
        callback({ direction: 'LEFT', position: { x: 0, y: end.y } });
      } else if (end.x > start.x && end.x >= window.innerWidth - horBorder) {
        callback({ direction: 'RIGHT', position: { x: window.innerWidth, y: end.y } });
      }
    } else if (diffY > diffX && diffY > MIN_SWIPE_DIST) {
      if (end.y < start.y && end.y <= vertBorder) {
        callback({ direction: 'UP', position: { x: end.x, y: 0 } });
      } else if (end.y > start.y && end.y >= window.innerHeight - vertBorder) {
        callback({ direction: 'DOWN', position: { x: end.x, y: window.innerHeight } });
      }
    }
  });
}

function onMove(callback) {
  window.addEventListener('devicemotion', evt => {
    const x = evt.acceleration.x;
    const y = evt.acceleration.y;
    const z = evt.acceleration.z;

    const max = Math.max(z, x, y);

    if (max > MOTION_TOLERANCE) {
      callback();
    }
  });
}

function onChangeOrientation(callback) {
  let prevBeta = null;
  let prevGamma = null;

  window.addEventListener('deviceorientation', evt => {
    const beta = Math.round(evt.beta);
    const gamma = Math.round(evt.gamma);

    if (beta !== prevBeta || gamma !== prevGamma) {
      const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
      const rotation = getRotation({ orientation, beta, gamma });

      callback({ rotation });
    }

    prevBeta = beta;
    prevGamma = gamma;
  });
}

function getRotation({ orientation, beta, gamma }) {
  switch (orientation.type) {
    case 'portrait-primary':
      return { x: gamma, y: beta };

    case 'portrait-secondary':
      return { x: gamma, y: beta };

    case 'landscape-primary':
      return { x: beta, y: -gamma };

    case 'landscape-secondary':
      return { x: -beta, y: gamma };

    default:
      return { x: 0, y: 0 };
  }
}

/* harmony default export */ __webpack_exports__["a"] = ({
  onSwipe,
  onMove,
  onChangeOrientation
});

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* global localStorage prompt document */

const DEVICE_SIZE_KEY = 'SWIP_DEVICE_SIZE';

function requestSize() {
  const storedSize = parseFloat(localStorage.getItem(DEVICE_SIZE_KEY));

  if (!Number.isNaN(storedSize)) {
    return storedSize;
  }

  /* eslint-disable no-alert */
  const inputSize = parseFloat(prompt('Please enter the device size in "(inch): '));
  /* eslint-enable no-alert */

  if (!Number.isNaN(inputSize)) {
    localStorage.setItem(DEVICE_SIZE_KEY, inputSize);
  }

  return inputSize;
}

function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function hasFullscreenSupport() {
  const element = document.documentElement;

  return element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
}

/* harmony default export */ __webpack_exports__["a"] = ({
  requestSize,
  requestFullscreen,
  hasFullscreenSupport
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(3);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__sensor__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__device__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__init__ = __webpack_require__(4);
/* global window */




window.swip = {
  sensor: __WEBPACK_IMPORTED_MODULE_0__sensor__["a" /* default */],
  device: __WEBPACK_IMPORTED_MODULE_1__device__["a" /* default */],
  init: __WEBPACK_IMPORTED_MODULE_2__init__["a" /* default */]
};

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__device__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__sensor__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__converter__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__style_css__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__style_css__);
/* global document window screen */






function init({ socket, container, type }, initApp) {
  return new ClientView({ socket, container, type, initApp });
}

class ClientView {

  constructor({ container, type, socket, initApp }) {
    this.socket = socket;

    this.initApp = initApp;

    // init container
    this.container = container;
    this.container.classList.add('SwipRoot');
    this.container.innerHTML = '';

    // init stage
    this.stage = getStage(type);
    this.stage.resize(container.clientWidth, container.clientHeight);
    this.container.appendChild(this.stage.element);
    window.addEventListener('resize', () => {
      this.stage.resize(container.clientWidth, container.clientHeight);
    });

    // init swip points
    this.swipPoints = new SwipPoints();
    this.container.appendChild(this.swipPoints.element);

    this.size = __WEBPACK_IMPORTED_MODULE_0__device__["a" /* default */].requestSize();

    // add connect button if size is not set
    if (Number.isNaN(this.size)) {
      this.connectButton = document.createElement('button');
      this.connectButton.innerText = 'connect';
      this.connectButton.classList.add('SwipButton');
      this.connectButton.onclick = () => this.connect();
      this.container.appendChild(this.connectButton);
    } else {
      this.initClient();
    }
  }

  initClient() {
    this.client = new Client({
      size: this.size,
      socket: this.socket,
      stage: this.stage.element,
      swipPoints: this.swipPoints,
      container: this.container
    });

    window.addEventListener('resize', () => this.client.reconnect());

    this.initApp(this.client);
  }

  connect() {
    this.size = __WEBPACK_IMPORTED_MODULE_0__device__["a" /* default */].requestSize();

    if (!Number.isNaN(this.size)) {
      this.connectButton.style.display = 'none';

      this.initClient();
    }
  }
}

class Client {

  constructor({ size, stage, container, socket, swipPoints }) {
    this.converter = new __WEBPACK_IMPORTED_MODULE_2__converter__["a" /* default */](size);
    this.stage = stage;
    this.container = container;
    this.swipPoints = swipPoints;
    this.socket = socket;
    this.state = {
      client: {
        transform: { x: 0, y: 0 }
      }
    };

    this.connect();
    this.initEventListener();
  }

  connect() {
    this.socket.emit('CONNECT', {
      size: {
        width: this.converter.toAbsPixel(this.stage.clientWidth),
        height: this.converter.toAbsPixel(this.stage.clientHeight)
      }
    });
  }

  reconnect() {
    this.socket.emit('RECONNECT', {
      size: {
        width: this.converter.toAbsPixel(this.stage.clientWidth),
        height: this.converter.toAbsPixel(this.stage.clientHeight)
      }
    });
  }

  initEventListener() {
    __WEBPACK_IMPORTED_MODULE_1__sensor__["a" /* default */].onSwipe(this.container, evt => {
      const position = {
        x: this.converter.toAbsPixel(evt.position.x),
        y: this.converter.toAbsPixel(evt.position.y)
      };

      this.swipPoints.animatePoint(evt.position.x, evt.position.y);

      this.socket.emit('SWIPE', {
        direction: evt.direction,
        position
      });
    });
  }

  onClick(callback) {
    this.stage.addEventListener('click', evt => {
      callback(this.converter.convertClickPos(this.state.client.transform, evt));
    });
  }

  onDragStart(callback) {
    this.stage.addEventListener('touchstart', evt => {
      callback(this.converter.convertTouchPos(this.state.client.transform, evt));
    });
  }

  onDragMove(callback) {
    this.stage.addEventListener('touchmove', evt => {
      evt.preventDefault();
      callback(this.converter.convertTouchPos(this.state.client.transform, evt));
    });
  }

  onDragEnd(callback) {
    this.stage.addEventListener('touchend', evt => {
      callback(this.converter.convertTouchPos(this.state.client.transform, evt));
    });
  }

  onUpdate(callback) {
    this.socket.on('CHANGED', state => {
      this.state = state;
      callback(state);
    });
  }

  emit(type, data) {
    this.socket.emit('CLIENT_ACTION', { type, data });
  }
}

class SwipPoints {
  constructor() {
    this.initPoints();
  }

  initPoints() {
    let i;
    this.nextPoint = 0;
    this.points = [];

    this.element = document.createElement('div');

    for (i = 0; i < 5; i++) {
      const point = this.points[i] = document.createElement('div');
      point.classList.add('SwipPoint');
      this.element.appendChild(point);
    }
  }

  animatePoint(x, y) {
    const point = this.points[this.nextPoint];

    point.style.top = `${y}px`;
    point.style.left = `${x}px`;
    point.classList.remove('SwipPoint--start-animation');

    // force reflow
    void point.offsetWidth;

    point.classList.add('SwipPoint--start-animation');

    this.nextPoint = (this.nextPoint + 1) % this.points.length;
  }
}

function getStage(type) {
  if (type === 'dom') {
    return new DOMStage();
  }

  return new CanvasStage();
}

class CanvasStage {
  constructor() {
    this.element = document.createElement('canvas');
    this.element.style.cursor = 'pointer';
  }

  resize(width, height) {
    this.element.width = width;
    this.element.height = height;
  }
}

class DOMStage {
  constructor() {
    this.element = document.createElement('div');
  }

  resize(width, height) {
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;
  }
}

/* harmony default export */ __webpack_exports__["a"] = (init);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* global localStorage document screen window */
const SIZE_REFERENCE = 60;

class Converter {
  constructor(screenSize) {
    this.screenSize = screenSize;
    this.scalingFactor = getScalingFactor(screenSize);
  }

  toDevicePixel(value) {
    return value / this.scalingFactor;
  }

  toAbsPixel(value) {
    return value * this.scalingFactor;
  }

  convertClickPos(transform, evt) {
    return {
      position: {
        x: this.toAbsPixel(evt.clientX) + transform.x,
        y: this.toAbsPixel(evt.clientY) + transform.y
      },
      originalEvent: evt
    };
  }

  convertTouchPos(transform, evt) {
    const event = {
      position: [],
      originalEvent: evt
    };

    for (let i = 0; i < evt.changedTouches.length; i++) {
      const currTouched = evt.changedTouches[i];

      event.position.push({
        x: this.toAbsPixel(currTouched.clientX) + transform.x,
        y: this.toAbsPixel(currTouched.clientY) + transform.y
      });
    }

    return event;
  }
}

function getScalingFactor(screenSize) {
  const diagonalPixel = Math.sqrt(Math.pow(screen.height, 2) + Math.pow(screen.width, 2));
  const diagonalScreenCM = screenSize * 2.54;
  const pixelPerCentimeter = diagonalPixel / diagonalScreenCM;

  return SIZE_REFERENCE / pixelPerCentimeter;
}

/* harmony default export */ __webpack_exports__["a"] = (Converter);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(9)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./style.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)();
// imports


// module
exports.push([module.i, ".SwipRoot {\n    position: relative;\n    height: 100%;\n    width: 100%;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n\n.SwipButton {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    margin-left: -100px;\n    margin-top: -25px;\n    background: #2196F3;\n    border: 0;\n    border-radius: 3px;\n    color: #fff;\n    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);\n    width: 200px;\n    height: 50px;\n    font-size: 1.3em;\n}\n\n.SwipStage {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n\n.SwipPoint {\n    position: absolute;\n    pointer-events: none;\n    top: 0;\n    left: 0;\n    margin: -35px 0 0 -35px;\n    width: 70px;\n    height: 70px;\n    border-radius: 50%;\n    background-color: rgba(125, 125, 125, 0.5);\n    opacity: 0;\n}\n\n.SwipPoint--start-animation {\n    animation: expand 0.3s;\n}\n\n@keyframes expand {\n    0% {\n        transform: scale(0);\n        opacity: 0;\n    }\n\n    25% {\n        opacity: 1;\n    }\n\n    75% {\n        opacity: 1;\n    }\n\n    100% {\n        opacity: 0;\n        transform: scale(1);\n    }\n}\n", ""]);

// exports


/***/ }),
/* 8 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ })
/******/ ]);