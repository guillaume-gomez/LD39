import {drawBackground, drawWalls, openingSort, drawHole, throttle, getRandomColor} from "./renderingFunctions"
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
  let test = null;
  let bgColor = getRandomColor();

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
      const { currentScreenId, ball, hole } = state.cluster.data;
      ctx.save();
      applyTransform(ctx, converter, client.transform);
      const realColor = currentScreenId === client.id ? bgColor : null;
      drawBackground(ctx, client, realColor);
      drawWalls(ctx, client);
      if(test) {
        test.x = hole.x - test.width/2;
        test.y = hole.y - test.height/2;
        test.render(ctx)
      }

      ctx.restore();
    });
  });

  function applyTransform (ctx, converter, transform) {
    ctx.translate(-converter.toDevicePixel(transform.x), -converter.toDevicePixel(transform.y));
    ctx.scale(converter.toDevicePixel(1), converter.toDevicePixel(1));

  }

  function onComplete() {
    var data = assetsLoader.getInstance().getData();
    // on initialise la racine en lui envoyant la référence vers le canvas
    //stage.getInstance().init(canvas);

    for( var alias in data ){
        assetsManager.getInstance().addImage(data[alias],alias);
    }

    // on crée un nouvel atlas
    var atlas = new TextureAtlas();

    // on lui associe une image qui sera celle partagée par toutes les textures stockée en son sein
    atlas.data = assetsManager.getInstance().getImageByAlias("ground");

    // on crée deux textures différentes, portant un nom différent, ayant chacune la même image
    // mais pas les mêmes portions d'image associées
    atlas.createTexture( "texture_1", 0,0,256,156);

    var texture = atlas.getTextureByName("texture_1"); // on retrouve notre texture
    let bmp = new Bitmap(); // on créer un nouvel objet de type Bitmap
    bmp.texture = texture; // on y associe la texture
    bmp.width = 256/2; // on définie la largeur
    bmp.height = 156/2;//... puis la hauteur
    bmp.x = 200;
    bmp.y = 200;
    test = bmp;
    //bmp.drawOnly(ctx)
    //stage.getInstance().addChild(bmp); // on ajoute l'enfant à la racine
  }

};

export default app;