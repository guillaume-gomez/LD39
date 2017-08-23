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
const SIZE_MAX = 8;

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
    this.medipackItems =  [];
    this.holes = [];
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

  buildHoles() {
    const x = 500;
    const y = 500;
    const radius = 100;
    return [
      { x, y, radius }
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
    const { x, y } = this.getPositionByType(CURRENT_POSITION);
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
    //this.initElements(newX, newY);
    this.minMoves = this.computeMinMoves();
    return true;
  }

  initElements(newX = null, newY = null, client = null) {
    let x = newX;
    let y = newY;
    if(!x || !y) {
      ({x, y} = this.getCurrentPosition());
    }

    const addTransformOffset = (array) => {
      return array.map(value => {
        const updatedPosition = { x: client.transform.x + (client.size.width / 2) + value.x , y: client.transform.y + (client.size.height / 2) + value.y };
        return Object.assign({}, value, updatedPosition);
      });
    }

    this.medipackItems = addTransformOffset(this.matrix[y][x].getMedics());
    this.enemies = addTransformOffset(this.matrix[y][x].getEnemies());
    this.holes = addTransformOffset(this.matrix[y][x].getHoles());
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

  setKillEnemiesItems(killEnemiesItemsArray) {
    this.killEnemiesItems = killEnemiesItemsArray.slice();
  }

  debug() {
    return this.matrix.map( row => {
      return row.map( cell => {
        return cell.getType();
      });
    });
  }

  setMedipackItems(medipackItemsArray) {
    this.medipackItems = medipackItemsArray.slice();
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