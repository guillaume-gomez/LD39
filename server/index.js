const express = require('express');
const app = express();
// eslint-disable-next-line new-cap
const server = require('http').Server(app);
const io = require('socket.io')(server);
const swip = require('../swip/server/index.js');

app.use(express.static(`${__dirname}/../client`));

const MazeTools = require("./maze.js");

const EventEmitter = require("events").EventEmitter;
const ee = new EventEmitter();

const LEAVE_CLUSTER = "LEAVE_CLUSTER";
const WALL_SIZE = 20;
const SPEED_THRESHOLD = 50;
const DOWNHILL_ACCELERATION_SCALE = 1 / 20;
const ANGLE_INACCURACY = 3;


swip(io, ee, {
  cluster: {
    events: {
      update: (cluster) => {
        const { character, hole, maze } = cluster.data;
        const clients = cluster.clients;
        let downhillAccelerationX = 0;
        let downhillAccelerationY = 0;
        let nextPosX = character.x + character.speedX;
        let nextPosY = character.y + character.speedY;
        let nextSpeedX = character.speedX;
        let nextSpeedY = character.speedY;
        removeFirstClient(cluster);

        const hasStarted = maze.getNbMove() > 0;
        const boundaryOffset = character.radius + WALL_SIZE;
        const client = clients.find((c) => isParticleInClient(character, c));

        const firstClient = client || clients[0];
        nextPosX = firstClient.transform.x + (firstClient.size.width / 2);
        nextPosY = firstClient.transform.y + (firstClient.size.height / 2);
        nextSpeedX = 0;
        nextSpeedY = 0;

        if (isInsideHole(hole, character)) {
          nextPosX = (character.x + hole.x) / 2;
          nextPosY = (character.y + hole.y) / 2;
          nextSpeedX = 0;
          nextSpeedY = 0;
        }
        const { pendingSplit, currentScreenId } = removeFirstClient(cluster);
        return {
          character: {
            x: { $set: nextPosX },
            y: { $set: nextPosY },
            speedX: { $set: (nextSpeedX + downhillAccelerationX) * 0.97 },
            speedY: { $set: (nextSpeedY + downhillAccelerationY) * 0.97 },
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
      character: { x: 50, y: 50, radius: 10, speedX: 0, speedY: 0 },
      hole: { x: 200, y: 200, radius: 15 },
      currentScreenId: 0,
      pendingSplit: null,
      nbClients: 2,
      hasStarted: false,
      currentRoomConstraint: MazeTools.getRoomConstraint(MazeTools.TYPES.BEGIN),
      maze: new MazeTools.Maze()
    }),
  },

  client: {
    init: () => ({ rotationX: 0, rotationY: 0 }),
    events: {

      hitBall: ({ cluster, client }, { speedX, speedY }) => ({
        cluster: {
          data: {
            character: {
              speedX: { $set: speedX },
              speedY: { $set: speedY },
            },
          },
        },
      }),

      setHole: ({ cluster, client }, { x, y }) => ({
        cluster: {
          data: {
            hole: {
              x: { $set: x },
              y: { $set: y },
            },
          },
        },
      }),

      updateOrientation: ({ cluster, client }, { rotationX, rotationY }) => ({
        client: {
          data: {
            rotationX: { $set: rotationX },
            rotationY: { $set: rotationY },
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

function isInsideHole (hole, character) {
  const distanceX = hole.x - character.x;
  const distanceY = hole.y - character.y;
  const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
  const speed = Math.sqrt(Math.pow(character.speedX, 2) + Math.pow(character.speedY, 2));

  return distance <= hole.radius && speed < SPEED_THRESHOLD;
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

server.listen(3000);

// eslint-disable-next-line no-console
console.log('started server: http://localhost:3000');