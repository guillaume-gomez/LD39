//Tomahawk.registerClass( GrayScaleFilter, "GrayScaleFilter" );
//Tomahawk.extend( GrayScaleFilter, "PixelFilter" );
import PixelFilter from "./pixelFilter";

class GrayScaleFilter extends PixelFilter {

  constructor() {
    super();
  }

  process() {
    const pixels = this.getPixels();
    let data = pixels.data;
    for(let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        data[i] = data[i + 1] = data[i + 2] = v;
    }
    console.log(pixels)
    this.setPixels(pixels);
  }

};
export default GrayScaleFilter;
