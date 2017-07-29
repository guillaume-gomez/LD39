//Tomahawk.registerClass( TextureAtlas, "TextureAtlas" );
import Texture from "./texture";

class TextureAtlas {
  constructor() {
    this._textures = [];
    this.data = null;
    this.name = null;
  }

  createTexture(name, startX, startY, endX, endY){
    let texture = new Texture();
    texture.name = name;
    texture.data = this.data;
    texture.rect = [startX, startY, endX, endY];
    this._textures.push(texture);
  }

  getTextureByName(name){
    return this._textures.find(texture => texture.name === name);
    // while(--i > -1){
    //   currentTexture = this._textures[i];
    //   if(currentTexture.name == name){
    //     return currentTexture;
    //   }
    // }
  }

  removeTexture(name){
    let texture = this.getTextureByName(name);
    if(texture === null) {
      return;
    }
    let index = this._textures.indexOf(texture);
    this._textures.splice(index,1);
  }
};
export default TextureAtlas;