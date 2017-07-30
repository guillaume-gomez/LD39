import {drawBackground, drawWalls, openingSort, drawHole, drawBall, throttle, showGameText, showEndGame, showLoseGame} from "./renderingFunctions"
import AssetsLoader from "./assetsLoader";
import AssetsManager from "./assetsManager";
import Texture from "./texture";
import TextureAtlas from "./textureAtlas";
import Bitmap from "./bitmap";

/* eslint-disable */
function app() {
  'use strict';

  var socket = io.connect();
  let assetsManager = new AssetsManager();
  let assetsLoader = new AssetsLoader();
  let character = null;

  swip.init({ socket: socket, container: document.getElementById('root') }, function (client) {
    assetsLoader.getInstance().onComplete = onComplete;
    assetsLoader.getInstance().addFile("atari400.png","ground");
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

    swip.sensor.onChangeOrientation(throttle(function (evt) {
      client.emit('updateOrientation', {
        rotationX: evt.rotation.x,
        rotationY: evt.rotation.y
      });
    }, 200));


    client.onUpdate(function (evt) {
      state = evt;
      var client = state.client;
      const { currentScreenId, ball, hole, currentRoomConstraint, hasStarted, nbAttempts } = state.cluster.data;

      ctx.save();
      applyTransform(ctx, converter, client.transform);
      drawBackground(ctx, client, currentRoomConstraint.bgColor);
      if(currentRoomConstraint.type === "o") { // duplicate from maze.js)
        showEndGame(ctx);
      } else if (nbAttempts <= 0) {
        drawBackground(ctx, client, "#FFDDDD");
        showLoseGame(ctx);
      } else if(hasStarted) {
        drawWalls(ctx, client);
        drawBall(ctx, ball);
        if(character) {
          character.x = ball.x - character.width/2;
          character.y = ball.y - character.height/2;
          character.render(ctx)
        }
      } else {
        showGameText(ctx);
      }
      ctx.restore();

    });
  });

  function applyTransform (ctx, converter, transform) {
    ctx.translate(-converter.toDevicePixel(transform.x), -converter.toDevicePixel(transform.y));
    ctx.scale(converter.toDevicePixel(1), converter.toDevicePixel(1));

  }

  function onComplete() {
    const data = assetsLoader.getInstance().getData();
    for( const alias in data ){
        assetsManager.getInstance().addImage(data[alias],alias);
    }
    let atlas = new TextureAtlas();
    atlas.data = assetsManager.getInstance().getImageByAlias("ground");
    atlas.createTexture( "texture_1", 0,0,256,156);

    let texture = atlas.getTextureByName("texture_1"); // on retrouve notre texture
    let bmp = new Bitmap(); // on créer un nouvel objet de type Bitmap
    bmp.texture = texture; // on y associe la texture
    bmp.width = 256/2; // on définie la largeur
    bmp.height = 156/1.5;//... puis la hauteur
    bmp.x = 200;
    bmp.y = 200;
    character = bmp;
    //bmp.drawOnly(ctx)
  }

};

export default app;