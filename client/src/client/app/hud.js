class Hud {

	constructor(canvas, mainCanvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.fillFontStyle = "white";
    this.fillBGStyle = "#24292e";
    this.font = "Helvetica";
    this.widthPanel = 350;
	}

  resize(width, height) {
    //this.canvas.height = height;
    //this.canvas.width = width;
    this.canvas.height = 70;
    this.canvas.width = this.widthPanel;
  }

  //todo add abbraction in this function
  draw(hasStarted, currentRoomConstraint, maze) {
    //maybe remove this line
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();
    if(currentRoomConstraint.type === "o") { // duplicate from maze.js)
      this.showEndGame();
      this.drawMaze(maze.discoveredMatrix);
    } else if (maze.nbAttempts <= 0) {
       this.showLoseGame();
    } else if (hasStarted) {
      this.displayNbAttempt(maze.nbAttempts, maze.maxAttempt);
      this.drawMaze(maze.discoveredMatrix);
    } else {
      this.showGameText();
    }
    this.context.restore();
  }

  showGameText() {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, this.widthPanel, 70);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `20pt ${this.font}`;
    this.context.fillText("Pinch to escape !!",5, 35);
    this.context.font = `10pt ${this.font}`;
    this.context.fillText("LD 39: Pinch&scape", 5, 60);
  }

  showEndGame() {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, 230, 70);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `18pt ${this.font}`;
    this.context.fillText("You Won", 5, 40);
  }

  showLoseGame() {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, this.widthPanel, 70);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `20pt ${this.font}`;
    this.context.fillText("You Lose :( refresh the page", 5, 45);
  }


  displayNbAttempt(currentAttempt, maxAttempt) {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, 230, 70);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `15pt ${this.font}`;
    this.context.fillText(`Attempts: ${currentAttempt} / ${maxAttempt}`, 5, 40);
  }

  drawMaze(matrix) {
    const offset = 20;
    const sizeCells = 15;
    const width = 4 * sizeCells + 2;
    const boxes = 4;
    this.context.translate(this.canvas.width/2 - width/2 + offset, 5);
    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.fillBGStyle;
    this.context.fillStyle = this.fillFontStyle;
    //draw grid
    for (var row = 0; row < boxes; row++) {
      for (var column = 0; column < boxes; column++) {
        var x = column * sizeCells;
        var y = row * sizeCells;
        this.context.rect(x, y, sizeCells, sizeCells);
        this.context.fill();
        this.context.stroke();
      }
    }
    this.context.closePath();

    //helper function
    const getColor = (val) => {
      switch (val) {
        case 0:
          return "#607D8B";
        case 1:
          return "#FF5722";
        case 2:
          return "#03A9F4";
        case 3:
          return "#8BC34A";
        default:
          return "#607D8B";
      }
    };
    //fill case
    for (var row = 0; row < boxes; row++) {
      for (var column = 0; column < boxes; column++) {
        const color = getColor(matrix[row][column]);
        this.context.fillStyle = color;
        var x = column * sizeCells;
        var y = row * sizeCells;
        this.context.fillRect(x, y, sizeCells, sizeCells);
        this.context.stroke();
      }
    }
  }
}
export default Hud;