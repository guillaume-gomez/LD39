//Tomahawk.registerClass( Bitmap, "Bitmap" );
//Tomahawk.extend( "Bitmap", "DisplayObject" );
import DisplayObject from "./displayObject";

class Bitmap extends DisplayObject {
	constructor() {
		super();
		this.texture = null;
	}

	draw( context ) {
		const { rect, data } = this.texture;
		const [x,y, width, height] = rect;
		context.drawImage(data, x, y, width, height, 0, 0, this.width, this.height);
	}
};
export default Bitmap;
