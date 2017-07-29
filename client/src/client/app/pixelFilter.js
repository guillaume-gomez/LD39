//Tomahawk.registerClass( PixelFilter, "PixelFilter" );

class PixelFilter {
  constructor() {
    this._canvas = null;
    this._context = null;
  }

  getPixels() {
    return this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
  }

  setPixels(pixels) {
    console.log(pixels);
    console.log(this._context);
    this._context.putImageData(pixels, 0, 0);
  }

  // code implemented in heritated class
  //process() {
  //}

  apply(canvas, context) {
    this._canvas = canvas;
    this._context = context;
    this.process();
  }
};
export default PixelFilter;