const _ = require('lodash');
const Constants = require("./constants.js");
const Room = require('./room.js');

const SIZE_MIN = 4;
//stay size_max cause server latency if the maze become too large
const SIZE_MAX = 5;

class Maze {
  constructor() {
    this.nbMove = 0;
    this.size = 0;
    this.currentRoomType = Constants.BEGIN;
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
    this.matrix = createDefaultMatrix(Constants.OTHER, Object);
    this.discoveredMatrix = createDefaultMatrix(Constants.UNKNOWN, Number);
    this.matrix[xEnter][yEnter] = new Room.Room(Constants.BEGIN);
    this.matrix[xOut][yOut] = new Room.Room(Constants.EXIT);
    this.discoveredMatrix[xEnter][yEnter] = Constants.BEGIN_EXPLORED;
  }

  buildHoles() {
    const x = 500;
    const y = 500;
    const radius = 100;
    return [
      { x, y, radius }
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
    const { x, y } = this.getPositionByType(Constants.CURRENT_POSITION);
    if(x === -1 || y === -1) {
      return this.getPositionByType(Constants.BEGIN);
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
    if(this.matrix[newY][newX].getType() === Constants.EXIT) {
      this.discoveredMatrix[newY][newX] = Constants.EXIT_EXPLORED;
    }
    else {
      this.discoveredMatrix[newY][newX] = Constants.EXPLORED;
      this.discoveredMatrix[newY][newX] = Constants.CURRENT_POSITION_EXPLORED;
    }
    //let the begin visible, don't need to erase it
    if(this.matrix[y][x].getType() != Constants.BEGIN) {
      this.matrix[y][x].setType(Constants.OTHER);
      this.discoveredMatrix[y][x] = Constants.EXPLORED;
    }
    this.currentRoomType = this.matrix[newY][newX].getType();
    this.matrix[newY][newX].setType(Constants.CURRENT_POSITION);
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
    const exitPosition = this.getPositionByType(Constants.EXIT);
    return (Math.abs(exitPosition.x - currentPosition.x)) + (Math.abs(exitPosition.y - currentPosition.y));
  }

  loseLifeAfterPinch() {
    return 20 * (this.matrix.length / SIZE_MAX);
  }

};

function initNbAttempt() {
  return 14;
}

function getRoomConstraint(type) {
  switch(type) {
    case Constants.BEGIN:
      return { bgColor: "#b5b9bf", type: Constants.BEGIN };
    case Constants.EXIT:
      return { bgColor: "#ead1b3", type: Constants.EXIT };
    case Constants.CURRENT_POSITION:
      return { bgColor: "#efeded", type: Constants.CURRENT_POSITION };
    case Constants.OTHER:
      return { bgColor: "#efeded", type: Constants.OTHER };
  }
}

function getDiscoveredMatrix() {
  return this.discoveredMatrix;
}


module.exports = {
  Maze,
  getRoomConstraint,
  initNbAttempt
};