import { drawBackground, drawWalls, openingSort,
         drawHole, drawBall, throttle
      } from "./renderingFunctions"

import Hud from "./hud";
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
  let characterSprite = null;
  const hudCanvas = document.getElementById("hud");
  let hud = new Hud(hudCanvas);
  window.addEventListener('resize', resizeHudCanvas, false);

  swip.init({ socket: socket, container: document.getElementById('root') }, function (client) {
    assetsLoader.getInstance().onComplete = onComplete;
    assetsLoader.getInstance().addFile("atari400.png","ground");
    assetsLoader.getInstance().addFile("character.png","character");
    assetsLoader.getInstance().load();
    var converter = client.converter;
    var stage = client.stage;
    var ctx = stage.getContext('2d');

    var state = null;
    var dragPosition = null;
    var dragging = false;

    client.onClick(function (evt) {
      //var hole = { x: evt.position.x, y: evt.position.y };
      //client.emit('setHole', hole);
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
      const { currentScreenId, character, currentRoomConstraint, hasStarted, maze } = state.cluster.data;
      ctx.save();
      applyTransform(ctx, converter, client.transform);
      drawBackground(ctx, client, currentRoomConstraint.bgColor);
      if(hasStarted) {
        drawWalls(ctx, client);
        if(characterSprite) {
          characterSprite.x = character.x - characterSprite.width/2;
          characterSprite.y = character.y - characterSprite.height/2;
          characterSprite.render(ctx)
        }
      }
      ctx.restore();
      hud.draw(hasStarted, currentRoomConstraint, maze);
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
    atlas.data = assetsManager.getInstance().getImageByAlias("character");
    atlas.createTexture( "texture_1", 0,0,136,130);

    let texture = atlas.getTextureByName("texture_1"); // on retrouve notre texture
    let bmp = new Bitmap(); // on créer un nouvel objet de type Bitmap
    bmp.texture = texture; // on y associe la texture
    bmp.width = 136; // on définie la largeur
    bmp.height = 130;//... puis la hauteur
    bmp.x = 200;
    bmp.y = 200;
    characterSprite = bmp;
    //bmp.drawOnly(ctx)
  }

  function resizeHudCanvas() {
     const rootCanvas = document.getElementById("root").childNodes[0];
      hud.resize(
       rootCanvas.width,
       rootCanvas.height);
  }

  window.onload = resizeHudCanvas();

};

export default app;