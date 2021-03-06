const _ = require('lodash');
const Constants = require("./constants.js");
const Room = require('./room.js');

const SIZE_MIN = 4;
//size_max value too high cause server latency if the maze become too large
const SIZE_MAX = 5;
const WALL_SIZE = 20;

class Maze {
  constructor() {
    this.nbMove = 0;
    this.size = 0;
    this.currentRoomType = Constants.BEGIN;
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
    //check if the game is already finish
    if(this.hasWin()) {
      return false;
    }

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
    this.minMoves = this.computeMinMoves();

    return true;
  }

  initElements(newX = null, newY = null, client = null) {
    let x = newX;
    let y = newY;
    if(!x || !y) {
      ({x, y} = this.getCurrentPosition());
    }

    this.medipackItems = this.offsetFromCenterOfRoom(client, this.matrix[y][x].getMedics());
    this.enemies = this.offsetFromCenterOfRoom(client, this.matrix[y][x].getEnemies());
    this.holes = this.offsetFromCenterOfRoom(client, this.matrix[y][x].getHoles());
    this.killEnemiesItems = this.moveInCorner(client, this.matrix[y][x].getKillEnemiesItems());
  }

  offsetFromCenterOfRoom(client, array) {
    return array.map(value => {
      const updatedPosition = { x: client.transform.x + (client.size.width / 2) + value.x , y: client.transform.y + (client.size.height / 2) + value.y };
      return Object.assign({}, value, updatedPosition);
    });
   }

  moveInCorner(client, array) {
    const direction = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    return array.map(value => {
      const directionChoosed = direction[_.random(0, direction.length - 1)];
      let offsetX = 0;
      let offsetY = 0;
      switch(directionChoosed) {
        case 'top-left':
          offsetX = WALL_SIZE + value.x;
          offsetY = WALL_SIZE + value.y;
        break;
        case 'top-right':
          offsetX = client.size.width - WALL_SIZE - value.width - value.x;
          offsetY = WALL_SIZE + value.y;
        break;
        case 'bottom-left':
          offsetX = WALL_SIZE + value.x;
          offsetY = client.size.height - WALL_SIZE - value.height - value.y;
        break;
        case 'bottom-right':
          offsetX = client.size.width - WALL_SIZE - value.width - value.x;
          offsetY = client.size.height - WALL_SIZE - value.height - value.y;
        break
      }

      const updatedPosition = { x: client.transform.x + offsetX, y: client.transform.y + offsetY };
      return Object.assign({}, value, updatedPosition);
    });
  }

  getNbMove() {
    return this.nbMove;
  }

  getCurrentRoomType() {
    return this.currentRoomType;
  }

  hasWin() {
    return this.currentRoomType === Constants.EXIT;
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
    if(this.nbMove === 0) {
      return 0;
    }
    return 20 * (this.matrix.length / SIZE_MAX);
  }

};

function getRoomConstraint(type) {
  switch(type) {
    case Constants.BEGIN:
      return { bgColor: "#bcbcbc", type: Constants.BEGIN };
    case Constants.EXIT:
      return { bgColor: "#ead1b3", type: Constants.EXIT };
    case Constants.CURRENT_POSITION:
      return { bgColor: "#a7a7b1", type: Constants.CURRENT_POSITION };
    case Constants.OTHER:
      return { bgColor: "#a7a7b1", type: Constants.OTHER };
  }
}

function getDiscoveredMatrix() {
  return this.discoveredMatrix;
}


module.exports = {
  Maze,
  getRoomConstraint
};