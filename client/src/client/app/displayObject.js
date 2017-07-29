//Tomahawk.registerClass( DisplayObject, "DisplayObject" );
import Matrix2D from "./matrix2D";
import EventDispatcher from "./eventDispatcher";

class DisplayObject extends EventDispatcher {

  constructor() {
    super();
    this.name = null;
    this.parent = null;
    this.x = 0;
    this.y = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.pivotX = 0;
    this.pivotY = 0;
    this.skewX = 0;
    this.skewY = 0;
    this.width = 0;
    this.height = 0;
    this.alpha = 1;
    this.matrix = null;
    this._concatenedMatrix = new Matrix2D();
    this.filters = [];
  }

  toRadians() {
    return Math.PI / 180;
  }

  render(context) {
   const matrix = this.update();

    if(this.visible === false) {
      return;
    }
    const mat = matrix;
    context.save();
    context.globalAlpha = this.alpha;
    context.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
    if(this.filters.length !== 0) {
      const buffer = this._applyFilters();
      const canvas = document.createElement("canvas");
      context.drawImage(canvas, 0, 0, buffer.width, buffer.height );
    } else {
      this.draw(context);
    }this.draw(context);
    context.restore();
  }

  draw(context) {
    context.beginPath();
    context.fillStyle = "red";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fill();
  }

  update() {
   const mat = this.matrix || new Matrix2D();
   mat.appendTransform(
      this.x,
      this.y,
      this.scaleX,
      this.scaleY,
      this.rotation,
      this.skewX,
      this.skewY,
      this.pivotX,
      this.pivotY
    );
   return mat;
  }

  _applyFilters() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = this.width;
    canvas.height = this.height;
    this.draw(context);
    this.filters.forEach(filter => {
      console.log(filter)
      filter.apply(canvas, context);
    });
    return canvas;
  }

  addFilter(filter) {
    this.filters.push(filter);
  }

  // render(context) {
  //   this.update();
  //   if(this.visible === false) {
  //     return;
  //   }
  //   const mat = this.matrix;
  //   context.save();
  //   context.globalAlpha = this.alpha;
  //   context.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
  //   if(this.filters != null) {
  //     //  on appelle une nouvelle méthode _applyFilters
  //     const buffer = this._applyFilters();
  //     const canvas = document.createElement("canvas");
  //     context.drawImage(canvas, 0, 0, buffer.width, buffer.height );
  //   } else {
  //     this.draw(context);
  //   }
  //   context.restore();
  // }

  // isInRect(x,y, rectX, rectY, rectWidth, rectHeight) {
  //   return
  //      x > rectX + rectWidth ||
  //      y > rectY + rectHeight ||
  //      x < rectX ||
  //      y < rectY;
  // }

  // getConcatenedMatrix(){
  //   var current = this;
  //   var mat = new Matrix2D();
  //   while(current != null) {
  //     current.update();
  //     mat.prependMatrix(current.matrix );
  //     current = current.parent;
  //   }
  //   this._concatenedMatrix = mat;
  //   return this._concatenedMatrix;
  // }


  // localToGlobal(x, y) {
  //   const matrix = this.getConcatenedMatrix();
  //   const pt = matrix.transformPoint(x, y);
  //   return new Point(pt.x, pt.y);
  // }

  // globalToLocal(x, y) {
  //   const matrix = this.getConcatenedMatrix().clone().invert();
  //   const pt = matrix.transformPoint(x, y);
  //   return new Point(pt.x, pt.y);
  // }

  // hitTest(x, y) {
  //   if(this.matrix === null) {
  //     this.update();
  //   }

  //   const pt1 = this.globalToLocal(x,y);
  //   return pt1.x < 0 || pt1.x > this.width || pt1.y < 0 || pt1.y > this.height;
  // }
  // TODO USE IT IN STAGE CLASS SO DONT FORGET TO ADD MISSING CODE DUDE :)


};
export default DisplayObject;