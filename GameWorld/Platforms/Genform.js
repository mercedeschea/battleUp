var xCoordinates = [];
var yCoordinates = [];
var formWidth;
function genGenForms (numOfGenForms, game, AM) {
    formWidth = Math.floor(game.surfaceWidth/10);
    for (var i = 0; i < numOfGenForms; i++) {
        console.log("what is happening", xCoordinates, yCoordinates);
        game.addEntity(new Genform(game, AM.getAsset(genformPath)));
    }
}

function Genform(game, spritesheet) {
    console.log("game width", game.surfaceWidth, "game height", game.surfaceHeight);
    this.x = getRandomInt(game.surfaceWidth - formWidth);
    this.y = getRandomInt(game.surfaceHeight - 10);
    while (!checkCoordinate(this.x, xCoordinates)) this.x = getRandomInt(game.surfaceWidth - formWidth);
    xCoordinates.push(this.x);
    while (!checkCoordinate(this.y, yCoordinates)) this.y = getRandomInt(game.surfaceHeight - 10);
    yCoordinates.push(this.y);
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

function checkScope() {
    console.log(gameEngine.ctx);
}
Genform.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

function checkCoordinate(coord, coords) {
    for (toCheck of coords) {
        if (Math.abs(toCheck - coord) < formWidth) {
            return false;
        }
    }
    return true;
}
Genform.prototype.update = function () {
};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
