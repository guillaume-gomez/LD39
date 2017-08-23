const _ = require('lodash');
const Constants = require("./constants.js");

class Room {
  constructor(type) {
    this.type = type;
    this.enemies = [];
    this.medics = [];
    this.holes = [];
    const roomNumber = _.random(1, 3);
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
    const speed = 12;
    const enemies = [
      { x, y, speedX: 0, speedY: speed, width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy },
      { x: x + 50, y: y + 50, speedX: 0, speedY: -speed,  width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy }
    ];

    const medics = [
      { x, y, width: 40, height: 40 }
    ];
    this.enemies = enemies;
    this.medics = medics;
  }

  buildRoom2() {
    const x = 40;
    const y = 80;
    const speed = 12;
    const enemies = [
      { x, y, speedX: speed, speedY: 0, width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy },
      { x: x , y: y + 100, speedX: speed, speedY: 0,  width: Constants.DefaultWidthEnemy, height: Constants.DefaultHeightEnemy }
    ];

    const medics = [
      { x, y, width: 40, height: 40 }
    ];

    this.enemies = enemies;
    this.medics = medics;
  }

  buildRoom3() {
   const x = -200;
    const y = 50;
    const radius = 100;
    this.holes = [
      { x, y, radius }
    ];
  }

  getEnemies() {
    return this.enemies;
  }

  getMedics() {
    return this.medics;
  }

  getHoles() {
    return this.holes;
  }

};

module.exports = {
  Room
};