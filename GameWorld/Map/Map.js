const xCoordinatesGenforms = [];
const yCoordinatesGenforms = [];
const genForms = [];
const GENFORM_PATH = './Sprites/Usables/lvl0/genform.png';
const BACKGROUND_PATH = "./Sprites/Usables/lvl0/backgroundTall.png";
const PLACEFORM_PATH = './Sprites/Usables/lvl0/placeform.png';
const FLOOR_PATH = "./Sprites/Usables/lvl0/floor.png";
const FLOOR_FLASH_PATH = "./Sprites/Usables/lvl0/floorFlashing.png";
const MUSIC_PATH = "./Music/Alien_One.wav";
const PILLAR_PATH = "./Sprites/Usables/lvl0/pillar.png";
const PLATFORM_WIDTH = 125;
const PLATFORM_HEIGHT = 11;
const FLOOR_HEIGHT = 30;
let lowestGenformCoords = [0, 0];

// this file now controls all map assets
class Background {
    constructor(game, AM) {
        this.spritesheet = AM.getAsset(BACKGROUND_PATH);
        this.game = game;
        this.srcY = this.spritesheet.height - this.game.surfaceHeight;
    }
    draw() {
        this.game.ctx.drawImage(this.spritesheet, 0, this.srcY, this.game.surfaceWidth, this.game.surfaceHeight,
            0, 0, this.game.surfaceWidth, this.game.surfaceHeight);
    }
    update() {
        this.srcY -= this.game.camera.currentDrawOffset;
        // if (this.srcY < 0) this.srcY = this.spritesheet.height - this.game.surfaceHeight;
    }
};
class Floor {
    constructor(game, AM) {
        this.spriteSheet = AM.getAsset(FLOOR_PATH);
        this.game = game;
        this.flashing = true;
        let flashSheet = AM.getAsset(FLOOR_FLASH_PATH);
        this.animationFlash = new Animation(flashSheet, 0, 
            0, flashSheet.width/2, flashSheet.height, .2, 2, true, false);
    }
    draw() {
        if (this.flashing) {
            this.animationFlash.drawFrame(this.game.clockTick, this.game.ctx, 0, 
                this.game.surfaceHeight - FLOOR_HEIGHT);
        } else {
            this.game.ctx.drawImage(this.spriteSheet, 0, this.game.surfaceHeight - FLOOR_HEIGHT, //draws only half the floor
                this.spriteSheet.width, this.spriteSheet.height);
        }
    }
    update() {}
}


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
        let drawY = this.cameraTransform(-40);
        // console.log(drawY);
        if(drawY) {
            let width = this.srcWidthAndHeight[this.type][0];
            let height = this.srcWidthAndHeight[this.type][1];
            this.game.ctx.drawImage(this.spriteSheet, this.srcCoordinates[this.type][0], this.srcCoordinates[this.type][1], 
                width, height, this.x, drawY, 
                width * this.scale, height * this.scale);
        }
    }
}
//this function randomly generates genforms in groups per canvas height of the map
function genGenforms (numOfGenForms, game, AM, mapHeight) {
    // console.log("form width correction", formWidth);
    const minHorizontalSeperation = PLATFORM_WIDTH;
    const minVerticalSeperation = Math.floor(game.surfaceHeight/10);
    const genformSpriteSheet = AM.getAsset(GENFORM_PATH);
    let x, y;
    let tryLimit = 20;
    numCanvasesInLevel = Math.floor(mapHeight/game.surfaceHeight);
    let xFound;
    let yFound;

    for (var j = 0; j <= numCanvasesInLevel; j++) { //<= is a quick hack should be fixed later
        let startIndex = xCoordinatesGenforms.length;
        for (var i = 0; i < numOfGenForms/numCanvasesInLevel; i++) {
            xFound = false;
            yFound = false;
            x = getRandomInt(game.surfaceWidth - minHorizontalSeperation);
            y = getRandomInt(game.surfaceHeight - minVerticalSeperation) + j * game.surfaceHeight;
            for (let i = 0; i < tryLimit; i++) {
                if (rejectCoordinate(x, xCoordinatesGenforms, minHorizontalSeperation, startIndex)) {
                    x = getRandomInt(game.surfaceWidth - minHorizontalSeperation);
                } else {
                    xFound = true;
                    break;
                }
            }
            for (let i = 0; i < tryLimit; i++) {
                if (rejectCoordinate(y, yCoordinatesGenforms, minVerticalSeperation, startIndex)) {
                    y = getRandomInt(game.surfaceHeight - minVerticalSeperation) + j * game.surfaceHeight;
                } else {
                    if (y > lowestGenformCoords[1] && y < mapHeight - PLATFORM_HEIGHT - FLOOR_HEIGHT) { //this finds our spawn point for gloop
                        lowestGenformCoords = [x, y];
                    }
                    yFound = true;
                    break;
                }    
            }
            if(xFound && yFound) {
                xCoordinatesGenforms.push(x);
                yCoordinatesGenforms.push(y);
                let curGenform = new Platform(genformSpriteSheet, 'center', x, y, 1, game);
                genForms.push(curGenform);
                game.addEntity(curGenform);
            }
            
        }
    }
}

// testing collision
function testGenforms(game) {
    const genformSpriteSheet = AM.getAsset(GENFORM_PATH);
    game.addEntity(new Platform(genformSpriteSheet, 'center', 250, 314, 1, game.ctx));
}




//queues downloads for map assets
function MapAMDownloads(AM) {
    AM.queueDownload(PLACEFORM_PATH);
    AM.queueDownload(GENFORM_PATH);
    AM.queueDownload(BACKGROUND_PATH);
    AM.queueDownload(FLOOR_PATH);
    AM.queueDownload(FLOOR_FLASH_PATH);
    // AM.queueDownload(MUSIC_PATH);
    AM.queueDownload(PILLAR_PATH);
}
//misc platform helper methods below
//checks a single coordinate against a list of coordinates
//to determine if it is at least a certain distance away
//checks the values form lowestIndex(inclusive) to highestIndex(exclusive)
function rejectCoordinate(coord, coords, desiredMinSeperation, startIndex) {
    
    return coords.slice(startIndex).some(toCheck => Math.abs(toCheck - coord) < desiredMinSeperation);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
