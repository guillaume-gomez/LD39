export function drawBackground (ctx, client, color = null) {
    ctx.save();
    ctx.fillStyle = color || '#80d735';
    ctx.fillRect(client.transform.x, client.transform.y, client.size.width, client.size.height);
    ctx.restore();
  }

export function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function drawWalls (ctx, client) {
    var openings = client.openings;
    var transformX = client.transform.x;
    var transformY = client.transform.y;
    var width = client.size.width;
    var height = client.size.height;

    ctx.save();
    ctx.lineWidth = 40;
    ctx.shadowColor = '#a3a1a1';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#dddddd';

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

export function drawRect(ctx, character) {
    const {x, y, width, height} = character;
    ctx.save();

    ctx.fillStyle = '#ffaaaa';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y, width, height);
    //ctx.fillRect(x, y, width, height);

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
    ctx.arc(character.x, character.y, character.radius / 2, angle + Math.PI / 2, angle - Math.PI / 2);
    ctx.arc(dragPosition.x, dragPosition.y, character.radius / 4, angle - Math.PI / 2 , angle + Math.PI / 2);
    ctx.fill();

    ctx.restore();
  }

export function drawHole (ctx, hole) {
    console.log(hole)
    ctx.save();

    ctx.fillStyle = 'black';
    ctx.strokeStyle = '#4b7f1f';
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
