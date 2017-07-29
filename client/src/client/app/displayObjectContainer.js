// Tomahawk.registerClass( DisplayObjectContainer, "DisplayObjectContainer" );
// Tomahawk.extend( "DisplayObjectContainer", "DisplayObject" );
import DisplayObject from "./displayObject";

class DisplayObjectContainer extends DisplayObject {

  constructor() {
      super();
      this.children = [];
  }

  addChild(child) {
    if(child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
  }

  draw(context) {
    this.children.forEach(child => {
      child.render(context);
    });
  }
};
export default DisplayObjectContainer;