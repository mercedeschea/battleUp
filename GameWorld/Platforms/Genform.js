var genFormPath = '././platform_prototype_1.png'
var xCoordinates = [];
var yCoordinates = [];
var formWidth;
var genGenForms = function (numOfGenForms, game, AM) {
    formWidth = Math.floor(game.surfaceWidth/10);
    for (var i = 0; i < numOfGenForms; i++) {
        game.addEntity(Genform(game, AM.getAsset(genFormPath)));
    }
}

function Genform(game, spritesheet) {
    this.x = getRandomInt();
    this.y = getRandomInt();
    while (!checkCoordinate(this.x, xCoordinates)) this.x = getRandomInt();
    xCoordinates.push(this.x);
    while (!checkCoordinate(this.y, yCoordinates)) this.y = getRandomInt();
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

export { genGenForms };