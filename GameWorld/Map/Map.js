const xCoordinatesGenforms = [];
const yCoordinatesGenforms = [];
const GENFORM_PATH = './Sprites/Usables/Level_0_genform_spritesheet.png';
const BACKGROUND_PATH = "./Sprites/Usables/PossibleBackground.png";
const PLACEFORM_PATH = './Sprites/Usables/Level_0_placeform_spritesheet.png';
// this file now controls all map assets
// ended up changing map elements to extend entit to take part in the update loop 
class Background {
    constructor(game, AM) {
        this.spritesheet = AM.getAsset(BACKGROUND_PATH);
        this.game = game;
        this.srcY = this.spritesheet.height - this.game.surfaceHeight;
    }
    draw() {
        this.game.ctx.drawImage(this.spritesheet, 0, this.srcY, this.spritesheet.width, this.game.surfaceHeight,
            0, 0, this.game.surfaceWidth, this.game.surfaceHeight);
    }
    update() {
        this.srcY -= this.game.camera.y;
        if (this.srcY < 0) this.srcY = this.spritesheet - this.game.surfaceHeight;
    }
};
 //Type should be a string, 'center', 'left' or 'right depending on the desired platform 
 //this is now the class for both genforms and placeforms
 //changed to extend entity to take part in the update loop
 class Platform extends Entity {
     self = this;
    constructor(spriteSheet, type, destX, destY, scale, game) {
        super(self, game, destX, destY);
        this.type = type;
        this.srcCoordinates = {'left':[212, 0], 'center':[90, 0], 'right':[0,0]};
        this.srcWidthAndHeight = {'left':[87, 87], 'center':[119, 12], 'right':[87, 87]};
        this.spriteSheet = spriteSheet;
        this.scale = scale;
    }
    draw() {
        let width = this.srcWidthAndHeight[this.type][0];
        let height = this.srcWidthAndHeight[this.type][1];
        this.game.ctx.drawImage(this.spriteSheet, this.srcCoordinates[this.type][0], this.srcCoordinates[this.type][1], 
            width, height, this.x, this.y, 
            width * this.scale, height * this.scale);
    }
}

function genGenforms (numOfGenForms, game, AM) {
    // console.log("form width correction", formWidth);
    const minHorizontalSeperation = Math.floor(game.surfaceWidth/15);//why does this have to be 10
    const minVerticalSeperation = Math.floor(game.surfaceHeight/10);
    const genformSpriteSheet = AM.getAsset(GENFORM_PATH);
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
            game.addEntity(new Platform(genformSpriteSheet, 'center', x, y, 1, game));
        }
        
    }
}
//queues downloads for map assets
function MapAMDownloads(AM) {
    AM.queueDownload(PLACEFORM_PATH);
    AM.queueDownload(GENFORM_PATH);
    AM.queueDownload(BACKGROUND_PATH);
}
//misc platform helper methods below
//checks a single coordinate against a list of coordinates
//to determine if it is at least a certain distance away
function checkCoordinate(coord, coords, desiredMinSeperation) {
    for (toCheck of coords) {
        // console.log("tocheck is", toCheck);
        if (Math.abs(toCheck - coord) < desiredMinSeperation) {
            return false;
        }
    }
    return true;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
