const express = require('express');
const app = express();
// eslint-disable-next-line new-cap
const server = require('http').Server(app);
const io = require('socket.io')(server);
const swip = require('../swip/server/index.js');

app.use(express.static(`${__dirname}/../client`));

const MazeTools = require("./maze.js");
//const Enemy = require("./e.js");

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
        const { character, maze, particles } = cluster.data;
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
        const newParticles = particles.map(particle => {
          return updateParticle(particle, client);
        });

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
          maze: { $set: maze },
          particles: { $set: newParticles }
        };
      },
      merge: () => ({}),
    },
    init: () => ({
      character: { x: 50, y: 50, radius: 10, speedX: 0, speedY: 0 },
      currentScreenId: 0,
      pendingSplit: null,
      nbClients: 2,
      hasStarted: false,
      currentRoomConstraint: MazeTools.getRoomConstraint(MazeTools.TYPES.BEGIN),
      maze: new MazeTools.Maze(),
      particles: [ { x: 500, y: 300, speedX: 10, speedY: 0, width: 50, height: 40 }, { x: 300, y: 500, speedX: -10, speedY: 0,  width: 50, height: 40}]
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
            ball: {
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

function updateParticle(particle, client) {
  const { radius, x, y, speedX, speedY, width, height } = particle;
  let nextPosX = x + speedX;
  let nextPosY = y + speedY;
  let nextSpeedX = speedX;
  let nextSpeedY = speedY;
  const boundaryX = width + WALL_SIZE;
  const boundaryY = height + WALL_SIZE;
  // update speed and position if collision happens
  if (((speedX < 0) &&
    ((nextPosX - boundaryX) < client.transform.x) &&
    !isWallOpenAtPosition(client.transform.y, client.openings.left, nextPosY))) {
    nextPosX = client.transform.x + boundaryX;
    nextSpeedX = speedX * -1;
  } else if (((speedX > 0) &&
    ((nextPosX + boundaryX) > (client.transform.x + client.size.width)) &&
    !isWallOpenAtPosition(client.transform.y, client.openings.right, nextPosY))) {
    nextPosX = client.transform.x + (client.size.width - boundaryX);
    nextSpeedX = speedX * -1;
  }

  if (((speedY < 0) &&
    ((nextPosY - boundaryY) < client.transform.y &&
    !isWallOpenAtPosition(client.transform.x, client.openings.top, nextPosX)))) {
    nextPosY = client.transform.y + boundaryY;
    nextSpeedY = speedY * -1;
  } else if (((speedY > 0) &&
    ((nextPosY + boundaryY) > (client.transform.y + client.size.height)) &&
    !isWallOpenAtPosition(client.transform.x, client.openings.bottom, nextPosX))
  ) {
    nextPosY = client.transform.y + (client.size.height - boundaryY);
    nextSpeedY = speedY * -1;
  }
  return { x: nextPosX, y: nextPosY, speedX: nextSpeedX, speedY: nextSpeedY, width, height };
}

server.listen(3000);

// eslint-disable-next-line no-console
console.log('started server: http://localhost:3000');