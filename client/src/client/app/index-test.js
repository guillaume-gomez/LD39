import AssetsLoader from "./assetsLoader";
import AssetsManager from "./assetsManager";
import Texture from "./texture";
import TextureAtlas from "./textureAtlas";
import Stage from "./stage";
import Bitmap from "./bitmap";
import DisplayObjectContainer from "./displayObjectContainer";
import DisplayObject from "./displayObject";
import Event, { Triggers } from "./event";
import GrayScaleFilter from "./grayScaleFilter";

/* Point d'entrée de l'application */
let assetsManager = new AssetsManager();
let assetsLoader = new AssetsLoader();
let stage = new Stage();
function init(){

    assetsLoader.getInstance().onComplete = onComplete;
    assetsLoader.getInstance().addFile("atari400.png","ground");
    assetsLoader.getInstance().load();
}

function onComplete(){
    var data = assetsLoader.getInstance().getData();
    var canvas = document.getElementById('tomahawk');

    // on initialise la racine en lui envoyant la référence vers le canvas
    stage.getInstance().init(canvas);

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
    var bmp = new Bitmap(); // on créer un nouvel objet de type Bitmap
    bmp.texture = texture; // on y associe la texture
    bmp.width = 256; // on définie la largeur
    bmp.height = 156;//... puis la hauteur
    //stage.getInstance().addChild(bmp); // on ajoute l'enfant à la racine

    // on recommence l'opération tout en changeant les coordonnées du deuxième enfant
    const filter = new GrayScaleFilter();
    bmp = new Bitmap();
    bmp.texture = texture;
    bmp.width = 256/2;
    bmp.height = 156/2;
    bmp.x = 400;
    bmp.y = 100;
    stage.getInstance().addChild(bmp); // on l'ajoute aussi
    //stage.getInstance().setDebug(true);// on souhaite voir le fps


    // var container = new DisplayObjectContainer();
    // var disp = new DisplayObject();
    // disp.addEventListener(Triggers.ADDED, null, onAdded, true);
    // container.addChild(disp);
}

function getCanvas(){
  return document.getElementById("tomahawk");
}

function getContext(){
  return getCanvas().getContext("2d");
}

function onAdded(event){
  console.log(event.type);
}

/*
* Quand toutes les données sont chargées ( DOM, Images, Sons, Vidéos etc ... )
* On démarre l'application par la fonction init
*/
window.onload = init;