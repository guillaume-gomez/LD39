class Hud {

	constructor(canvas, mainCanvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.opacity = 1;
    this.fillFontStyle = `rgba(255, 255, 255, ${this.opacity})`;
    this.fillBGStyle = `rgba(36, 41, 46, ${this.opacity})`;
    this.font = "Helvetica";
    this.widthPanel = 350;
    this.heightPanel = 100;
	}

  resize(width, height) {
    //this.canvas.height = height;
    //this.canvas.width = width;
    this.canvas.height = this.heightPanel;
    this.canvas.width = this.widthPanel;
  }

  updateOpacity(character, converter) {
    if( character.x + character.width < (this.widthPanel * converter.scalingFactor) &&
        character.y < (this.heightPanel * converter.scalingFactor) ) {
      this.opacity = 0.5;
      this.fillFontStyle = `rgba(255, 255, 255, ${this.opacity})`;
      this.fillBGStyle = `rgba(36, 41, 46, ${this.opacity})`;
    } else {
      this.opacity = 1;
      this.fillFontStyle = `rgba(255, 255, 255, ${this.opacity})`;
      this.fillBGStyle = `rgba(36, 41, 46, ${this.opacity})`;
    }
  }

  //todo add abbraction in this function
  draw(hasStarted, currentRoomConstraint, maze, character, converter) {
    //maybe remove this line
    this.updateOpacity(character, converter);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();
    if(currentRoomConstraint.type === "o") { // duplicate from maze.js)
      this.showEndGame();
      this.drawMaze(maze.discoveredMatrix);
    } else if (maze.nbAttempts <= 0 || character.life <= 0) {
      this.showLoseGame();
    } else if (hasStarted) {
      this.renderLife(character.life, 5, 25);
      this.displayMinMoves(maze.minMoves, 5, 65);
      this.drawMaze(maze.discoveredMatrix);
    } else {
      this.showGameText();
    }
    this.context.restore();
  }

  renderLife(life, offsetx = 5, offsety = 40) {
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, 230, this.heightPanel);
    this.context.fill();
    const width = 150;
    const height = 15;
    const transX = offsetx;
    const transY = offsety;
    const lifeRendered = life >0 ? life * width/100 : 0;
    this.context.beginPath();
    this.context.fillStyle = `rgba(96, 125, 139, ${this.opacity})`;
    this.context.fillRect(transX,transY, width + 2, height + 2);
    this.context.fill();

    this.context.beginPath();
    this.context.fillStyle = `rgba(110, 221, 129, ${this.opacity})`;
    this.context.fillRect(transX + 1, transY + 1, lifeRendered, height);
    this.context.fill();

    this.context.beginPath();
    this.context.fillStyle = `rgba(238, 80, 66, ${this.opacity})`;
    this.context.fillRect(transX + 1 + life * 1.5, transY + 1, width - lifeRendered, height);
    this.context.fill();
  }

  showGameText() {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, this.widthPanel, this.heightPanel);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `22pt ${this.font}`;
    this.context.fillText("Pinch to escape !!",5, 45);
    this.context.font = `12pt ${this.font}`;
    this.context.fillText("LD 39: Pinch&scape", 5, 70);
  }

  showEndGame() {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, 230, this.heightPanel);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `20pt ${this.font}`;
    this.context.fillText("You Won", 5, 60);
  }

  showLoseGame() {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, this.widthPanel, this.heightPanel);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `20pt ${this.font}`;
    this.context.fillText("You Lose :( refresh the page", 5, 60);
  }


  displayNbAttempt(currentAttempt, maxAttempt) {
    this.context.beginPath();
    this.context.fillStyle = this.fillBGStyle;
    this.context.fillRect(0, 0, 230, this.heightPanel);
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `13pt ${this.font}`;
    this.context.fillText(`Attempts: ${currentAttempt} / ${maxAttempt}`, 5, 50);
  }

  displayMinMoves(minMoves, x = 5, y = 80) {
    this.context.beginPath();
    this.context.fill();
    this.context.fillStyle = this.fillFontStyle;
    this.context.font = `13pt ${this.font}`;
    this.context.fillText(`Min moves: ${minMoves}`, x, y);
  }

  drawMaze(matrix) {
    const offset = 20;
    const boxes = matrix.length;
    const sizeCells = 60 / boxes;
    const width = boxes * sizeCells + 2;
    this.context.translate(this.canvas.width/2 - width/2 + offset, offset);
    this.context.beginPath();
    this.context.lineWidth = 1;
    //draw grid
    for (var row = 0; row < boxes; row++) {
      for (var column = 0; column < boxes; column++) {
        var x = column * sizeCells;
        var y = row * sizeCells;
        this.context.rect(x, y, sizeCells, sizeCells);
        this.context.stroke();
      }
    }
    this.context.closePath();

    //helper function
    const getColor = (val) => {
      switch (val) {
        case 0:
          return `rgba(96, 125, 139, ${this.opacity})`;
        case 1:
          return `rgba(255, 87, 34, ${this.opacity})`;
        case 2:
          return `rgba(3, 169, 244, ${this.opacity})`;
        case 3:
          return `rgba(139, 195, 74, ${this.opacity})`;
        case 4:
          return `rgba(255, 255, 255, ${this.opacity})`;
        default:
          return `rgba(96, 125, 139, ${this.opacity})`;
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