import {
  drawBackground,
  drawWalls,
  openingSort,
  throttle,
  drawArrow,
  drawRect,
  drawCircle,
  drawHole
} from "./renderingFunctions"

import {DefaultWidthEnemy, DefaultHeightEnemy, DefaultWidthCharacter, DefaultHeightCharacter} from "./constants";
import Hud from "./hud";
import AssetsLoader from "./assetsLoader";
import AssetsManager from "./assetsManager";
import Texture from "./texture";
import TextureAtlas from "./textureAtlas";
import Bitmap from "./bitmap";

const PathToAssets = "src/client/assets";

/* eslint-disable */
function app() {
  'use strict';

  let socket = io.connect();
  let assetsManager = new AssetsManager();
  let assetsLoader = new AssetsLoader();
  let characterSprite = null;
  let enemySprite = [];
  let hasDied = false;
  const hudCanvas = document.getElementById("hud");
  let hud = new Hud(hudCanvas);
  window.addEventListener('resize', resizeHudCanvas, false);

  swip.init({ socket: socket, container: document.getElementById('root') }, function (client) {
    assetsLoader.getInstance().onComplete = onComplete;
    assetsLoader.getInstance().addFile(`${PathToAssets}/character.png`,"character");
    assetsLoader.getInstance().addFile(`${PathToAssets}/atari400.png`,"enemy");
    assetsLoader.getInstance().load();
    let converter = client.converter;
    let stage = client.stage;
    let ctx = stage.getContext('2d');

    let state = null;
    let dragPosition = null;
    let dragging = false;

    client.onDragStart(function (evt) {
      if(hasDied) {
        return;
      }
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
      if(hasDied) {
        return;
      }
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

    client.onUpdate(function (evt) {
      state = evt;
      var client = state.client;
      const { currentScreenId, character, currentRoomConstraint, hasStarted, maze } = state.cluster.data;
      const {  enemies, killEnemiesItems, medipackItems, holes } = maze
      ctx.save();
      applyTransform(ctx, converter, client.transform);
      drawBackground(ctx, client, currentRoomConstraint.bgColor);
      if(hasStarted && character.life > 0) {
        drawWalls(ctx, client);
        holes.forEach(hole => {
          drawHole(ctx, hole);
        });
        if(characterSprite) {
          characterSprite.x = character.x;
          characterSprite.y = character.y;
          characterSprite.render(ctx);
        }
        if (dragging) {
          drawArrow(ctx, character, dragPosition);
        }
        enemies.forEach((enemy, index) => {
          enemySprite[index].x = enemy.x;
          enemySprite[index].y = enemy.y;
          enemySprite[index].render(ctx);
        });
      }
      if(character.life <= 0) {
        dieAnimation(character.x, character.y);
      }
      ctx.restore();
      hud.draw(hasStarted, currentRoomConstraint, maze, character, converter);
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
    characterBmp.width = DefaultWidthCharacter;
    characterBmp.height = DefaultHeightCharacter;
    characterBmp.x = 0;
    characterBmp.y = 0;
    characterSprite = characterBmp;

    atlas.data = assetsManager.getInstance().getImageByAlias("enemy");
    atlas.createTexture("particle_tex", 0,0,256,156);
    texture = atlas.getTextureByName("particle_tex");
    for(let i = 0; i < 2; ++i) {
      let bmp = new Bitmap();
      bmp.texture = texture;
      bmp.width = DefaultWidthEnemy;
      bmp.height = DefaultHeightEnemy;
      bmp.x = 0;
      bmp.y = 0;
      enemySprite[i] = bmp;
    }
  }

  function resizeHudCanvas() {
     const rootCanvas = document.getElementById("root").childNodes[0];
      hud.resize(
       rootCanvas.width,
       rootCanvas.height);
  }

  function dieAnimation(originalX, originalY) {
    if(!hasDied) {
      createjs.Tween.get(characterSprite).to({
        width:0,
        height: 0,
        x: originalX + DefaultWidthCharacter / 2,
        y: originalY + DefaultHeightCharacter / 2,
      }, 500);
      hasDied = true;
    }
  }

  window.onload = resizeHudCanvas();

};

export default app;