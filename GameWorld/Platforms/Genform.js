const xCoordinatesGenforms = [];
const yCoordinatesGenforms = [];


 //Type should be a string, 'center', 'left' or 'right depending on the desired platform 
 class Platform {
    constructor(spriteSheet, type, destX, destY, scale, ctx) {
        this.type = type;
        this.srcCoordinates = {'left':[212, 0], 'center':[90, 0], 'right':[0,0]};
        this.srcWidthAndHeight = {'left':[87, 87], 'center':[119, 12], 'right':[87, 87]};
        this.x = destX;
        this.y = destY;
        this.ctx = ctx;
        this.spriteSheet = spriteSheet;
        this.scale = scale;
    }
    draw() {
        let width = this.srcWidthAndHeight[this.type][0];
        let height = this.srcWidthAndHeight[this.type][1];
        this.ctx.drawImage(this.spriteSheet, this.srcCoordinates[this.type][0], this.srcCoordinates[this.type][1], 
            width, height, this.x, this.y, 
            width * this.scale, height * this.scale);
    }
    update() {
    }
}

function genGenforms (numOfGenForms, game, AM) {
    // console.log("form width correction", formWidth);
    const minHorizontalSeperation = Math.floor(game.surfaceWidth/15);//why does this have to be 10
    const minVerticalSeperation = Math.floor(game.surfaceHeight/10);
    let x, y;
    let tryLimit = 20;
    let xFound = false;
    let yFound = false;
    for (var i = 0; i < numOfGenForms; i++) {
        x = getRandomInt(game.surfaceWidth - minHorizontalSeperation);
        y = getRandomInt(game.surfaceHeight - minVerticalSeperation);
        for (let i = 0; i < tryLimit; i++) {
            if (!checkCoordinate(x, xCoordinatesGenforms, minHorizontalSeperation)) {
                x = getRandomInt(game.surfaceWidth - minHorizontalSeperation);
            } else {
                xFound = true;
                break;
            }
        }
        for (let i = 0; i < tryLimit; i++) {
            if (!checkCoordinate(y, yCoordinatesGenforms, minVerticalSeperation)) {
                y = getRandomInt(game.surfaceHeight - minVerticalSeperation);
            } else {
                yFound = true;
                break;
            }    
        }
        if(xFound && yFound) {
            xCoordinatesGenforms.push(x);
            yCoordinatesGenforms.push(y);
            game.addEntity(new Platform(AM.getAsset(genformPath), 'center', x, y, 1, game.ctx));
        }
        
    }
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