/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*********************************!*\
  !*** ./src/client/app/index.js ***!
  \*********************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _golf = __webpack_require__(/*! ./golf */ 1);
	
	var _golf2 = _interopRequireDefault(_golf);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	(0, _golf2.default)();

/***/ }),
/* 1 */
/*!********************************!*\
  !*** ./src/client/app/golf.js ***!
  \********************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _renderingFunctions = __webpack_require__(/*! ./renderingFunctions */ 2);
	
	var _assetsLoader = __webpack_require__(/*! ./assetsLoader */ 3);
	
	var _assetsLoader2 = _interopRequireDefault(_assetsLoader);
	
	var _assetsManager = __webpack_require__(/*! ./assetsManager */ 4);
	
	var _assetsManager2 = _interopRequireDefault(_assetsManager);
	
	var _texture = __webpack_require__(/*! ./texture */ 5);
	
	var _texture2 = _interopRequireDefault(_texture);
	
	var _textureAtlas = __webpack_require__(/*! ./textureAtlas */ 6);
	
	var _textureAtlas2 = _interopRequireDefault(_textureAtlas);
	
	var _stage = __webpack_require__(/*! ./stage */ 7);
	
	var _stage2 = _interopRequireDefault(_stage);
	
	var _bitmap = __webpack_require__(/*! ./bitmap */ 13);
	
	var _bitmap2 = _interopRequireDefault(_bitmap);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/* eslint-disable */
	function golf() {
	  'use strict';
	
	  var socket = io.connect();
	  var assetsManager = new _assetsManager2.default();
	  var assetsLoader = new _assetsLoader2.default();
	  var test = null;
	  //let stage = new Stage();
	
	  swip.init({ socket: socket, container: document.getElementById('root') }, function (client) {
	    assetsLoader.getInstance().onComplete = onComplete;
	    assetsLoader.getInstance().addFile("atari400.png", "ground");
	    assetsLoader.getInstance().load();
	    var converter = client.converter;
	    var stage = client.stage;
	    var ctx = stage.getContext('2d');
	
	    var state = null;
	    var dragPosition = null;
	    var dragging = false;
	
	    client.onClick(function (evt) {
	      var hole = { x: evt.position.x, y: evt.position.y };
	      client.emit('setHole', hole);
	    });
	
	    client.onDragStart(function (evt) {
	      if (state) {
	        var distanceX = evt.position[0].x - state.cluster.data.ball.x;
	        var distanceY = evt.position[0].y - state.cluster.data.ball.y;
	        var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
	
	        if (distance < 2 * state.cluster.data.ball.radius) {
	          dragging = true;
	          dragPosition = evt.position[0];
	        }
	      }
	    });
	
	    client.onDragMove(function (evt) {
	      var distanceX = evt.position[0].x - state.cluster.data.ball.x;
	      var distanceY = evt.position[0].y - state.cluster.data.ball.y;
	      var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
	
	      if (dragging) {
	        if (distance > 150) {
	          dragPosition = {
	            x: state.cluster.data.ball.x + distanceX / distance * 150,
	            y: state.cluster.data.ball.y + distanceY / distance * 150
	          };
	        } else {
	          dragPosition = evt.position[0];
	        }
	      }
	    });
	
	    client.onDragEnd(function (evt) {
	      if (dragging) {
	        dragging = false;
	        client.emit('hitBall', {
	          speedX: (evt.position[0].x - state.cluster.data.ball.x) / 2,
	          speedY: (evt.position[0].y - state.cluster.data.ball.y) / 2
	        });
	      }
	    });
	
	    swip.sensor.onChangeOrientation((0, _renderingFunctions.throttle)(function (evt) {
	      client.emit('updateOrientation', {
	        rotationX: evt.rotation.x,
	        rotationY: evt.rotation.y
	      });
	    }, 200));
	
	    client.onUpdate(function (evt) {
	      state = evt;
	      var client = state.client;
	      var ball = state.cluster.data.ball;
	      var hole = state.cluster.data.hole;
	
	      ctx.save();
	
	      applyTransform(ctx, converter, client.transform);
	      (0, _renderingFunctions.drawBackground)(ctx, client);
	      (0, _renderingFunctions.drawHole)(ctx, hole);
	
	      if (dragging) {
	        (0, _renderingFunctions.drawArrow)(ctx, ball, dragPosition);
	      }
	
	      (0, _renderingFunctions.drawBall)(ctx, ball);
	      (0, _renderingFunctions.drawWalls)(ctx, client);
	      if (test) {
	        test.render(ctx);
	      }
	
	      ctx.restore();
	    });
	  });
	
	  function applyTransform(ctx, converter, transform) {
	    ctx.translate(-converter.toDevicePixel(transform.x), -converter.toDevicePixel(transform.y));
	    ctx.scale(converter.toDevicePixel(1), converter.toDevicePixel(1));
	  }
	
	  function onComplete() {
	    var data = assetsLoader.getInstance().getData();
	    // on initialise la racine en lui envoyant la référence vers le canvas
	    //stage.getInstance().init(canvas);
	
	    for (var alias in data) {
	      assetsManager.getInstance().addImage(data[alias], alias);
	    }
	
	    // on crée un nouvel atlas
	    var atlas = new _textureAtlas2.default();
	
	    // on lui associe une image qui sera celle partagée par toutes les textures stockée en son sein
	    atlas.data = assetsManager.getInstance().getImageByAlias("ground");
	
	    // on crée deux textures différentes, portant un nom différent, ayant chacune la même image
	    // mais pas les mêmes portions d'image associées
	    atlas.createTexture("texture_1", 0, 0, 256, 156);
	
	    var texture = atlas.getTextureByName("texture_1"); // on retrouve notre texture
	    var bmp = new _bitmap2.default(); // on créer un nouvel objet de type Bitmap
	    bmp.texture = texture; // on y associe la texture
	    bmp.width = 256 / 4; // on définie la largeur
	    bmp.height = 156 / 4; //... puis la hauteur
	    bmp.x = 200;
	    bmp.y = 200;
	    test = bmp;
	    //bmp.drawOnly(ctx)
	    //stage.getInstance().addChild(bmp); // on ajoute l'enfant à la racine
	  }
	};
	
	exports.default = golf;
	
	
	console.log("Example");

/***/ }),
/* 2 */
/*!**********************************************!*\
  !*** ./src/client/app/renderingFunctions.js ***!
  \**********************************************/
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.drawBackground = drawBackground;
	exports.drawWalls = drawWalls;
	exports.openingSort = openingSort;
	exports.drawBall = drawBall;
	exports.drawArrow = drawArrow;
	exports.drawHole = drawHole;
	exports.throttle = throttle;
	function drawBackground(ctx, client) {
	  ctx.save();
	  ctx.fillStyle = '#80d735';
	  ctx.fillRect(client.transform.x, client.transform.y, client.size.width, client.size.height);
	  ctx.restore();
	}
	
	function drawWalls(ctx, client) {
	  var openings = client.openings;
	  var transformX = client.transform.x;
	  var transformY = client.transform.y;
	  var width = client.size.width;
	  var height = client.size.height;
	
	  ctx.save();
	  ctx.lineWidth = 40;
	  ctx.shadowColor = '#dba863';
	  ctx.shadowBlur = 10;
	
	  ctx.strokeStyle = '#ffde99';
	
	  // left
	  ctx.beginPath();
	  ctx.moveTo(transformX, transformY);
	
	  openings.left.sort(openingSort).forEach(function (opening) {
	    ctx.lineTo(transformX, opening.start + transformY);
	    ctx.stroke();
	    ctx.beginPath();
	    ctx.moveTo(transformX, opening.end + transformY);
	  });
	
	  ctx.lineTo(transformX, height + transformY);
	  ctx.stroke();
	
	  // right
	  ctx.beginPath();
	  ctx.moveTo(width + transformX, transformY);
	
	  openings.right.sort(openingSort).forEach(function (opening) {
	    ctx.lineTo(width + transformX, opening.start + transformY);
	    ctx.stroke();
	    ctx.beginPath();
	    ctx.moveTo(width + transformX, opening.end + transformY);
	  });
	
	  ctx.lineTo(width + transformX, height + transformY);
	  ctx.stroke();
	
	  // top
	  ctx.beginPath();
	  ctx.moveTo(transformX, transformY);
	
	  openings.top.sort(openingSort).forEach(function (opening) {
	    ctx.lineTo(opening.start + transformX, transformY);
	    ctx.stroke();
	    ctx.beginPath();
	    ctx.moveTo(opening.end + transformX, transformY);
	  });
	
	  ctx.lineTo(width + transformX, transformY);
	  ctx.stroke();
	
	  // bottom
	  ctx.beginPath();
	  ctx.moveTo(transformX, height + transformY);
	
	  openings.bottom.sort(openingSort).forEach(function (opening) {
	    ctx.lineTo(opening.start + transformX, height + transformY);
	    ctx.stroke();
	    ctx.beginPath();
	    ctx.moveTo(opening.end + transformX, height + transformY);
	  });
	
	  ctx.lineTo(width + transformX, height + transformY);
	  ctx.stroke();
	  ctx.restore();
	}
	
	function openingSort(openingA, openingB) {
	  return openingB.start - openingA.start;
	}
	
	function drawBall(ctx, ball) {
	  ctx.save();
	
	  ctx.fillStyle = '#fff';
	  ctx.shadowBlur = 10;
	  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
	
	  ctx.beginPath();
	  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	  ctx.fill();
	
	  ctx.restore();
	}
	
	function drawArrow(ctx, ball, dragPosition) {
	  var angle;
	
	  ctx.save();
	
	  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
	  ctx.lineWidth = 3;
	  ctx.shadowBlur = 5;
	
	  angle = -Math.atan2(dragPosition.x - ball.x, dragPosition.y - ball.y) + Math.PI / 2;
	
	  ctx.beginPath();
	  ctx.arc(ball.x, ball.y, ball.radius * 2, angle + Math.PI / 2, angle - Math.PI / 2);
	  ctx.arc(dragPosition.x, dragPosition.y, ball.radius, angle - Math.PI / 2, angle + Math.PI / 2);
	  ctx.fill();
	
	  ctx.restore();
	}
	
	function drawHole(ctx, hole) {
	  ctx.save();
	
	  ctx.fillStyle = 'black';
	  ctx.strokeStyle = '#4b7f1f';
	  ctx.lineWidth = 2;
	
	  ctx.beginPath();
	  ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
	  ctx.fill();
	  ctx.stroke();
	
	  ctx.restore();
	}
	
	function throttle(fn, threshhold, scope) {
	  threshhold || (threshhold = 250);
	  var last, deferTimer;
	  return function () {
	    var context = scope || this;
	
	    var now = +new Date(),
	        args = arguments;
	    if (last && now < last + threshhold) {
	      // hold on to it
	      clearTimeout(deferTimer);
	      deferTimer = setTimeout(function () {
	        last = now;
	        fn.apply(context, args);
	      }, threshhold);
	    } else {
	      last = now;
	      fn.apply(context, args);
	    }
	  };
	}

/***/ }),
/* 3 */
/*!****************************************!*\
  !*** ./src/client/app/assetsLoader.js ***!
  \****************************************/
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	//Tomahawk.registerClass( AssetsLoader, "AssetsLoader" );
	var instance = null;
	
	var AssetsLoader = function () {
	  function AssetsLoader() {
	    _classCallCheck(this, AssetsLoader);
	
	    if (!instance) {
	      instance = this;
	    }
	    this._loadingList = [];
	    //callback functions
	    this.onComplete = null;
	    this._data = null;
	
	    return instance;
	  }
	
	  _createClass(AssetsLoader, [{
	    key: "getInstance",
	    value: function getInstance() {
	      if (!instance) {
	        instance = this;
	      }
	      return this;
	    }
	  }, {
	    key: "getData",
	    value: function getData() {
	      return this._data;
	    }
	  }, {
	    key: "addFile",
	    value: function addFile(fileURL, fileAlias) {
	      this._data = {};
	      this._loadingList.push({ url: fileURL, alias: fileAlias });
	    }
	  }, {
	    key: "load",
	    value: function load() {
	      var _this = this;
	
	      if (this._loadingList.length == 0) {
	        if (this.onComplete) {
	          this.onComplete();
	        }
	      } else {
	        var obj = this._loadingList.shift();
	        var image = new Image();
	        image.onload = function () {
	          _this._onLoadComplete(image, obj.alias);
	        };
	        image.src = obj.url;
	      }
	    }
	  }, {
	    key: "_onLoadComplete",
	    value: function _onLoadComplete(image, alias) {
	      this._data[alias] = image;
	      this.load();
	    }
	  }]);
	
	  return AssetsLoader;
	}();
	
	;
	exports.default = AssetsLoader;

/***/ }),
/* 4 */
/*!*****************************************!*\
  !*** ./src/client/app/assetsManager.js ***!
  \*****************************************/
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	//Tomahawk.registerClass( AssetsManager, "AssetsManager" );
	var instance = null;
	
	var AssetsManager = function () {
	  function AssetsManager() {
	    _classCallCheck(this, AssetsManager);
	
	    if (!instance) {
	      instance = this;
	    }
	    this._images = {};
	    this._atlases = {};
	    this._textures = {};
	
	    return instance;
	  }
	
	  _createClass(AssetsManager, [{
	    key: "getInstance",
	    value: function getInstance() {
	      if (!instance) {
	        instance = this;
	      }
	      return this;
	    }
	  }, {
	    key: "addImage",
	    value: function addImage(image, alias) {
	      this._images[alias] = image;
	    }
	  }, {
	    key: "getImages",
	    value: function getImages() {
	      return this._images;
	    }
	  }, {
	    key: "getImageByAlias",
	    value: function getImageByAlias(alias) {
	      if (this._images[alias]) {
	        return this._images[alias];
	      }
	      return null;
	    }
	
	    //atlases
	
	  }, {
	    key: "addAtlas",
	    value: function addAtlas(atlas, alias) {
	      this._atlases[alias] = atlas;
	    }
	  }, {
	    key: "getAtlases",
	    value: function getAtlases() {
	      return this._atlases;
	    }
	  }, {
	    key: "getAtlasByAlias",
	    value: function getAtlasByAlias(alias) {
	      if (this._atlases[alias]) {
	        return this._atlases[alias];
	      }
	      return null;
	    }
	
	    //textures
	
	  }, {
	    key: "addTexture",
	    value: function addTexture(texture, alias) {
	      this._textures[alias] = texture;
	    }
	  }, {
	    key: "getTextures",
	    value: function getTextures() {
	      return this._textures;
	    }
	  }, {
	    key: "getTextureByAlias",
	    value: function getTextureByAlias(alias) {
	      if (this._textures[alias]) {
	        return this._textures[alias];
	      }
	      return null;
	    }
	  }]);
	
	  return AssetsManager;
	}();
	
	;
	
	exports.default = AssetsManager;

/***/ }),
/* 5 */
/*!***********************************!*\
  !*** ./src/client/app/texture.js ***!
  \***********************************/
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	//Tomahawk.registerClass( Texture, "Texture" );
	var Texture = function Texture() {
	  _classCallCheck(this, Texture);
	
	  this.data = null;
	  this.name = null;
	  this.rect = null;
	};
	
	;
	exports.default = Texture;

/***/ }),
/* 6 */
/*!****************************************!*\
  !*** ./src/client/app/textureAtlas.js ***!
  \****************************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //Tomahawk.registerClass( TextureAtlas, "TextureAtlas" );
	
	
	var _texture = __webpack_require__(/*! ./texture */ 5);
	
	var _texture2 = _interopRequireDefault(_texture);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var TextureAtlas = function () {
	  function TextureAtlas() {
	    _classCallCheck(this, TextureAtlas);
	
	    this._textures = [];
	    this.data = null;
	    this.name = null;
	  }
	
	  _createClass(TextureAtlas, [{
	    key: "createTexture",
	    value: function createTexture(name, startX, startY, endX, endY) {
	      var texture = new _texture2.default();
	      texture.name = name;
	      texture.data = this.data;
	      texture.rect = [startX, startY, endX, endY];
	      this._textures.push(texture);
	    }
	  }, {
	    key: "getTextureByName",
	    value: function getTextureByName(name) {
	      return this._textures.find(function (texture) {
	        return texture.name === name;
	      });
	      // while(--i > -1){
	      //   currentTexture = this._textures[i];
	      //   if(currentTexture.name == name){
	      //     return currentTexture;
	      //   }
	      // }
	    }
	  }, {
	    key: "removeTexture",
	    value: function removeTexture(name) {
	      var texture = this.getTextureByName(name);
	      if (texture === null) {
	        return;
	      }
	      var index = this._textures.indexOf(texture);
	      this._textures.splice(index, 1);
	    }
	  }]);
	
	  return TextureAtlas;
	}();
	
	;
	exports.default = TextureAtlas;

/***/ }),
/* 7 */
/*!*********************************!*\
  !*** ./src/client/app/stage.js ***!
  \*********************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _displayObjectContainer = __webpack_require__(/*! ./displayObjectContainer */ 8);
	
	var _displayObjectContainer2 = _interopRequireDefault(_displayObjectContainer);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Tomahawk.registerClass( Stage, "Stage" );
	// Tomahawk.extend( "Stage", "DisplayObjectContainer" );
	
	
	var instance = null;
	
	var Stage = function (_DisplayObjectContain) {
	  _inherits(Stage, _DisplayObjectContain);
	
	  function Stage() {
	    _classCallCheck(this, Stage);
	
	    var _this = _possibleConstructorReturn(this, (Stage.__proto__ || Object.getPrototypeOf(Stage)).call(this));
	
	    if (!instance) {
	      instance = _this;
	    }
	    _this._lastTime = 0;
	    _this._frameCount = 0;
	    _this._fps = 0;
	    _this._canvas = null;
	    _this._context = null;
	    _this._debug = false;
	    return _this;
	  }
	
	  _createClass(Stage, [{
	    key: "myRequestAnimationFrame",
	    value: function myRequestAnimationFrame() {
	      return window.requestAnimationFrame || //Chromium
	      window.webkitRequestAnimationFrame || //Webkit
	      window.mozRequestAnimationFrame || //Mozilla
	      window.oRequestAnimationFrame || //Opera
	      window.msRequestAnimationFrame || //IE
	      function (callback, element) {
	        //Fallback function
	        window.setTimeout(callback, 10);
	      };
	    }
	  }, {
	    key: "getInstance",
	    value: function getInstance() {
	      if (!instance) {
	        instance = this;
	      }
	      return this;
	    }
	  }, {
	    key: "init",
	    value: function init(canvas) {
	      this._canvas = canvas;
	      this._context = canvas.getContext("2d");
	      this._enterFrame();
	    }
	  }, {
	    key: "_enterFrame",
	    value: function _enterFrame() {
	      var _this2 = this;
	
	      var curTime = new Date().getTime();
	      this._frameCount++;
	      if (curTime - this._lastTime >= 1000) {
	        this._fps = this._frameCount;
	        this._frameCount = 0;
	        this._lastTime = curTime;
	      }
	      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
	      this._context.save();
	      this.render(this._context);
	      this._context.restore();
	      if (this._debug === true) {
	        this._context.save();
	        this._context.beginPath();
	        this._context.fillStyle = "black";
	        this._context.fillRect(0, 0, 100, 30);
	        this._context.fill();
	        this._context.fillStyle = "#016701";
	        this._context.font = "18pt sans-serif";
	        this._context.fillText("fps: " + this._fps, 0, 30);
	        this._context.restore();
	      }
	      this.myRequestAnimationFrame()(function () {
	        _this2._enterFrame();
	      });
	    }
	  }, {
	    key: "getCanvas",
	    value: function getCanvas() {
	      return this._canvas;
	    }
	  }, {
	    key: "getContext",
	    value: function getContext() {
	      return this._context;
	    }
	  }, {
	    key: "getFPS",
	    value: function getFPS() {
	      return this._fps;
	    }
	  }, {
	    key: "setDebug",
	    value: function setDebug(debug) {
	      this._debug = debug;
	    }
	  }]);
	
	  return Stage;
	}(_displayObjectContainer2.default);
	
	;
	exports.default = Stage;

/***/ }),
/* 8 */
/*!**************************************************!*\
  !*** ./src/client/app/displayObjectContainer.js ***!
  \**************************************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _displayObject = __webpack_require__(/*! ./displayObject */ 9);
	
	var _displayObject2 = _interopRequireDefault(_displayObject);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Tomahawk.registerClass( DisplayObjectContainer, "DisplayObjectContainer" );
	// Tomahawk.extend( "DisplayObjectContainer", "DisplayObject" );
	
	
	var DisplayObjectContainer = function (_DisplayObject) {
	  _inherits(DisplayObjectContainer, _DisplayObject);
	
	  function DisplayObjectContainer() {
	    _classCallCheck(this, DisplayObjectContainer);
	
	    var _this = _possibleConstructorReturn(this, (DisplayObjectContainer.__proto__ || Object.getPrototypeOf(DisplayObjectContainer)).call(this));
	
	    _this.children = [];
	    return _this;
	  }
	
	  _createClass(DisplayObjectContainer, [{
	    key: "addChild",
	    value: function addChild(child) {
	      if (child.parent) {
	        child.parent.removeChild(child);
	      }
	      child.parent = this;
	      this.children.push(child);
	    }
	  }, {
	    key: "draw",
	    value: function draw(context) {
	      this.children.forEach(function (child) {
	        child.render(context);
	      });
	    }
	  }]);
	
	  return DisplayObjectContainer;
	}(_displayObject2.default);
	
	;
	exports.default = DisplayObjectContainer;

/***/ }),
/* 9 */
/*!*****************************************!*\
  !*** ./src/client/app/displayObject.js ***!
  \*****************************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _matrix2D = __webpack_require__(/*! ./matrix2D */ 10);
	
	var _matrix2D2 = _interopRequireDefault(_matrix2D);
	
	var _eventDispatcher = __webpack_require__(/*! ./eventDispatcher */ 11);
	
	var _eventDispatcher2 = _interopRequireDefault(_eventDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //Tomahawk.registerClass( DisplayObject, "DisplayObject" );
	
	
	var DisplayObject = function (_EventDispatcher) {
	  _inherits(DisplayObject, _EventDispatcher);
	
	  function DisplayObject() {
	    _classCallCheck(this, DisplayObject);
	
	    var _this = _possibleConstructorReturn(this, (DisplayObject.__proto__ || Object.getPrototypeOf(DisplayObject)).call(this));
	
	    _this.name = null;
	    _this.parent = null;
	    _this.x = 0;
	    _this.y = 0;
	    _this.scaleX = 1;
	    _this.scaleY = 1;
	    _this.rotation = 0;
	    _this.pivotX = 0;
	    _this.pivotY = 0;
	    _this.skewX = 0;
	    _this.skewY = 0;
	    _this.width = 0;
	    _this.height = 0;
	    _this.alpha = 1;
	    _this.matrix = null;
	    _this._concatenedMatrix = new _matrix2D2.default();
	    _this.filters = [];
	    return _this;
	  }
	
	  _createClass(DisplayObject, [{
	    key: "toRadians",
	    value: function toRadians() {
	      return Math.PI / 180;
	    }
	  }, {
	    key: "render",
	    value: function render(context) {
	      var matrix = this.update();
	
	      if (this.visible === false) {
	        return;
	      }
	      var mat = matrix;
	      context.save();
	      context.globalAlpha = this.alpha;
	      context.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
	      if (this.filters.length !== 0) {
	        var buffer = this._applyFilters();
	        var canvas = document.createElement("canvas");
	        context.drawImage(canvas, 0, 0, buffer.width, buffer.height);
	      } else {
	        this.draw(context);
	      }this.draw(context);
	      context.restore();
	    }
	  }, {
	    key: "draw",
	    value: function draw(context) {
	      context.beginPath();
	      context.fillStyle = "red";
	      context.fillRect(this.x, this.y, this.width, this.height);
	      context.fill();
	    }
	  }, {
	    key: "update",
	    value: function update() {
	      var mat = this.matrix || new _matrix2D2.default();
	      mat.appendTransform(this.x, this.y, this.scaleX, this.scaleY, this.rotation, this.skewX, this.skewY, this.pivotX, this.pivotY);
	      return mat;
	    }
	  }, {
	    key: "_applyFilters",
	    value: function _applyFilters() {
	      var canvas = document.createElement("canvas");
	      var context = canvas.getContext("2d");
	      canvas.width = this.width;
	      canvas.height = this.height;
	      this.draw(context);
	      this.filters.forEach(function (filter) {
	        console.log(filter);
	        filter.apply(canvas, context);
	      });
	      return canvas;
	    }
	  }, {
	    key: "addFilter",
	    value: function addFilter(filter) {
	      this.filters.push(filter);
	    }
	
	    // render(context) {
	    //   this.update();
	    //   if(this.visible === false) {
	    //     return;
	    //   }
	    //   const mat = this.matrix;
	    //   context.save();
	    //   context.globalAlpha = this.alpha;
	    //   context.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
	    //   if(this.filters != null) {
	    //     //  on appelle une nouvelle méthode _applyFilters
	    //     const buffer = this._applyFilters();
	    //     const canvas = document.createElement("canvas");
	    //     context.drawImage(canvas, 0, 0, buffer.width, buffer.height );
	    //   } else {
	    //     this.draw(context);
	    //   }
	    //   context.restore();
	    // }
	
	    // isInRect(x,y, rectX, rectY, rectWidth, rectHeight) {
	    //   return
	    //      x > rectX + rectWidth ||
	    //      y > rectY + rectHeight ||
	    //      x < rectX ||
	    //      y < rectY;
	    // }
	
	    // getConcatenedMatrix(){
	    //   var current = this;
	    //   var mat = new Matrix2D();
	    //   while(current != null) {
	    //     current.update();
	    //     mat.prependMatrix(current.matrix );
	    //     current = current.parent;
	    //   }
	    //   this._concatenedMatrix = mat;
	    //   return this._concatenedMatrix;
	    // }
	
	
	    // localToGlobal(x, y) {
	    //   const matrix = this.getConcatenedMatrix();
	    //   const pt = matrix.transformPoint(x, y);
	    //   return new Point(pt.x, pt.y);
	    // }
	
	    // globalToLocal(x, y) {
	    //   const matrix = this.getConcatenedMatrix().clone().invert();
	    //   const pt = matrix.transformPoint(x, y);
	    //   return new Point(pt.x, pt.y);
	    // }
	
	    // hitTest(x, y) {
	    //   if(this.matrix === null) {
	    //     this.update();
	    //   }
	
	    //   const pt1 = this.globalToLocal(x,y);
	    //   return pt1.x < 0 || pt1.x > this.width || pt1.y < 0 || pt1.y > this.height;
	    // }
	    // TODO USE IT IN STAGE CLASS SO DONT FORGET TO ADD MISSING CODE DUDE :)
	
	
	  }]);
	
	  return DisplayObject;
	}(_eventDispatcher2.default);
	
	;
	exports.default = DisplayObject;

/***/ }),
/* 10 */
/*!************************************!*\
  !*** ./src/client/app/matrix2D.js ***!
  \************************************/
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function Matrix2D(a, b, c, d, tx, ty) {
	    this.initialize(a, b, c, d, tx, ty);
	}
	
	// static public properties:
	
	/**
	 * An identity matrix, representing a null transformation.
	 * @property identity
	 * @static
	 * @type Matrix2D
	 * @readonly
	 **/
	Matrix2D.prototype.identity = null; // set at bottom of class definition.
	
	/**
	 * Multiplier for converting degrees to radians. Used internally by Matrix2D.
	 * @property DEG_TO_RAD
	 * @static
	 * @final
	 * @type Number
	 * @readonly
	 **/
	Matrix2D.DEG_TO_RAD = Math.PI / 180;
	
	// public properties:
	/**
	 * Position (0, 0) in a 3x3 affine transformation matrix.
	 * @property a
	 * @type Number
	 **/
	Matrix2D.prototype.a = 1;
	
	/**
	 * Position (0, 1) in a 3x3 affine transformation matrix.
	 * @property b
	 * @type Number
	 **/
	Matrix2D.prototype.b = 0;
	
	/**
	 * Position (1, 0) in a 3x3 affine transformation matrix.
	 * @property c
	 * @type Number
	 **/
	Matrix2D.prototype.c = 0;
	
	/**
	 * Position (1, 1) in a 3x3 affine transformation matrix.
	 * @property d
	 * @type Number
	 **/
	Matrix2D.prototype.d = 1;
	
	/**
	 * Position (2, 0) in a 3x3 affine transformation matrix.
	 * @property tx
	 * @type Number
	 **/
	Matrix2D.prototype.tx = 0;
	
	/**
	 * Position (2, 1) in a 3x3 affine transformation matrix.
	 * @property ty
	 * @type Number
	 **/
	Matrix2D.prototype.ty = 0;
	
	// constructor:
	/**
	 * Initialization method. Can also be used to reinitialize the instance.
	 * @method initialize
	 * @param {Number} [a=1] Specifies the a property for the new matrix.
	 * @param {Number} [b=0] Specifies the b property for the new matrix.
	 * @param {Number} [c=0] Specifies the c property for the new matrix.
	 * @param {Number} [d=1] Specifies the d property for the new matrix.
	 * @param {Number} [tx=0] Specifies the tx property for the new matrix.
	 * @param {Number} [ty=0] Specifies the ty property for the new matrix.
	 * @return {Matrix2D} This instance. Useful for chaining method calls.
	*/
	Matrix2D.prototype.initialize = function (a, b, c, d, tx, ty) {
	    this.a = a == null ? 1 : a;
	    this.b = b || 0;
	    this.c = c || 0;
	    this.d = d == null ? 1 : d;
	    this.tx = tx || 0;
	    this.ty = ty || 0;
	    return this;
	};
	
	// public methods:
	/**
	 * Concatenates the specified matrix properties with this matrix. All parameters are required.
	 * @method prepend
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.prepend = function (a, b, c, d, tx, ty) {
	    var tx1 = this.tx;
	    if (a != 1 || b != 0 || c != 0 || d != 1) {
	        var a1 = this.a;
	        var c1 = this.c;
	        this.a = a1 * a + this.b * c;
	        this.b = a1 * b + this.b * d;
	        this.c = c1 * a + this.d * c;
	        this.d = c1 * b + this.d * d;
	    }
	    this.tx = tx1 * a + this.ty * c + tx;
	    this.ty = tx1 * b + this.ty * d + ty;
	    return this;
	};
	
	/**
	 * Appends the specified matrix properties with this matrix. All parameters are required.
	 * @method append
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.append = function (a, b, c, d, tx, ty) {
	    var a1 = this.a;
	    var b1 = this.b;
	    var c1 = this.c;
	    var d1 = this.d;
	
	    this.a = a * a1 + b * c1;
	    this.b = a * b1 + b * d1;
	    this.c = c * a1 + d * c1;
	    this.d = c * b1 + d * d1;
	    this.tx = tx * a1 + ty * c1 + this.tx;
	    this.ty = tx * b1 + ty * d1 + this.ty;
	    return this;
	};
	
	/**
	 * Prepends the specified matrix with this matrix.
	 * @method prependMatrix
	 * @param {Matrix2D} matrix
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.prependMatrix = function (matrix) {
	    this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
	    return this;
	};
	
	/**
	 * Appends the specified matrix with this matrix.
	 * @method appendMatrix
	 * @param {Matrix2D} matrix
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.appendMatrix = function (matrix) {
	    this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
	    return this;
	};
	
	/**
	 * Generates matrix properties from the specified display object transform properties, and prepends them with this matrix.
	 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
	 * mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
	 * @method prependTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX Optional.
	 * @param {Number} regY Optional.
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.prependTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
	    if (rotation % 360) {
	        var r = rotation * Matrix2D.DEG_TO_RAD;
	        var cos = Math.cos(r);
	        var sin = Math.sin(r);
	    } else {
	        cos = 1;
	        sin = 0;
	    }
	
	    if (regX || regY) {
	        // append the registration offset:
	        this.tx -= regX;this.ty -= regY;
	    }
	    if (skewX || skewY) {
	        // TODO: can this be combined into a single prepend operation?
	        skewX *= Matrix2D.DEG_TO_RAD;
	        skewY *= Matrix2D.DEG_TO_RAD;
	        this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
	        this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
	    } else {
	        this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
	    }
	    return this;
	};
	
	/**
	 * Generates matrix properties from the specified display object transform properties, and appends them with this matrix.
	 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
	 * mtx.appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
	 * @method appendTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX Optional.
	 * @param {Number} regY Optional.
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.appendTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
	
	    if (rotation % 360) {
	        var r = rotation * Matrix2D.DEG_TO_RAD;
	        var cos = Math.cos(r);
	        var sin = Math.sin(r);
	    } else {
	        cos = 1;
	        sin = 0;
	    }
	
	    if (skewX || skewY) {
	        // TODO: can this be combined into a single append?
	        skewX *= Matrix2D.DEG_TO_RAD;
	        skewY *= Matrix2D.DEG_TO_RAD;
	        this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
	        this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
	    } else {
	        this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
	    }
	
	    if (regX || regY) {
	        // prepend the registration offset:
	        this.tx -= regX * this.a + regY * this.c;
	        this.ty -= regX * this.b + regY * this.d;
	    }
	    return this;
	};
	
	/**
	 * Applies a rotation transformation to the matrix.
	 * @method rotate
	 * @param {Number} angle The angle in radians. To use degrees, multiply by <code>Math.PI/180</code>.
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.rotate = function (angle) {
	    var cos = Math.cos(angle);
	    var sin = Math.sin(angle);
	
	    var a1 = this.a;
	    var c1 = this.c;
	    var tx1 = this.tx;
	
	    this.a = a1 * cos - this.b * sin;
	    this.b = a1 * sin + this.b * cos;
	    this.c = c1 * cos - this.d * sin;
	    this.d = c1 * sin + this.d * cos;
	    this.tx = tx1 * cos - this.ty * sin;
	    this.ty = tx1 * sin + this.ty * cos;
	    return this;
	};
	
	/**
	 * Applies a skew transformation to the matrix.
	 * @method skew
	 * @param {Number} skewX The amount to skew horizontally in degrees.
	 * @param {Number} skewY The amount to skew vertically in degrees.
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	*/
	Matrix2D.prototype.skew = function (skewX, skewY) {
	    skewX = skewX * Matrix2D.DEG_TO_RAD;
	    skewY = skewY * Matrix2D.DEG_TO_RAD;
	    this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
	    return this;
	};
	
	/**
	 * Applies a scale transformation to the matrix.
	 * @method scale
	 * @param {Number} x The amount to scale horizontally
	 * @param {Number} y The amount to scale vertically
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.scale = function (x, y) {
	    this.a *= x;
	    this.d *= y;
	    this.c *= x;
	    this.b *= y;
	    this.tx *= x;
	    this.ty *= y;
	    return this;
	};
	
	/**
	 * Translates the matrix on the x and y axes.
	 * @method translate
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.translate = function (x, y) {
	    this.tx += x;
	    this.ty += y;
	    return this;
	};
	
	/**
	 * Sets the properties of the matrix to those of an identity matrix (one that applies a null transformation).
	 * @method identity
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.identity = function () {
	    this.a = this.d = 1;
	    this.b = this.c = this.tx = this.ty = 0;
	    return this;
	};
	
	/**
	 * Inverts the matrix, causing it to perform the opposite transformation.
	 * @method invert
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.invert = function () {
	    var a1 = this.a;
	    var b1 = this.b;
	    var c1 = this.c;
	    var d1 = this.d;
	    var tx1 = this.tx;
	    var n = a1 * d1 - b1 * c1;
	
	    this.a = d1 / n;
	    this.b = -b1 / n;
	    this.c = -c1 / n;
	    this.d = a1 / n;
	    this.tx = (c1 * this.ty - d1 * tx1) / n;
	    this.ty = -(a1 * this.ty - b1 * tx1) / n;
	    return this;
	};
	
	/**
	 * Returns true if the matrix is an identity matrix.
	 * @method
	isIdentity
	 * @return {Boolean}
	 **/
	Matrix2D.prototype.isIdentity = function () {
	    return this.tx == 0 && this.ty == 0 && this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1;
	};
	
	/**
	 * Transforms a point according to this matrix.
	 * @method transformPoint
	 * @param {Number} x The x component of the point to transform.
	 * @param {Number} y The y component of the point to transform.
	 * @param {Point | Object} [pt] An object to copy the result into. If omitted a generic object with x/y properties will be returned.
	 * @return {Point} This matrix. Useful for chaining method calls.
	 **/
	Matrix2D.prototype.transformPoint = function (x, y, pt) {
	    pt = pt || {};
	    pt.x = x * this.a + y * this.c + this.tx;
	    pt.y = x * this.b + y * this.d + this.ty;
	    return pt;
	};
	
	/**
	 * Decomposes the matrix into transform properties (x, y, scaleX, scaleY, and rotation). Note that this these values
	 * may not match the transform properties you used to generate the matrix, though they will produce the same visual
	 * results.
	 * @method decompose
	 * @param {Object} target The object to apply the transform properties to. If null, then a new object will be returned.
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	*/
	Matrix2D.prototype.decompose = function (target) {
	
	    if (target == null) {
	        target = {};
	    }
	    target.x = this.tx;
	    target.y = this.ty;
	    target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
	    target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);
	
	    var skewX = Math.atan2(-this.c, this.d);
	    var skewY = Math.atan2(this.b, this.a);
	
	    if (skewX == skewY) {
	        target.rotation = skewY / Matrix2D.DEG_TO_RAD;
	        if (this.a < 0 && this.d >= 0) {
	            target.rotation += target.rotation <= 0 ? 180 : -180;
	        }
	        target.skewX = target.skewY = 0;
	    } else {
	        target.skewX = skewX / Matrix2D.DEG_TO_RAD;
	        target.skewY = skewY / Matrix2D.DEG_TO_RAD;
	    }
	    return target;
	};
	
	/**
	 * Reinitializes all matrix properties to those specified.
	 * @method reinitialize
	 * @param {Number} [a=1] Specifies the a property for the new matrix.
	 * @param {Number} [b=0] Specifies the b property for the new matrix.
	 * @param {Number} [c=0] Specifies the c property for the new matrix.
	 * @param {Number} [d=1] Specifies the d property for the new matrix.
	 * @param {Number} [tx=0] Specifies the tx property for the new matrix.
	 * @param {Number} [ty=0] Specifies the ty property for the new matrix.
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	*/
	Matrix2D.prototype.reinitialize = function (a, b, c, d, tx, ty) {
	    this.initialize(a, b, c, d, tx, ty);
	    return this;
	};
	
	/**
	 * Copies all properties from the specified matrix to this matrix.
	 * @method copy
	 * @param {Matrix2D} matrix The matrix to copy properties from.
	 * @return {Matrix2D} This matrix. Useful for chaining method calls.
	*/
	Matrix2D.prototype.copy = function (matrix) {
	    return this.reinitialize(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
	};
	
	/**
	 * Returns a clone of the Matrix2D instance.
	 * @method clone
	 * @return {Matrix2D} a clone of the Matrix2D instance.
	 **/
	Matrix2D.prototype.clone = function () {
	    return new Matrix2D().copy(this);
	};
	
	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	Matrix2D.prototype.toString = function () {
	    return "[Matrix2D (a=" + this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + ")]";
	};
	Matrix2D.identity = new Matrix2D();
	
	exports.default = Matrix2D;

/***/ }),
/* 11 */
/*!*******************************************!*\
  !*** ./src/client/app/eventDispatcher.js ***!
  \*******************************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //Tomahawk.registerClass( EventDispatcher, "EventDispatcher" );
	
	
	var _event = __webpack_require__(/*! ./event */ 12);
	
	var _event2 = _interopRequireDefault(_event);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var EventDispatcher = function () {
	  function EventDispatcher() {
	    _classCallCheck(this, EventDispatcher);
	
	    this.parent = null;
	    this._listeners = [];
	  }
	
	  _createClass(EventDispatcher, [{
	    key: "addEventListener",
	    value: function addEventListener(type, scope, callback) {
	      var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
	
	      this._listeners.push({ type: type, scope: scope, callback: callback, useCapture: useCapture });
	      console.log(this._listeners);
	    }
	  }, {
	    key: "hasEventListener",
	    value: function hasEventListener(type) {
	      if (this._listeners === null) {
	        return false;
	      }
	      var eventFound = this.getEventListener(type);
	      return !!eventFound;
	    }
	  }, {
	    key: "dispatchEvent",
	    value: function dispatchEvent(event) {
	      if (event.target === null) {
	        event.target = this;
	      }
	      event.currentTarget = this;
	      var eventFound = this.getEventListener(event.type);
	      if (eventFound && (event.target === this || eventFound.useCapture !== false)) {
	        eventFound.callback.apply(eventFound.scope, [event]);
	      }
	      if (event.bubbles === true && this.parent !== null && !!this.parent.dispatchEvent) {
	        this.parent.dispatchEvent(event);
	      }
	    }
	  }, {
	    key: "getEventListener",
	    value: function getEventListener(type) {
	      return this._listeners.find(function (listener) {
	        return listener.type === type;
	      });
	    }
	  }, {
	    key: "removeEventListener",
	    value: function removeEventListener(type, scope, callback, useCapture) {
	      var _this = this;
	
	      var listener = this.getEventListener(type);
	
	      var _loop = function _loop() {
	        obj = {};
	        i = _this._listeners.length;
	        arr = [];
	
	        var newListeners = _this._listeners.filter(function (listenerCurrent) {
	          return listenerCurrent.type !== listener.type || listenerCurrent.scope !== scope || listenerCurrent.callback !== callback || listenerCurrent.useCapture !== useCapture;
	        });
	        _this._listeners = newListeners;
	        var listener = _this.getEventListener(type);
	      };
	
	      while (listener != null) {
	        var obj;
	        var i;
	        var arr;
	
	        _loop();
	      }
	    }
	  }, {
	    key: "addChild",
	    value: function addChild(child) {
	      if (child.parent) {
	        child.parent.removeChild(child);
	      }
	      child.parent = this;
	      this.children.push(child);
	      child.dispatchEvent(new _event2.default(_event.Triggers.ADDED, true, true));
	    }
	  }, {
	    key: "addChildAt",
	    value: function addChildAt(child, index) {
	      var tab1 = this.children.slice(0, index);
	      var tab2 = this.children.slice(index);
	      this.children = tab1.concat([child]).concat(tab2);
	      child.parent = this;
	      child.dispatchEvent(new _event2.default(_event.Triggers.ADDED, true, true));
	    }
	  }, {
	    key: "removeChildAt",
	    value: function removeChildAt(index) {
	      var child = this.children[index];
	      if (child) {
	        child.parent = null;
	      }
	      this.children.splice(index, 1);
	      child.dispatchEvent(new _event2.default(_event.Triggers.REMOVED, true, true));
	    }
	  }, {
	    key: "removeChild",
	    value: function removeChild(child) {
	      var index = this.children.indexOf(child);
	      if (index > -1) {
	        this.children.splice(index, 1);
	      }
	      child.parent = null;
	      child.dispatchEvent(new _event2.default(_event.Triggers.REMOVED, true, true));
	    }
	  }]);
	
	  return EventDispatcher;
	}();
	
	;
	exports.default = EventDispatcher;

/***/ }),
/* 12 */
/*!*********************************!*\
  !*** ./src/client/app/event.js ***!
  \*********************************/
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	//constants
	var Triggers = exports.Triggers = {
	  ADDED: "added",
	  ADDED_TO_STAGE: "addedToStage",
	  ENTER_FRAME: "enterFrame",
	  REMOVED: "removed",
	  REMOVED_FROM_STAGE: "removedFromStage"
	};
	
	var Event = function () {
	  function Event(type, bubbles) {
	    var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	
	    _classCallCheck(this, Event);
	
	    this.type = type;
	    this.cancelable = cancelable;
	    this.bubbles = bubbles;
	    this.data = null;
	    this.target = null;
	    this.currentTarget = null;
	  }
	
	  _createClass(Event, [{
	    key: "stopPropagation",
	    value: function stopPropagation() {
	      if (this.cancelable) {
	        this.bubbles = false;
	      }
	    }
	  }]);
	
	  return Event;
	}();
	
	;
	exports.default = Event;
	
	//Tomahawk.registerClass( Event, "Event" );

/***/ }),
/* 13 */
/*!**********************************!*\
  !*** ./src/client/app/bitmap.js ***!
  \**********************************/
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _displayObject = __webpack_require__(/*! ./displayObject */ 9);
	
	var _displayObject2 = _interopRequireDefault(_displayObject);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //Tomahawk.registerClass( Bitmap, "Bitmap" );
	//Tomahawk.extend( "Bitmap", "DisplayObject" );
	
	
	var Bitmap = function (_DisplayObject) {
		_inherits(Bitmap, _DisplayObject);
	
		function Bitmap() {
			_classCallCheck(this, Bitmap);
	
			var _this = _possibleConstructorReturn(this, (Bitmap.__proto__ || Object.getPrototypeOf(Bitmap)).call(this));
	
			_this.texture = null;
			return _this;
		}
	
		_createClass(Bitmap, [{
			key: "draw",
			value: function draw(context) {
				var _texture = this.texture,
				    rect = _texture.rect,
				    data = _texture.data;
	
				var _rect = _slicedToArray(rect, 4),
				    x = _rect[0],
				    y = _rect[1],
				    width = _rect[2],
				    height = _rect[3];
	
				context.drawImage(data, x, y, width, height, 0, 0, this.width, this.height);
			}
		}]);
	
		return Bitmap;
	}(_displayObject2.default);
	
	;
	exports.default = Bitmap;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map