import {
  drawBackground,
  drawWalls,
  openingSort,
  throttle,
  drawArrow,
  drawRect
} from "./renderingFunctions"

import {DefaultWidthEnemy, DefaultHeightEnemy} from "./constants";
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
  let particleSprite = [];
  const hudCanvas = document.getElementById("hud");
  let hud = new Hud(hudCanvas);
  window.addEventListener('resize', resizeHudCanvas, false);

  swip.init({ socket: socket, container: document.getElementById('root') }, function (client) {
    assetsLoader.getInstance().onComplete = onComplete;
    assetsLoader.getInstance().addFile("character.png","character");
    assetsLoader.getInstance().addFile("atari400.png","particle");
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

        if (distance < (2 * state.cluster.data.character.radius)) {
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
        } else {
          dragPosition = evt.position[0];
        }
      }
    });

    client.onDragEnd(function (evt) {
      console.log("onDragEnd")
      if (dragging) {
        dragging = false;
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
      const { currentScreenId, character, currentRoomConstraint, hasStarted, maze, particles } = state.cluster.data;
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
        particles.forEach((particle, index) => {
          particleSprite[index].x = particle.x;
          particleSprite[index].y = particle.y;
          particleSprite[index].render(ctx);
          drawRect(ctx, particle);
        });
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
    atlas.createTexture("character_tex", 0,0,136,130);
    let texture = atlas.getTextureByName("character_tex");
    let characterBmp = new Bitmap();
    characterBmp.texture = texture;
    characterBmp.width = 136;
    characterBmp.height = 130;
    characterBmp.x = 0;
    characterBmp.y = 0;
    characterSprite = characterBmp;

    atlas.data = assetsManager.getInstance().getImageByAlias("particle");
    atlas.createTexture("particle_tex", 0,0,256,156);
    texture = atlas.getTextureByName("particle_tex");
    for(let i = 0; i < 2; ++i) {
      let bmp = new Bitmap();
      bmp.texture = texture;
      bmp.width = DefaultWidthEnemy;
      bmp.height = DefaultHeightEnemy;
      bmp.x = 0;
      bmp.y = 0;
      particleSprite[i] = bmp;
    }
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