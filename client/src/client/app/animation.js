import Bitmap from "./bitmap";
import { Triggers } from "./event";

//need control framerate
class Animation extends Bitmap{
  constructor() {
    this._frames = new Array();
    this.currentFrame = 0;
    this._enterFrameHandler = null;
  }


  _enterFrameHandler(event) {
    this.currentFrame++;
    if(this.currentFrame >= this._frames.length) {
        this.currentFrame = 0;
    }
    if(this._frames[this.currentFrame]) {
        this.texture = this._frames[this.currentFrame];
    }
  }

  setFrame(frameIndex, texture){
      this._frames[frameIndex] = texture;
  }

  play() {
    const stage = new Stage();
    stage.getInstance().addEventListener(Triggers.ENTER_FRAME, this, this._enterFrameHandler);
  }

  stop () {
    const stage = new Stage();
    stage.getInstance().removeEventListener(Triggers.ENTER_FRAME, this, this._enterFrameHandler);
  }
};
export default Animation

//Tomahawk.registerClass( MovieClip, "MovieClip" );
//Tomahawk.extend( "MovieClip", "Bitmap" );