const _ = require('lodash');

const BEGIN = "b"
const EXIT = "o";
const OTHER = "x";
const CURRENT_POSITION = "p";

const TYPES = [ BEGIN, EXIT, OTHER];

const SIZE = 4;

class Maze {
  constructor() {
    this.enter = null;
    this.out = null;
    this.matrix = [
      [OTHER, OTHER, OTHER, OTHER],
      [OTHER, OTHER, OTHER, OTHER],
      [OTHER, OTHER, OTHER, OTHER],
      [OTHER, OTHER, OTHER, OTHER],
    ];
    this.createMaze();
    console.log(this.matrix);
  }

  createMaze() {
    let xEnter = 0;
    let yEnter = 0;
    let xOut = 0;
    let yOut = 0;
    do {
      xEnter = _.random(0, SIZE - 1);
      yEnter = _.random(0, SIZE - 1);
      xOut = _.random(0, SIZE - 1);
      yOut = _.random(0, SIZE - 1);
    } while(xEnter === xOut && yEnter === yOut);
    this.matrix[xEnter][yEnter] = BEGIN;
    this.matrix[xOut][yOut] = EXIT;
  }

  getCurrentPosition() {
    const fn = (type) => {
      return this.matrix.find(row => {
        if(row.includes(type)) {
          return true;
        }
        return false;
      });
    };

    const currentPosition = fn(CURRENT_POSITION);
    if(!currentPosition) {
      return fn(BEGIN);
    }
    return currentPosition;
  }

  getPosition() {
    let x = -1;
    let y = -1;
    const fn = (type) => {
      this.matrix.forEach((row, _y) => {
        const _x = row.indexOf(type);
        if(_x !== -1) {
          x = _x;
          y = _y;
        }
      });
    };
    fn(CURRENT_POSITION);
    if(x === -1 || y === -1) {
      fn(BEGIN);
      return {x, y};
    }
    return {x, y};
  }

  movePosition(direction) {
    const {x, y} = this.getPosition();
    let newX = x;
    let newY = y;
    switch(direction) {
      case 'LEFT':
        newX -= 1;
      break;
      case 'RIGHT':
        newX += 1;
      break;
      case 'UP':
        newY -= 1;
      break;
      case 'DOWN':
        newY += 1;
      break;
    }
    if(newX < 0 || newX > (SIZE - 1)) {
      return false;
    }
    if(newY < 0 || newY > (SIZE - 1)) {
      return false;
    }
    //let the begin visible, don't need to erase it
    if(this.matrix[y][x] != BEGIN) {
      this.matrix[y][x] = OTHER;
    }
    this.matrix[newY][newX] = CURRENT_POSITION;
    return true;
  }

};
module.exports = Maze;