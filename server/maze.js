const _ = require('lodash');

const BEGIN = "b"
const EXIT = "o";
const OTHER = "x";
const CURRENT_POSITION = "p";
const UNKNOWN = 0;
const EXPLORED = 1;
const BEGIN_EXPLORED = 2;


const TYPES = {
  BEGIN: BEGIN,
  EXIT: EXIT,
  OTHER: OTHER,
  EXPLORED: EXPLORED,
  UNKNOWN: UNKNOWN,
  BEGIN_EXPLORED: BEGIN_EXPLORED
};

const SIZE = 4;

class Maze {
  constructor() {
    this.matrix = [
      [OTHER, OTHER, OTHER, EXIT],
      [OTHER, OTHER, OTHER, OTHER],
      [OTHER, BEGIN, OTHER, OTHER],
      [OTHER, OTHER, OTHER, OTHER],
    ];
    this.discoveredMatrix = [
      [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN],
      [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN],
      [UNKNOWN, BEGIN_EXPLORED, UNKNOWN, UNKNOWN],
      [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN],
    ];
    this.nbMove = 0;
    this.currentRoomType = BEGIN;
    this.nbAttempts = initNbAttempt();
    this.maxAttempt = initNbAttempt();
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

    this.discoveredMatrix[xEnter][yEnter] = EXPLORED;
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
    this.currentRoomType = this.matrix[newY][newX];
    this.matrix[newY][newX] = CURRENT_POSITION;
    this.discoveredMatrix[newY][newX] = EXPLORED;
    this.nbMove++;
    this.nbAttempts--;
    return true;
  }

  getNbMove() {
    return this.nbMove;
  }

  getCurrentRoomType() {
    return this.currentRoomType;
  }

  getNbAttempt() {
    return this.nbAttempts;
  }

  hasWin(type) {
    return this.currentRoomType;
  }

};

function initNbAttempt() {
  return 10;
}

function getRoomConstraint(type) {
  switch(type) {
    case BEGIN:
      return { bgColor: "#2196F3", type: BEGIN };
    case EXIT:
      return { bgColor: "#8BC34A",type: EXIT };
    case OTHER:
      return { bgColor: "#F44336", type: OTHER };
  }
}

function getDiscoveredMatrix() {
  return this.discoveredMatrix;
}


module.exports = {
  Maze,
  TYPES,
  getRoomConstraint,
  initNbAttempt
};