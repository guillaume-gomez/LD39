const WidthEnemy = 136/2;
const HeightEnemy = 132/2;
const WidthCharacter = 136/2;
const HeightCharacter = 130/2;
const WidthMedikit = 136/4;
const HeightMedikit = 135/4;
const WidthRemoveEnemiesItem = 136/4;
const HeightRemoveEnemiesItem = 136/4;

const MaxEnemies = 2;
const MaxMedic = 1;
const MaxRemoveEnemiesItem = 1;
const MaxHoles = 2;


//MAZE
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


module.exports = {
  HeightEnemy,
  WidthEnemy,
  WidthCharacter,
  HeightCharacter,
  WidthMedikit,
  HeightMedikit,
  WidthRemoveEnemiesItem,
  HeightRemoveEnemiesItem,
  MaxEnemies,
  MaxMedic,
  MaxRemoveEnemiesItem,
  MaxHoles,
  BEGIN,
  EXIT,
  OTHER,
  CURRENT_POSITION,
  UNKNOWN,
  EXPLORED,
  BEGIN_EXPLORED,
  EXIT_EXPLORED,
  CURRENT_POSITION_EXPLORED
}