import {
  drawBackground,
  drawWalls,
  openingSort,
  throttle,
  drawArrow,
  drawBall
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

  let socket = io.connect();
  let assetsManager = new AssetsManager();
  let assetsLoader = new AssetsLoader();
  let characterSprite = null;
  const hudCanvas = document.getElementById("hud");
  let hud = new Hud(hudCanvas);
  window.addEventListener('resize', resizeHudCanvas, false);

  swip.init({ socket: socket, container: document.getElementById('root') }, function (client) {
    assetsLoader.getInstance().onComplete = onComplete;
    assetsLoader.getInstance().addFile("character.png","character");
    assetsLoader.getInstance().load();
    let converter = client.converter;
    let stage = client.stage;
    let ctx = stage.getContext('2d');

    let state = null;
    let dragPosition = null;
    let dragging = false;

    client.onClick(function (evt) {
      //var hole = { x: evt.position.x, y: evt.position.y };
      //client.emit('shoot', hole);
    });

    client.onDragStart(function (evt) {
      if (state) {
        var distanceX = evt.position[0].x - state.cluster.data.character.x;
        var distanceY = evt.position[0].y - state.cluster.data.character.y;
        var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        if (distance < (3 * state.cluster.data.character.radius)) {
          dragging = true;
          dragPosition = evt.position[0];
        }
      }
    });

    client.onDragMove(function (evt) {
      var distanceX = evt.position[0].x - state.cluster.data.character.x;
      var distanceY = evt.position[0].y - state.cluster.data.character.y;
      var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

      if (dragging) {
        if (distance > 150) {
          dragPosition = {
            x: state.cluster.data.character.x + (distanceX / distance) * 150,
            y: state.cluster.data.character.y + (distanceY / distance) * 150
          }
          const { character } = state.cluster.data;
          client.emit('move', {
             speedX: (evt.position[0].x - character.x) / 100,
             speedY: (evt.position[0].y - character.y) / 100
          });
          dragPosition = evt.position[0];
        }
      }
    });

    client.onDragEnd(function (evt) {
      if (dragging) {
        dragging = false;
        client.emit('move', {
          speedX: 0,
          speedY: 0
        });
      }
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
      //if(hasStarted) {
        drawWalls(ctx, client);
        if(characterSprite) {
          characterSprite.x = character.x - characterSprite.width/2;
          characterSprite.y = character.y - characterSprite.height/2;
          characterSprite.render(ctx)
        }
        //drawBall(ctx, character)
        if (dragging) {
          drawArrow(ctx, character, dragPosition);
        }
      //}
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

    let texture = atlas.getTextureByName("texture_1");
    let bmp = new Bitmap();
    bmp.texture = texture;
    bmp.width = 136/2;
    bmp.height = 130/2;
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