const _ = require('lodash');
const Constants = require("./constants.js");

class Room {
  constructor(type) {
    this.type = type;
    this.enemies = [];
    this.medics = [];
    const roomNumber = _.random(1,2);
    this[`buildRoom${roomNumber}`]();
  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type;
  }

  buildRoom1() {
    const x = 40;
    const y = 80;
    const speed = 8;
    const enemies = [
      { x, y, speedX: 0, speedY: speed, width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy },
      { x: x + 50, y: y + 50, speedX: 0, speedY: -speed,  width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy }
    ];

    const medics = [
      { x, y, width: 20, height: 20 }
    ];
    this.enemies = enemies;
    this.medics = medics;
  }

  buildRoom2() {
    const x = 40;
    const y = 80;
    const speed = 8;
    const enemies = [
      { x, y, speedX: speed, speedY: 0, width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy },
      { x: x , y: y + 100, speedX: speed, speedY: 0,  width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy }
    ];

    const medics = [
      { x, y, width: 20, height: 20 }
    ];

    this.enemies = enemies;
    this.medics = medics;
  }

  getEnemies() {
    return this.enemies;
  }

  getMedics() {
    return this.medics;
  }

};

module.exports = {
  Room
};