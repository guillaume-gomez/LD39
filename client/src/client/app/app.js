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

import {
  WidthEnemy,
  HeightEnemy,
  WidthCharacter,
  HeightCharacter,
  WidthMedikit,
  HeightMedikit,
  WidthRemoveEnemiesItem,
  HeightRemoveEnemiesItem,
  MaxEnemies,
  MaxMedic,
  MaxRemoveEnemiesItem,
  MaxHoles
} from "./constants";
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
  let enemiesSprites = [];
  let medikitSprites = [];
  let removeEnemiesSprites = [];
  let hasDied = false;
  const hudCanvas = document.getElementById("hud");
  let hud = new Hud(hudCanvas);
  window.addEventListener('resize', resizeHudCanvas, false);

  swip.init({ socket: socket, container: document.getElementById('root') }, function (client) {
    assetsLoader.getInstance().onComplete = onComplete;
    assetsLoader.getInstance().addFile(`${PathToAssets}/character.png`,"character");
    assetsLoader.getInstance().addFile(`${PathToAssets}/enemy1.png`,"enemy");
    assetsLoader.getInstance().addFile(`${PathToAssets}/heal.png`,"medikit");
    assetsLoader.getInstance().addFile(`${PathToAssets}/clean.png`,"removeEnemies");
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
             speedX: (evt.position[0].x - character.x) / 50,
             speedY: (evt.position[0].y - character.y) / 50
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
      let client = state.client;
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
        killEnemiesItems.forEach((item, index) => {
          removeEnemiesSprites[index].x = item.x;
          removeEnemiesSprites[index].y = item.y;
          removeEnemiesSprites[index].render(ctx);
          drawRect(ctx, item, "rgba(0,0,255,0.5");
        });
        medipackItems.forEach((item, index) => {
          medikitSprites[index].x = item.x;
          medikitSprites[index].y = item.y;
          medikitSprites[index].render(ctx);
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
          enemiesSprites[index].x = enemy.x;
          enemiesSprites[index].y = enemy.y;
          enemiesSprites[index].render(ctx);
        });
      }
      if(character.life <= 0) {
        dieAnimation(character.x, character.y);
      }
      ctx.restore();
      hud.draw(hasStarted, currentRoomConstraint, maze, character, converter, client);
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
    characterBmp.width = WidthCharacter;
    characterBmp.height = HeightCharacter;
    characterBmp.x = 0;
    characterBmp.y = 0;
    characterSprite = characterBmp;

    atlas.data = assetsManager.getInstance().getImageByAlias("enemy");
    atlas.createTexture("enemy_tex", 0,0,136,132);
    texture = atlas.getTextureByName("enemy_tex");
    for(let i = 0; i < MaxEnemies; ++i) {
      let bmp = new Bitmap();
      bmp.texture = texture;
      bmp.width = WidthEnemy;
      bmp.height = HeightEnemy;
      bmp.x = 0;
      bmp.y = 0;
      enemiesSprites[i] = bmp;
    }

    atlas.data = assetsManager.getInstance().getImageByAlias("medikit");
    atlas.createTexture("medikit_tex", 0,0,136,135);
    texture = atlas.getTextureByName("medikit_tex");
    for(let i = 0; i < MaxMedic; ++i) {
      let bmp = new Bitmap();
      bmp.texture = texture;
      bmp.width = WidthMedikit;
      bmp.height = HeightMedikit;
      bmp.x = 0;
      bmp.y = 0;
      medikitSprites[i] = bmp;
    }

    atlas.data = assetsManager.getInstance().getImageByAlias("removeEnemies");
    atlas.createTexture("remove_enemies_tex", 0,0,136,136);
    texture = atlas.getTextureByName("remove_enemies_tex");
    for(let i = 0; i < MaxRemoveEnemiesItem ; ++i) {
      let bmp = new Bitmap();
      bmp.texture = texture;
      bmp.width = WidthMedikit;
      bmp.height = HeightMedikit;
      bmp.x = 0;
      bmp.y = 0;
      removeEnemiesSprites[i] = bmp;
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
        x: originalX + WidthCharacter / 2,
        y: originalY + HeightCharacter / 2,
      }, 500);
      hasDied = true;
    }
  }

  window.onload = resizeHudCanvas();

};

export default app;