const genForms = [];
const cookies = [];
const PROTO_PATHS = {'center':'./Sprites/prototypes/horizontal.png',
'left':'./Sprites/prototypes/backslash.png', 'right':'./Sprites/prototypes/forward.png', 'vertical':'./Sprites/prototypes/horizontal.png'};
const GENFORM_PATH = './Sprites/Usables/lvl0/genform.png';
const BACKGROUND_PATH = "./Sprites/Usables/lvl0/backgroundTall.png";
const PLACEFORM_PATH = './Sprites/Usables/lvl0/placeform.png';//modify this line to view the different sprites
const FLOOR_PATH = "./Sprites/Usables/lvl0/floor.png";
const FLOOR_FLASH_PATH = "./Sprites/Usables/lvl0/floorFlashing.png";
const MUSIC_PATH = "./Music/Alien_One.wav";
const PILLAR_PATH = "./Sprites/Usables/lvl0/pillarWithTorchSheet.png";
const COOKIE_PATH = "./Sprites/Usables/items/cookie.png";
const MAP_FILE_NAME = "test.txt";
const LEVEL1_MAP_FILE_NAME = "test3.txt";
const COOKIE_RADIUS = 21;
const PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 16;
const FLOOR_HEIGHT = 30;
const COL_COUNT = 10;
const HOR_BLOCK_SIZE = 85;
const VERT_BLOCK_SIZE = 85;
const MAPPING = {'\\':'left', '/':'right', '-':'center', '_':'center', '|':'vertical', 'c':'cookie'};

// this file now controls all map assets
class Background {
    constructor(game, AM, spriteSheet, name) {
        this.spriteSheet = AM.getAsset(spriteSheet);
        this.game = game;
        this.srcY = this.spriteSheet.height - this.game.surfaceHeight;
        this.name = name;
    }
    draw() {
        this.game.ctx.drawImage(this.spriteSheet, 0, this.srcY, this.game.surfaceWidth, this.game.surfaceHeight,
            0, 0, this.game.surfaceWidth, this.game.surfaceHeight);
    }
    update() {
        this.srcY -= this.game.camera.currentDrawOffset * .9;
        // if (this.srcY < 0) this.srcY = this.spritesheet.height - this.game.surfaceHeight;
    }
};

class Wall extends Entity{
    self = this;
    constructor(spriteSheet, game, destX, destY) {
        super(self, game, destX, destY);
        this.spriteSheet = spriteSheet;
        this.height = spriteSheet.height;
        this.animation = new Animation(spriteSheet, 0, 0, 66, 599, .1, 3, true, false);
    }
    draw() {
        let drawY = this.cameraTransform(-40);
        if (drawY) {
            // this.game.ctx.drawImage(this.spriteSheet, this.x, drawY);
            this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x, drawY);
        }
    }

}

class Floor {
    constructor(game, flashSheet, spriteSheet) {
        this.spriteSheet = spriteSheet;
        this.game = game;
        this.flashing = false;
        this.flashTime = 3;
        this.flashSheet = flashSheet;
        if (flashSheet) {
            this.animationFlash = new Animation(flashSheet, 0, 
                0, flashSheet.width/2, flashSheet.height, .2, 2, true, false);
        }
    }
    draw() {
        if (this.animationFlash && this.flashing && this.flashTime > 0) {
            this.flashTime -= this.game.clockTick;
            this.animationFlash.drawFrame(this.game.clockTick, this.game.ctx, 0, 
                this.game.surfaceHeight - FLOOR_HEIGHT);
        } else {
            this.flashing = false;
            this.flashTime = 3;
            this.game.ctx.drawImage(this.spriteSheet, 0, this.game.surfaceHeight - FLOOR_HEIGHT, //draws only half the floor
                this.spriteSheet.width, this.spriteSheet.height);
        }
    }
    update() {}
}

class Cookie extends Entity {
    self = this;
    constructor(spriteSheet, destX, destY, game) {
        super(self, game, destX, destY);
        this.spriteSheet = spriteSheet;
        this.scale = .3;
        this.animation = new Animation(spriteSheet, 0, 0, 130, 134, .1, 5, true, false);
        this.radius = this.animation.frameHeight * this.scale / 2;
        let gwCoords = convertCharacterToGameWorldCoords(destX, destY);
        let cartCoords = convertToCartesianCoords(gwCoords.gameWorldX, gwCoords.gameWorldY, game.mapHeight);
        this.equation = {
            radius:this.radius,
            cartesianX: cartCoords.cartesianX,
            cartesianY: cartCoords.cartesianY
        };
    }
    update(){}
    draw(){
        let drawY = this.y;
        if(this.game.camera) {
            drawY = this.cameraTransform(-40);
        }
        if(this.animation)
            this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x, drawY, this.scale);
        //draw for the display cookie
        else
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, 130, 134, 
                this.x, this.y, this.scale * 130, this.scale * 134);
    }
}

 //Type should be a string, 'center', 'left' or 'right depending on the desired platform 
 //this is now the class for both genforms and placeforms
 //changed to extend entity to take part in the update loop
 class Platform extends Entity {
     self = this;
    constructor(spriteSheet, type, destX, destY, scale, game) {
        super(self, game, destX, destY);
        this.type = type;
        //coordinates for new platform style
        // this.srcCoordinates = {'left':[417, 0], 'center':[179, 0], 'right':[0,0]};
        // this.srcWidthAndHeight = {'left':[180, 179], 'center':[237, 24], 'right':[180, 179]};
        this.srcCoordinates = {'left':[212, 0], 'center':[90, 0], 'right':[0,0]};
        this.srcWidthAndHeight = {'left':[87, 87], 'center':[119, 12], 'right':[87, 87]};
        this.spriteSheet = spriteSheet;
        this.scale = scale;
        // console.log(this);
        if (type === 'center') {
            this.equation = convertHorizontalPlatformToEquation(this, game.mapHeight);
        } else if (type === 'left') {
            this.equation = convertLeftSlopedPlatformToEquation(this, game.mapHeight);
        } else {
            this.equation = convertRightSlopedPlatformToEquation(this, game.mapHeight);
        }
    }
    draw() {
        let drawY = this.cameraTransform(-40);
        // console.log(drawY);
        if(drawY) {
            if (this.animation) {
                // console.log(this);
                this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x, drawY, 1);
            } else {
                let width = this.srcWidthAndHeight[this.type][0];
                let height = this.srcWidthAndHeight[this.type][1];
                this.game.ctx.drawImage(this.spriteSheet, this.srcCoordinates[this.type][0], this.srcCoordinates[this.type][1], 
                    width, height, this.x, drawY, 
                    width * this.scale, height * this.scale);
                }
        }
    }
}

function genCookies(numberOfCoins, game, AM, startY, end) {
    generatedCoordinates = randomlyDistributeItems(numberOfCoins, game, startY, end);
    const xCoords = generatedCoordinates.xCoords;
    const yCoords = generatedCoordinates.yCoords;
    const cookieSpriteSheet = AM.getAsset(COOKIE_PATH);
    let i;
    for (i = 0; i < xCoords.length; i++) {
        let curCookie = new Cookie(cookieSpriteSheet, xCoords[i], yCoords[i], game);
        // curGenform.animation = new Animation(AM.getAsset(FLASHFORM), 0, 0, 118.75, 16, .1, 4, true, false);
        game.addEntity(curCookie, 'cookies');
    }
    // console.log(cookies);
}

//this function randomly generates genforms in groups per canvas height of the map
//starting from startY(highest point, lowest value gw coords)
//and going down to endY(lowest point, highest gw coords)
function genGenforms (numOfGenForms, game, AM, startY, endY) {
    // console.log("form width correction", formWidth);
    genForms.splice(0, genForms.length);
    const generatedCoordinates = randomlyDistributeItems(numOfGenForms, game, startY, endY);
    const xCoords = generatedCoordinates.xCoords;
    const yCoords = generatedCoordinates.yCoords;
    const genformSpriteSheet = AM.getAsset(GENFORM_PATH);
    let i;
    for (i = 0; i < xCoords.length; i++) {
        let curGenform = new Platform(genformSpriteSheet, 'center', xCoords[i], yCoords[i], 1, game);
        // curGenform.animation = new Animation(AM.getAsset(FLASHFORM), 0, 0, 118.75, 16, .1, 4, true, false);
        game.addEntity(curGenform, 'genforms');
    }
    return generatedCoordinates.lowest;
}
//randomly generates coordinates
//starting from startY(highest point, lowest value gw coords)
//and going down to endY(lowest point, highest gw coords)
function randomlyDistributeItems(numOfItems, game, startY, endY) {
    const xCoordinates = [];
    const yCoordinates = [];
    let lowestCoords = {x:0, y:0};
    const minHorizontalSeperation = PLATFORM_WIDTH;
    const minVerticalSeperation = Math.floor(game.surfaceHeight/10);
    let x, y;
    let tryLimit = 20;
    numCanvasesInLevel = Math.floor((endY - startY)/game.surfaceHeight);
    let xFound;
    let yFound;
    let yOffset = startY;
    let j;
    for (j = 0; j < numCanvasesInLevel; j++) { //<= is a quick hack should be fixed later
        let startIndex = xCoordinates.length;
        for (var i = 0; i < numOfItems/numCanvasesInLevel; i++) {
            xFound = false;
            yFound = false;
            x = getRandomInt(game.surfaceWidth - minHorizontalSeperation);
            y = getRandomInt(game.surfaceHeight - minVerticalSeperation) + j * game.surfaceHeight + yOffset;
            for (let i = 0; i < tryLimit; i++) {
                if (rejectCoordinate(x, xCoordinates, minHorizontalSeperation, startIndex)) {
                    x = getRandomInt(game.surfaceWidth - minHorizontalSeperation);
                } else {
                    xFound = true;
                    break;
                }
            }
            for (let i = 0; i < tryLimit; i++) {
                if (rejectCoordinate(y, yCoordinates, minVerticalSeperation, startIndex)) {
                    y = getRandomInt(game.surfaceHeight - minVerticalSeperation) + j * game.surfaceHeight + yOffset;
                } else {
                    if (y > lowestCoords.y && y < endY - PLATFORM_HEIGHT - FLOOR_HEIGHT) { //this finds our spawn point for gloop
                        lowestCoords = {x:x, y:y};
                    }
                    yFound = true;
                    break;
                }    
            }
            if(xFound && yFound) {
                xCoordinates.push(x);
                yCoordinates.push(y);
            }
            
        }
    }
    return {xCoords:xCoordinates, yCoords:yCoordinates, lowest:lowestCoords};
}

function genLevel0Exit(game, AM, startY) {
    // lineOfGenForms(game, AM, startY - PLATFORM_HEIGHT);
    buildMapFromFile(game, AM, startY - 2 * VERT_BLOCK_SIZE, MAP_FILE_NAME);
    
}

function lineOfGenForms (game, AM, startY) {
    let drawXPoint = game.surfaceWidth/PLATFORM_WIDTH/3; 
    const genformSpriteSheet = AM.getAsset(GENFORM_PATH);
    for (let i = 0; i < drawXPoint; i++) {
        let curGenform = new Platform(genformSpriteSheet, 'center', i * PLATFORM_WIDTH, startY, 1, game);
        curGenform.animation = new Animation(AM.getAsset(FLASHFORM), 0, 0, 118.75, 16, .1, 4, true, false);
        game.addEntity(curGenform, 'genforms');
    }
    drawXPoint = 2 * game.surfaceWidth/PLATFORM_WIDTH/3;
    for (let i = drawXPoint; i < game.surfaceWidth/PLATFORM_WIDTH; i++) {
        let curGenform = new Platform(genformSpriteSheet, 'center', i * PLATFORM_WIDTH, startY, 1, game);
        curGenform.animation = new Animation(AM.getAsset(FLASHFORM), 0, 0, 118.75, 16, .1, 4, true, false);
        game.addEntity(curGenform, 'genforms');
    }

}

function buildMapFromFile (game, AM, startY, fileName) {
    const mapInfo = AM.getServerAsset(fileName);
    const genformSpriteSheet = AM.getAsset(GENFORM_PATH);
    const cookieSpriteSheet = AM.getAsset(COOKIE_PATH);
    if (!mapInfo) {
        // console.log("error with map file");
        return;
    }
    let bottomRow = mapInfo.length - 1;
    let i;
    let validTypes = Object.values(MAPPING);
    for (i = bottomRow; i >= 0; i--) {
        for (let j = 0; j < COL_COUNT; j++ ) {
            let type = MAPPING[mapInfo[i][j]];
            let checkMembership = (member) => member == type; 
            // console.log(type, validTypes, type in validTypes);
            if (validTypes.some(checkMembership)){ //lol this is dumb but I don't know why the right way doesn't work
            // if (type != 'none') {
                let xCoord;
                let yCoord; 
                if (type === 'cookie') {
                    xCoord = j * HOR_BLOCK_SIZE + HOR_BLOCK_SIZE/2 - COOKIE_RADIUS;
                    yCoord = startY - (bottomRow - i) * VERT_BLOCK_SIZE - VERT_BLOCK_SIZE/2 - COOKIE_RADIUS;
                    let curCookie = new Cookie(cookieSpriteSheet, xCoord, yCoord, game);
                    game.addEntity(curCookie, 'cookies');
                }
                else {
                    if (mapInfo[i][j] === '_') {
                        xCoord = j * HOR_BLOCK_SIZE;
                        yCoord = startY - (bottomRow - i) * VERT_BLOCK_SIZE + VERT_BLOCK_SIZE - PLATFORM_HEIGHT;
                    } else if (mapInfo[i][j]  === '/' || mapInfo[i][j] === '\\') {
                        xCoord = j * HOR_BLOCK_SIZE;
                        yCoord = startY - (bottomRow - i) * VERT_BLOCK_SIZE;
                    } else {
                        xCoord = j * HOR_BLOCK_SIZE;
                        yCoord = startY - (bottomRow - i) * VERT_BLOCK_SIZE;
                    }
                    let curGenform = new Platform(genformSpriteSheet, type, xCoord, yCoord, 1, game);
                    // curGenform.animation = new Animation(AM.getAsset(PROTO_PATHS[type]), 0, 0, 128, 128, .1, 1, true, false);
                    game.addEntity(curGenform, 'genforms');   
                    // console.log(curGenform);

                }
            }
        }
    }
}

//builds the walls
function genWalls (game, AM) {
    const wallSheet = AM.getAsset(PILLAR_PATH)
    let firstWallSection = new Wall(wallSheet, game, 0, 0);
    let destY = game.mapHeight - firstWallSection.height - 28;
    let xLeft = 0;
    let xRight = game.surfaceWidth - firstWallSection.animation.frameWidth + 2;
    firstWallSection.x = xLeft;
    firstWallSection.y = destY;
    game.addEntity(firstWallSection, 'general');
    game.addEntity(new Wall(wallSheet, game, xRight, destY), 'general');

    for (;destY > -firstWallSection.height; destY -= (firstWallSection.height)) {
        game.addEntity(new Wall(wallSheet, game, xLeft, destY), 'general');
        game.addEntity(new Wall(wallSheet, game, xRight, destY), 'general');
    }
    return destY + firstWallSection.height;
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
    AM.queueDownload(FLASHFORM);
    AM.queueServerDownload(MAP_FILE_NAME);
    AM.queueServerDownload(LEVEL1_MAP_FILE_NAME);
    for (const key of Object.keys(PROTO_PATHS)) {
        AM.queueDownload(PROTO_PATHS[key]);
    }
    AM.queueDownload(START_BUTTON);
    AM.queueDownload(GAMEOVER_PATH);
    AM.queueDownload(GAMEOVER_ICON);
    AM.queueDownload(COOKIE_PATH);
    AM.queueDownload(LEVEL1_PATH);
    AM.queueDownload(LEVEL1_FLOOR);
    AM.queueDownload(LEVEL1_FLOOR_FLASH);
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