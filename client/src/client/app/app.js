import {
  drawBackground,
  drawWalls,
  openingSort,
  throttle,
  drawArrow
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
      //client.emit('setHole', hole);
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
          console.log(`${(evt.position[0].x - character.x) / 2}`, `${(evt.position[0].y - character.y) / 2}`);
          client.emit('hitBall', {
             speedX: (evt.position[0].x - character.x) / 200,
             speedY: (evt.position[0].y - character.y) / 200
          });
        } else {
          dragPosition = evt.position[0];
        }
      }
    });

    client.onDragEnd(function (evt) {
      if (dragging) {
        dragging = false;
        client.emit('hitBall', {
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