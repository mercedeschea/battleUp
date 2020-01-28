const xCoordinatesGenforms = [];
const yCoordinatesGenforms = [];
function genGenforms (numOfGenForms, game, AM) {
    // console.log("form width correction", formWidth);
    const minHorizontalSeperation = Math.floor(game.surfaceWidth/15);//why does this have to be 10
    const minVerticalSeperation = Math.floor(game.surfaceHeight/10);
    for (var i = 0; i < numOfGenForms; i++) {
        // console.log("what is happening", xCoordinates, yCoordinates);
        game.addEntity(new Genform(game, AM.getAsset(genformPath), minHorizontalSeperation, minVerticalSeperation));
    }
}

class Genform {
    constructor(game, spritesheet, minHorizontalSeperation, minVerticalSeperation) {
        // console.log("game width", game.surfaceWidth, "game height", game.surfaceHeight);
        this.x = getRandomInt(game.surfaceWidth - minHorizontalSeperation);
        this.y = getRandomInt(game.surfaceHeight - minVerticalSeperation);
        while (!checkCoordinate(this.x, xCoordinatesGenforms, minHorizontalSeperation))
            this.x = getRandomInt(game.surfaceWidth - minHorizontalSeperation), console.log("the x coord", this.x, "the x coords", xCoordinatesGenforms);
        xCoordinatesGenforms.push(this.x);
        while (!checkCoordinate(this.y, yCoordinatesGenforms, minVerticalSeperation))
            this.y = getRandomInt(game.surfaceHeight - minVerticalSeperation), console.log("the y coord", this.y, "the y coords", yCoordinatesGenforms);
        yCoordinatesGenforms.push(this.y);
        this.spritesheet = spritesheet;
        this.game = game;
        this.ctx = game.ctx;
        this.widthDraw = 120; 
        this.heightDraw = 13;
        this.scale = 1;
    }
    draw() {
        this.ctx.drawImage(this.spritesheet, 90, 0, this.widthDraw, this.heightDraw, this.x, this.y, this.widthDraw * this.scale, this.heightDraw * this.scale);
    }
    update() {
    }
}
;

function checkScope() {
    console.log(gameEngine.ctx);
}

function checkCoordinate(coord, coords, desiredMinSeperation) {
    for (toCheck of coords) {
        console.log("tocheck is", toCheck);
        if (Math.abs(toCheck - coord) < desiredMinSeperation) {
            return false;
        }
    }
    return true;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
