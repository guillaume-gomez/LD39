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



swip(io, ee, {
  cluster: {
    events: {
      update: (cluster) => {
        const { character } = cluster.data;
        let { maze } = cluster.data
        const { enemies, killEnemiesItems } = maze;
        const { radius, x, y, speedX, speedY, life } = character;
        const clients = cluster.clients;
        let nextPosX = x;
        let nextPosY = y;
        let nextSpeedX = 0;
        let nextSpeedY = 0;
        let newLife = life;
        removeFirstClient(cluster);

        const hasStarted = maze.getNbMove() > 0;
        const boundaryOffset = radius + WALL_SIZE;
        const client = clients.find((c) => isParticleInClient(character, c));
        let newState = null;
        if(client) {
          newState = updateGame(client, character, maze, life);
         const {x,y, speedX, speedY } = updatePerson(character, client);
          nextPosX = x;
          nextPosY = y;
          nextSpeedX = speedX;
          nextSpeedY = speedY;

        } else {
          const firstClient = clients[0];
          nextPosX = firstClient.transform.x + (firstClient.size.width / 2);
          nextPosY = firstClient.transform.y + (firstClient.size.height / 2);
          nextSpeedX = 0;
          nextSpeedY = 0;
          newState = updateGame(client, character, maze, life);
        }
        maze.setEnemies(newState.enemies);
        maze.setKillEnemiesItems(newState.killEnemiesItems);
        maze.setMedipackItems(newState.medipackItems);

        const { pendingSplit, currentScreenId } = removeFirstClient(cluster);
        return {
          character: {
            x: { $set: nextPosX },
            y: { $set: nextPosY },
            speedX: { $set: nextSpeedX * 0.97 },
            speedY: { $set: nextSpeedY * 0.97 },
            life: { $set: newState.life }
          },
          hasStarted: { $set: hasStarted },
          pendingSplit: { $set : pendingSplit },
          currentScreenId: { $set: currentScreenId},
          currentRoomConstraint: { $set: MazeTools.getRoomConstraint(maze.getCurrentRoomType()) },
          maze: { $set: maze },
        };
      },
      merge: () => ({}),
    },
    init: () => ({
      character: { x: 200, y: 200, width: Constants.DefaultWidthCharacter, height: Constants.DefaultHeightCharacter, speedX: 0, speedY: 0, life: 100, radius: 35}, //radius must be destroyed
      currentScreenId: 0,
      pendingSplit: null,
      nbClients: 2,
      hasStarted: false,
      currentRoomConstraint: MazeTools.getRoomConstraint(MazeTools.TYPES.BEGIN),
      maze: new MazeTools.Maze(),
    }),
  },

  client: {
    init: () => ({ rotationX: 0, rotationY: 0 }),
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
  return { pendingSplit: pendingSplit, currentScreenId: currentScreenId };
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

function updatePerson(person, client, hasRebound = false) {
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

function updateGame(client, character, maze, life ) {
  const { enemies, killEnemiesItems, medipackItems } = maze;
  let newLife = life;
  let newKillEnemiesItems = killEnemiesItems.slice();
  let newMedipackItems = medipackItems.slice();
  let newEnemies = enemies.map(enemy => {
    return updatePerson(enemy, client, true);
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
  return {
    enemies: newEnemies,
    life: newLife,
    killEnemiesItems: newKillEnemiesItems,
    medipackItems: newMedipackItems
  };
}

server.listen(3000);

// eslint-disable-next-line no-console
console.log('started server: http://localhost:3000');