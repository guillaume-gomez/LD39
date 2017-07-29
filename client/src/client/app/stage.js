// Tomahawk.registerClass( Stage, "Stage" );
// Tomahawk.extend( "Stage", "DisplayObjectContainer" );
import DisplayObjectContainer from "./displayObjectContainer";

let instance = null;

class Stage extends DisplayObjectContainer {
  constructor() {
    super();
    if(!instance) {
      instance = this;
    }
    this._lastTime = 0;
    this._frameCount = 0;
    this._fps = 0;
    this._canvas = null;
    this._context = null;
    this._debug = false;
  }

  myRequestAnimationFrame(){
      return  window.requestAnimationFrame       ||  //Chromium
              window.webkitRequestAnimationFrame ||  //Webkit
              window.mozRequestAnimationFrame    || //Mozilla
              window.oRequestAnimationFrame      || //Opera
              window.msRequestAnimationFrame     || //IE
              function(callback, element){ //Fallback function
                  window.setTimeout(callback, 10);
              }
  }

  getInstance() {
    if(!instance ) {
      instance = this;
    }
    return this;
  }

  init(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");
    this._enterFrame();
  }

  _enterFrame() {
      const curTime = new Date().getTime();
      this._frameCount++;
      if(curTime - this._lastTime >= 1000){
          this._fps = this._frameCount;
          this._frameCount = 0;
          this._lastTime = curTime;
      }
      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._context.save();
      this.render(this._context);
      this._context.restore();
      if(this._debug === true){
          this._context.save();
          this._context.beginPath();
          this._context.fillStyle = "black";
          this._context.fillRect(0,0,100,30);
          this._context.fill();
          this._context.fillStyle = "#016701";
          this._context.font = "18pt sans-serif";
          this._context.fillText("fps: "+this._fps, 0,30);
          this._context.restore();
      }
      this.myRequestAnimationFrame()( () => { this._enterFrame(); });
  }

  getCanvas() {
      return this._canvas;
  }

  getContext() {
      return this._context;
  }

  getFPS() {
    return this._fps;
  }

  setDebug(debug) {
    this._debug = debug;
  }
};
export default Stage;
