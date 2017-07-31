class Hud {

	constructor(canvas, mainCanvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
	}

  resize(width, height) {
    console.log("jjj")
    this.canvas.height = height;
    this.canvas.width = width;
  }

  //todo add abbraction in this function
  draw(hasStarted, currentRoomConstraint, nbAttempts, maxAttempt) {
    this.context.save();
    if(currentRoomConstraint.type === "o") { // duplicate from maze.js)
      this.showEndGame();
    } else if (nbAttempts <= 0) {
      this.showLoseGame();
    } else if (hasStarted) {
      this.displayNbAttempt(nbAttempts, maxAttempt)
      //this.renderMaze(ctx);
    } else {
      this.showGameText();
    }
    this.context.restore();
  }

  showGameText() {
    this.context.beginPath();
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, 320, 70);
    this.context.fill();
    this.context.fillStyle = "white";
    this.context.font = "18pt sans-serif";
    this.context.fillText("Welcome in this experiment", 10, 40);
  }

  showEndGame() {
    this.context.beginPath();
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, 320, 70);
    this.context.fill();
    this.context.fillStyle = "white";
    this.context.font = "18pt sans-serif";
    this.context.fillText("You Win", 10, 40);
  }

  showLoseGame() {
    this.context.beginPath();
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, 320, 70);
    this.context.fill();
    this.context.fillStyle = "white";
    this.context.font = "18pt sans-serif";
    this.context.fillText("You Lose :( refresh the page", 10, 40);
  }


  displayNbAttempt(currentAttempt, maxAttempt) {
    this.context.beginPath();
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, 220, 70);
    this.context.fill();
    this.context.fillStyle = "white";
    this.context.font = "18pt sans-serif";
    this.context.fillText(`NbAttempts ${currentAttempt} / ${maxAttempt}`, 10, 40);
  }

  renderMaze(matrix, xOrigin = 10, yOrigin = 10) {
    const width = 82;
    const height = 82;
    const sizeCells = 20;
    this.context.translate(xOrigin, yOrigin);
    for (var x = 0.5; x < width; x += sizeCells) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height - 2);
    }

    for (var y = 0.5; y < height; y += sizeCells) {
      this.context.moveTo(0, y);
      this.context.lineTo(width - 2, y);
    }
    this.context.strokeStyle = "#000";
    this.context.stroke();
  }
}
export default Hud;