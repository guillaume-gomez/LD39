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
const CURRENT_POSITION_EXPLORED = 4;


class Room {
  constructor(type) {
    this.type = type;
  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type
  }


  

};

module.exports = {
  Room
};