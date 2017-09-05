const express = require('express');
const app = express();
// eslint-disable-next-line new-cap
const server = require('http').Server(app);
const io = require('socket.io')(server);
const swip = require('../swip/server/index.js');

app.use(express.static(`${__dirname}/../client`));

const MazeTools = require("./maze.js");
const Constants = require("./constants.js");

const EventEmitter = require("events").EventEmitter;
const ee = new EventEmitter();

const LEAVE_CLUSTER = "LEAVE_CLUSTER";
const WALL_SIZE = 20;
const SPEED_THRESHOLD = 50;
const SWIPE_ZONE_PERCENTAGE_OF_SCREEN = 0.30;

const ENABLE_BORDER = (process.argv.length > 2 && process.argv[2] == "enable-border");
console.log("enable border", ENABLE_BORDER)



swip(io, ee, {
  cluster: {
    events: {
      update: (cluster) => {
        const { character } = cluster.data;
        let { maze } = cluster.data
        const { enemies, killEnemiesItems } = maze;
        const { radius } = character;

        const clients = cluster.clients;
        const hasStarted = maze.getNbMove() > 0;
        const boundaryOffset = radius + WALL_SIZE;
        const client = clients.find((c) => isParticleInClient(character, c));
        let nextState = null;
        if(client) {
          nextState = updateGame(client, character, maze);
        } else {
          const firstClient = clients[0];
          maze.initElements(null, null, firstClient);
          nextState = updateGame(firstClient, character, maze);
          nextState = Object.assign({}, nextState,
            { x: firstClient.transform.x + (firstClient.size.width / 2),
              y: firstClient.transform.y + (firstClient.size.height / 2),
              speedX: 0,
              speedY: 0
            });
        }
        maze.setEnemies(nextState.enemies);
        maze.setKillEnemiesItems(nextState.killEnemiesItems);
        maze.setMedipackItems(nextState.medipackItems);

        const { pendingSplit, currentScreenId } = removeFirstClient(cluster);
        const lifeLostAfterPinch = loseLifeAfterPinch(cluster, maze);
        return {
          character: {
            x: { $set: nextState.x },
            y: { $set: nextState.y },
            speedX: { $set: nextState.speedX },
            speedY: { $set: nextState.speedY },
            life: { $set: nextState.life - lifeLostAfterPinch }
          },
          hasStarted: { $set: hasStarted },
          pendingSplit: { $set : pendingSplit },
          currentScreenId: { $set: currentScreenId},
          currentRoomConstraint: { $set: MazeTools.getRoomConstraint(maze.getCurrentRoomType()) },
          maze: { $set: maze }
        };
      },
      merge: () => ({}),
    },
    init: () => ({
      character: { x: 250, y: 250, width: Constants.DefaultWidthCharacter, height: Constants.DefaultHeightCharacter, speedX: 0, speedY: 0, life: 100, radius: 35}, //radius must be destroyed
      currentScreenId: 0,
      pendingSplit: null,
      nbClients: 2,
      hasStarted: false,
      currentRoomConstraint: MazeTools.getRoomConstraint(Constants.BEGIN),
      maze: new MazeTools.Maze(),
      enableBorder: ENABLE_BORDER
    }),
  },

  client: {
    init: () => ({ rotationX: 0, rotationY: 0, swipeZone: SWIPE_ZONE_PERCENTAGE_OF_SCREEN }),
    events: {

      move: ({ cluster, client }, { speedX, speedY }) => ({
        cluster: {
          data: {
            character: {
              speedX: { $set: speedX },
              speedY: { $set: speedY },
            },
          },
        },
      }),

      shoot: ({ cluster, client }, { x, y }) => ({
        cluster: {
          data: {
            character: {
              x: { $set: x },
              y: { $set: y },
            },
          },
        },
      }),
    },
  },
});

function isParticleInClient (character, client) {
  const leftSide = client.transform.x;
  const rightSide = (client.transform.x + client.size.width);
  const topSide = client.transform.y;
  const bottomSide = (client.transform.y + client.size.height);

  return character.x < rightSide && character.x > leftSide && character.y > topSide && character.y < bottomSide;
}

function isInsideHole(hole, character) {
  const distanceX = hole.x - (character.x + character.width / 2);
  const distanceY = hole.y - (character.y + character.height / 2);
  const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
  const speed = Math.sqrt(Math.pow(character.speedX, 2) + Math.pow(character.speedY, 2));

  return distance <= hole.radius && speed < SPEED_THRESHOLD;
}

function isWallOpenAtPosition (transform, openings, particlePos) {
  return openings.some((opening) => (
    particlePos >= (opening.start + transform) && particlePos <= (opening.end + transform)
  ));
}

function shouldIPassedProperty(cluster) {
  const { clients } = cluster;
  const { nbClients } = cluster.data;
  return nbClients === clients.length
}

function removeFirstClient(cluster) {
  const { clients, data } = cluster;
  let { currentScreenId, pendingSplit } = data;
  if(shouldIPassedProperty(cluster) && !pendingSplit) {
    const newClient = clients.find(client => client.id !== currentScreenId);
    const fn = () => {
      ee.emit(LEAVE_CLUSTER, newClient.id);
    };
    setTimeout(fn, 1000);
    return { pendingSplit: true, currentScreenId: newClient.id };
  }
  return { pendingSplit: pendingSplit, currentScreenId: currentScreenId};
}

function loseLifeAfterPinch(cluster, maze) {
  const { clients, data } = cluster;
  let { currentScreenId, pendingSplit } = data;
  if(shouldIPassedProperty(cluster) && !pendingSplit) {
    return maze.loseLifeAfterPinch();
  }
  return 0;
}


function rectCircleColliding(circle, rect){
    const distX = Math.abs(circle.x - rect.x - rect.width / 2);
    const distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) { return false; }
    if (distY > (rect.height / 2 + circle.radius)) { return false; }

    if (distX <= (rect.width / 2)) { return true; }
    if (distY <= (rect.height / 2)) { return true; }

    var dx = distX - rect.width / 2;
    var dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius ));
}

function intersectRect(r1, r2) {

  return !(r2.x > (r1.x + r1.width) ||
           (r2.x + r2.width) < r1.x ||
           r2.y  > (r1.y + r1.height) ||
           (r2.y + r2.height) < r1.y);
}

function updatePerson(client, person, hasRebound = false) {
  const { x, y, speedX, speedY, width, height } = person;
  let nextPosX = x + speedX;
  let nextPosY = y + speedY;
  let nextSpeedX = speedX;
  let nextSpeedY = speedY;
  const boundaryX = width + WALL_SIZE;
  const boundaryY = height + WALL_SIZE;
  // update speed and position if collision happens
  if (((speedX < 0) &&
    ((nextPosX - WALL_SIZE) < client.transform.x) &&
    !isWallOpenAtPosition(client.transform.y, client.openings.left, nextPosY))) {
    nextPosX = client.transform.x + WALL_SIZE;
    nextSpeedX = hasRebound ? speedX * -1 : 0;
  } else if (((speedX > 0) &&
    ((nextPosX + boundaryX) > (client.transform.x + client.size.width)) &&
    !isWallOpenAtPosition(client.transform.y, client.openings.right, nextPosY))) {
    nextPosX = client.transform.x + (client.size.width - boundaryX);
    nextSpeedX = hasRebound ? speedX * -1 : 0;
  }

  if (((speedY < 0) &&
    ((nextPosY - WALL_SIZE) < client.transform.y &&
    !isWallOpenAtPosition(client.transform.x, client.openings.top, nextPosX)))) {
    nextPosY = client.transform.y + WALL_SIZE;
    nextSpeedY = hasRebound ? speedY * -1 : 0;
  } else if (((speedY > 0) &&
    ((nextPosY + boundaryY) > (client.transform.y + client.size.height)) &&
    !isWallOpenAtPosition(client.transform.x, client.openings.bottom, nextPosX))
  ) {
    nextPosY = client.transform.y + (client.size.height - boundaryY);
    nextSpeedY = hasRebound ? speedY * -1 : 0;
  }
  return { x: nextPosX, y: nextPosY, speedX: nextSpeedX, speedY: nextSpeedY, width, height };
}

function updateGame(client, character, maze ) {
  const { enemies, killEnemiesItems, medipackItems, holes } = maze;
  const { life } = character;

  let newLife = life;
  let newKillEnemiesItems = killEnemiesItems.slice();
  let newMedipackItems = medipackItems.slice();

  const { x, y, speedX, speedY } = updatePerson(client, character);

  let newEnemies = enemies.map(enemy => {
    return updatePerson(client, enemy, true);
  });

  newEnemies.map(enemy => {
    if(intersectRect(character, enemy))
    {
      newLife = newLife - 2;
    }
  });

  const hasColissionWithMedipack = medipackItems.some(item => {
    return intersectRect(character, item);
  });
  if(hasColissionWithMedipack && newLife < 100) {
    newLife = newLife + 10;
    newMedipackItems = [];
  }

  const hasColissionWithKillEnemiesItem = newKillEnemiesItems.some(item => {
    return intersectRect(character, item);
  });
  if(hasColissionWithKillEnemiesItem) {
    newEnemies = [];
    newKillEnemiesItems = [];
  }
  holes.some(hole => {
    if (isInsideHole(hole, character)) {
      newLife = 0;
      //exit the loop
      return true;
    }
  });
  return {
    x,
    y,
    speedX,
    speedY,
    life: newLife,
    enemies: newEnemies,
    killEnemiesItems: newKillEnemiesItems,
    medipackItems: newMedipackItems
  };
}

server.listen(3000);
// eslint-disable-next-line no-console
console.log('started server: http://localhost:3000');