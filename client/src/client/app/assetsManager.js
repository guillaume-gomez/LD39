//Tomahawk.registerClass( AssetsManager, "AssetsManager" );
let instance = null;

class AssetsManager {

  constructor() {
    if(!instance) {
      instance = this;
    }
    this._images = {};
    this._atlases = {};
    this._textures = {};

    return instance;
  }

  getInstance() {
    if(!instance ) {
      instance = this;
    }
    return this;
  }

  addImage(image, alias) {
    this._images[alias] = image;
  }

  getImages(){
    return this._images;
  }

  getImageByAlias(alias){
    if(this._images[alias]) {
      return this._images[alias];
    }
    return null;
  }

  //atlases
  addAtlas(atlas, alias) {
    this._atlases[alias] = atlas;
  }

  getAtlases() {
    return this._atlases;
  }

  getAtlasByAlias(alias){
    if(this._atlases[alias]) {
        return this._atlases[alias];
    }
    return null;
  }

  //textures
  addTexture(texture, alias){
      this._textures[alias] = texture;
  }

  getTextures(){
      return this._textures;
  }

  getTextureByAlias(alias){
    if(this._textures[alias]) {
      return this._textures[alias];
    }
    return null;
  }
};

export default AssetsManager;