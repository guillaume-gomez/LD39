const _ = require('lodash');
const Constants = require("./constants.js");

const BEGIN = "b"
const EXIT = "o";
const OTHER = "x";
const CURRENT_POSITION = "p";
const UNKNOWN = 0;
const EXPLORED = 1;
const BEGIN_EXPLORED = 2;
const EXIT_EXPLORED = 3;


const TYPES = {
  BEGIN: BEGIN,
  EXIT: EXIT,
  OTHER: OTHER,
  EXPLORED: EXPLORED,
  UNKNOWN: UNKNOWN,
  BEGIN_EXPLORED: BEGIN_EXPLORED,
  EXIT_EXPLORED: EXIT_EXPLORED
};

const SIZE = 4;

class Maze {
  constructor() {
    this.matrix = [
      [OTHER, OTHER, OTHER, OTHER],
      [OTHER, OTHER, OTHER, OTHER],
      [OTHER, OTHER, OTHER, OTHER],
      [OTHER, OTHER, OTHER, OTHER],
    ];
    this.discoveredMatrix = [
      [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN],
      [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN],
      [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN],
      [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN],
    ];
    this.nbMove = 0;
    this.currentRoomType = BEGIN;
    this.nbAttempts = initNbAttempt();
    this.maxAttempt = initNbAttempt();
    this.createMaze();
    this.enemies = [];
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

    this.discoveredMatrix[xEnter][yEnter] = BEGIN_EXPLORED;
  }

  buildEnemies() {
    const x = _.random(0, 500);
    const y = _.random(0, 500);
    const speed = _.random(0, 10);
    return [
      { x, y, speedX: speed, speedY: 0, width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy },
      { x: x + 200, y: y + 50, speedX: 0, speedY: -speed,  width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy }
    ];
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

    //update the discovered matrix
    if(this.matrix[newY][newX] === EXIT) {
      this.discoveredMatrix[newY][newX] = EXIT_EXPLORED;
    }
    else {
      this.discoveredMatrix[newY][newX] = EXPLORED;
    }
    //let the begin visible, don't need to erase it
    if(this.matrix[y][x] != BEGIN) {
      this.matrix[y][x] = OTHER;
      this.discoveredMatrix[y][x] = EXPLORED;
    }
    this.currentRoomType = this.matrix[newY][newX];
    this.matrix[newY][newX] = CURRENT_POSITION;
    this.nbMove++;
    this.nbAttempts--;
    this.enemies = this.buildEnemies();
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

  setEnemies(enemiesArray) {
    this.enemies = enemiesArray.slice();
  }

};

function initNbAttempt() {
  return 7;
}

function getRoomConstraint(type) {
  switch(type) {
    case BEGIN:
      return { bgColor: "#b5b9bf", type: BEGIN };
    case EXIT:
      return { bgColor: "#ead1b3", type: EXIT };
    case OTHER:
      return { bgColor: "#efeded", type: OTHER };
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