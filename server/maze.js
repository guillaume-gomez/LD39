const _ = require('lodash');
const Constants = require("./constants.js");
const Room = require('./room.js');

const BEGIN = "b"
const EXIT = "o";
const OTHER = "x";
const CURRENT_POSITION = "p";
const UNKNOWN = 0;
const EXPLORED = 1;
const BEGIN_EXPLORED = 2;
const EXIT_EXPLORED = 3;
const CURRENT_POSITION_EXPLORED = 4;

const TYPES = {
  BEGIN: BEGIN,
  EXIT: EXIT,
  OTHER: OTHER,
  EXPLORED: EXPLORED,
  UNKNOWN: UNKNOWN,
  BEGIN_EXPLORED: BEGIN_EXPLORED,
  EXIT_EXPLORED: EXIT_EXPLORED,
  CURRENT_POSITION_EXPLORED: CURRENT_POSITION_EXPLORED
};

const SIZE_MIN = 4;
const SIZE_MAX = 5;

class Maze {
  constructor() {
    this.nbMove = 0;
    this.size = 0;
    this.currentRoomType = BEGIN;
    this.nbAttempts = initNbAttempt();
    this.maxAttempt = initNbAttempt();
    this.createMaze();
    this.minMoves = this.computeMinMoves();
    this.enemies = [];
    this.killEnemiesItems = [];
  }

  createMaze() {
    let xEnter = 0;
    let yEnter = 0;
    let xOut = 0;
    let yOut = 0;
    this.size = _.random(SIZE_MIN, SIZE_MAX - 1);
    do {
      xEnter = _.random(0, this.size - 1);
      yEnter = _.random(0, this.size - 1);
      xOut = _.random(0, this.size - 1);
      yOut = _.random(0, this.size - 1);
    } while(xEnter === xOut && yEnter === yOut);

    const createDefaultMatrix = (defaultValue, type) => {
      return _.times(this.size, type).map(column => {
        return _.times(this.size, () => {
          return type === Object ? new Room.Room(defaultValue) : defaultValue;
        });
      });
    }
    this.matrix = createDefaultMatrix(OTHER, Object);
    this.discoveredMatrix = createDefaultMatrix(UNKNOWN, Number);
    this.matrix[xEnter][yEnter] = new Room.Room(BEGIN);
    this.matrix[xOut][yOut] = new Room.Room(EXIT);
    this.discoveredMatrix[xEnter][yEnter] = BEGIN_EXPLORED;
  }

  buildEnemies() {
    const x = _.random(0, 500);
    const y = _.random(0, 500);
    const speed = _.random(5, 10);
    return [
      { x, y, speedX: speed, speedY: 0, width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy },
      { x: x + 200, y: y + 50, speedX: 0, speedY: -speed,  width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy }
    ];
  }

  buildKillEnemiesItem() {
    const x = 300;
    const y = 50;
    const width = 200;
    const height = 200;
    return [
      { x, y, width, height }
    ];
  }

  getPositionByType(type) {
    let x = -1;
    let y = -1;
   this.matrix.forEach((row, _y) => {
      const _x = _.findIndex(row,(cell => cell.getType() === type));
      if(_x !== -1) {
        x = _x;
        y = _y;
      }
    });
   return {x, y};
  }

  getCurrentPosition() {
    const {x, y } = this.getPositionByType(CURRENT_POSITION);
    if(x === -1 || y === -1) {
      return this.getPositionByType(BEGIN);
    }
    return {x, y};
  }

  movePosition(direction) {
    const {x, y} = this.getCurrentPosition();
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
    if(newX < 0 || newX > (this.matrix.length - 1)) {
      return false;
    }
    if(newY < 0 || newY > (this.matrix.length - 1)) {
      return false;
    }

    //update the discovered matrix
    if(this.matrix[newY][newX].getType() === EXIT) {
      this.discoveredMatrix[newY][newX] = EXIT_EXPLORED;
    }
    else {
      this.discoveredMatrix[newY][newX] = EXPLORED;
      this.discoveredMatrix[newY][newX] = CURRENT_POSITION_EXPLORED;
    }
    //let the begin visible, don't need to erase it
    if(this.matrix[y][x].getType() != BEGIN) {
      this.matrix[y][x].setType(OTHER);
      this.discoveredMatrix[y][x] = EXPLORED;
    }
    this.currentRoomType = this.matrix[newY][newX].getType();
    this.matrix[newY][newX].setType(CURRENT_POSITION);
    this.nbMove++;
    this.nbAttempts--;
    this.enemies = this.matrix[newY][newX].getEnemies();
    this.killEnemiesItems = this.matrix[newY][newX].getMedics();
    this.minMoves = this.computeMinMoves();
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

  setKillNewEnemiesItem(killEnemiesItemsArray) {
    this.killEnemiesItems = killEnemiesItemsArray.slice();
  }

  debug() {
    return this.matrix.map( row => {
      return row.map( cell => {
        return cell.getType();
      });
    });
  }

  computeMinMoves() {
    const currentPosition = this.getCurrentPosition();
    const exitPosition = this.getPositionByType(EXIT);
    return (Math.abs(exitPosition.x - currentPosition.x)) + (Math.abs(exitPosition.y - currentPosition.y)); 
  }

};

function initNbAttempt() {
  return 14;
}

function getRoomConstraint(type) {
  switch(type) {
    case BEGIN:
      return { bgColor: "#b5b9bf", type: BEGIN };
    case EXIT:
      return { bgColor: "#ead1b3", type: EXIT };
    case CURRENT_POSITION:
      return { bgColor: "#efeded", type: CURRENT_POSITION };
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