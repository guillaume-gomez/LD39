import {
  DefaultWidthPinch,
  DefaultHeightPinch,
} from "./constants";

export function drawBackground (ctx, client, color = null) {
    ctx.save();
    ctx.fillStyle = color || '#bcbcbc';
    ctx.fillRect(client.transform.x, client.transform.y, client.size.width, client.size.height);
    ctx.restore();
  }

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function drawWalls (ctx, client) {
  const openings = client.openings;
  const transformX = client.transform.x;
  const transformY = client.transform.y;
  var width = client.size.width;
  const height = client.size.height;

  ctx.save();
  ctx.lineWidth = 40;
  ctx.shadowColor = '#a3a1a1';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#e9e9e9';

  // left
  ctx.beginPath();
  ctx.moveTo(transformX, transformY);

  openings.left.sort(openingSort).forEach(function (opening) {
    ctx.lineTo(transformX, opening.start + transformY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(transformX, opening.end + transformY);
  });

  ctx.lineTo(transformX, height + transformY);
  ctx.stroke();

  // right
  ctx.beginPath();
  ctx.moveTo(width + transformX, transformY);

  openings.right.sort(openingSort).forEach(function (opening) {
    ctx.lineTo(width + transformX, opening.start + transformY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width + transformX, opening.end + transformY);
  });

  ctx.lineTo(width + transformX, height + transformY);
  ctx.stroke();

  // top
  ctx.beginPath();
  ctx.moveTo(transformX, transformY);

  openings.top.sort(openingSort).forEach(function (opening) {
    ctx.lineTo(opening.start + transformX, transformY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(opening.end + transformX, transformY);
  });

  ctx.lineTo(width + transformX, transformY);
  ctx.stroke();

  // bottom
  ctx.beginPath();
  ctx.moveTo(transformX, height + transformY);

  openings.bottom.sort(openingSort).forEach(function (opening) {
    ctx.lineTo(opening.start + transformX, height + transformY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(opening.end + transformX, height + transformY);
  });

  ctx.lineTo(width + transformX, height + transformY);
  ctx.stroke();
  ctx.restore();
}

function hasValidDirection(maze) {
  const { discoveredMatrix } = maze;
  const size = discoveredMatrix.length;
  //change 2 by 4
  const currentPosition = 2;
  let y = 0;
  let x = 0;
  console.log(discoveredMatrix)
  discoveredMatrix.forEach((row, _y) => {
    const _x = row.indexOf(currentPosition);
    if(_x !== -1) {
      y = _y;
      x = _x;
    }
  });
  const directions = [];
  if(y < size - 1) {
    directions.push("right");
  }
  if(y > 0) {
    directions.push("left");
  }
  if(x < size - 1) {
    directions.push("bottom");
  }
  if(x > 0) {
    directions.push("top")
  }
  console.log(x, y)
  return directions;
}


export function drawSwipZone(ctx, client, maze, character, pinchSprite, stopSprite) {
  const directions = hasValidDirection(maze);
  const transformX = client.transform.x;
  const transformY = client.transform.y;
  const width = client.size.width;
  const height = client.size.height;
  let swipeZone = client.data.swipeZone;
  let sprite = null;

  ctx.save();
  let lineWidth = width * swipeZone;
  ctx.lineWidth = lineWidth;
  swipeZone =  swipeZone / 2;

  ctx.shadowColor = '#a3a1a1';
  ctx.shadowBlur = 10;

  const characterX = character.x;
  const characterY = character.y;
  const characterWidth = character.width;
  const characterHeight = character.height;

  // left
  ctx.beginPath();
  ctx.moveTo(transformX, transformY);

  if(characterX < transformX + width * swipeZone) {
    if(directions.includes("left")) {
      ctx.strokeStyle = "rgba(255, 153, 12, 0.5)";
      sprite = pinchSprite;
    } else {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      sprite = stopSprite;
    }
    ctx.strokeStyle = directions.includes("left") ? "rgba(255, 153, 12, 0.5)" : "rgba(255, 0, 0, 0.5)";
    ctx.lineTo(transformX, height + transformY);
    ctx.stroke();
    if(sprite) {
      sprite.x = (width * swipeZone) / 2 - DefaultWidthPinch / 2;
      sprite.y = height / 2 - DefaultHeightPinch / 2;
      sprite.render(ctx);
    }
  }

  // right
  if(characterX + characterWidth > transformX + width * (1 - swipeZone)) {
    if(directions.includes("right")) {
      ctx.strokeStyle = "rgba(255, 153, 12, 0.5)";
      sprite = pinchSprite;
    } else {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      sprite = stopSprite;
    }
    ctx.beginPath();
    ctx.moveTo(width + transformX, transformY);
    ctx.lineTo(width + transformX, height + transformY);
    ctx.stroke();
    if(sprite) {
      sprite.x = width - (width * swipeZone) / 2 - DefaultWidthPinch / 2;
      sprite.y = height / 2 - DefaultHeightPinch / 2;
      sprite.render(ctx);
    }
  }
  lineWidth = height * swipeZone;
  ctx.lineWidth = lineWidth
  swipeZone = swipeZone / 2;
  // top
  if(characterY < transformY + height * swipeZone) {
    if(directions.includes("top")) {
      ctx.strokeStyle = "rgba(255, 153, 12, 0.5)";
      sprite = pinchSprite;
    } else {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      sprite = stopSprite;
    }
    ctx.beginPath();
    ctx.moveTo(transformX, transformY);
    ctx.lineTo(width + transformX, transformY);
    ctx.stroke();
    if(sprite) {
      sprite.x = width / 2 - DefaultWidthPinch / 2;
      sprite.y = (height * swipeZone) / 2 - DefaultHeightPinch / 2;
      sprite.render(ctx);
    }
  }

  // bottom
  if(characterY + characterHeight > transformY + height * (1 - swipeZone)) {
     if(directions.includes("bottom")) {
      ctx.strokeStyle = "rgba(255, 153, 12, 0.5)";
      sprite = pinchSprite;
    } else {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      sprite = stopSprite;
    }
    ctx.beginPath();
    ctx.moveTo(transformX, height + transformY);
    ctx.lineTo(width + transformX, height + transformY);
    ctx.stroke();
    if(sprite) {
      sprite.x = width / 2 - DefaultWidthPinch / 2;
      sprite.y = height - (height * swipeZone) / 2 - DefaultHeightPinch / 2;
      sprite.render(ctx);
    }
  }

  ctx.restore();
}

export function openingSort (openingA, openingB) {
  return openingB.start - openingA.start;
}

export function drawCircle(ctx, character) {
  ctx.save();

  ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';

  ctx.beginPath();
  ctx.arc(character.x, character.y, character.radius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.restore();
}

export function drawRect(ctx, rect, fillStyle = 'rgba(255, 0, 0, 0.6)', shadowColor = 'rgba(0, 0, 0, 0.2)') {
  const {x, y, width, height} = rect;
  ctx.save();

  ctx.fillStyle = fillStyle;
  ctx.shadowBlur = 10;
  ctx.shadowColor = shadowColor;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}


export function drawArrow(ctx, character, dragPosition) {
  var angle;

  ctx.save();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 5;

  angle = -Math.atan2(dragPosition.x - character.x, dragPosition.y - character.y) + Math.PI / 2;

  ctx.beginPath();
  ctx.arc(character.x + character.width/2, character.y + character.height/2, character.width / 2, angle + Math.PI / 2, angle - Math.PI / 2);
  ctx.arc(dragPosition.x, dragPosition.y, character.height / 4, angle - Math.PI / 2 , angle + Math.PI / 2);
  ctx.fill();

  ctx.restore();
}


export function drawHole (ctx, hole) {
  ctx.save();

  ctx.fillStyle = 'black';
  ctx.strokeStyle = '#4e5154';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
    deferTimer;
  return function () {
    var ctx = scope || this;

    var now = +new Date,
      args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(ctx, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(ctx, args);
    }
  };
}
