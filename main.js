const AM = new AssetManager();
const SCENE_MANAGER = new SceneManager();
const SCORE_TEXT = "./Sprites/HUD/score_Text.png";
const FLASHFORM = "./Sprites/Usables/lvl0/placeform2.png";


class Animation {
    constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, rotatedCache) {
        this.spriteSheet = spriteSheet;
        this.startX = startX;
        this.startY = startY;
        this.frameWidth = frameWidth;
        this.frameDuration = frameDuration;
        this.frameHeight = frameHeight;
        this.frames = frames;
        this.totalTime = frameDuration * frames;
        this.elapsedTime = 0;
        this.loop = loop;
        this.reverse = reverse;
        this.rotatedCache = rotatedCache;
    }
    drawFrame(tick, ctx, x, y, scaleBy, rotation) {
        var scaleBy = scaleBy || 1;
        
        this.elapsedTime += tick;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = this.elapsedTime - this.totalTime;
            }
        } else if (this.isDone()) {
            return;
        }
        var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
        var vindex = 0;
        // console.log(this.spriteSheet);
        if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
            index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
            vindex++;
        }
        while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
            index -= Math.floor(this.spriteSheet.width / this.frameWidth);
            vindex++;
        }
        var locX = x;
        var locY = y;
        var offset = vindex === 0 ? this.startX : 0;
        if (this.rotatedCache) {
            ctx.drawImage(this.rotatedCache[index], locX, locY);
        } else {
            ctx.drawImage(this.spriteSheet,
                index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                this.frameWidth, this.frameHeight,
                locX, locY,
                this.frameWidth * scaleBy,
                this.frameHeight * scaleBy);
        }
    }
    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }
    isDone() {
        return (this.elapsedTime >= this.totalTime);
    }
}

PlayerCharacterAMDownloads(AM);
MapAMDownloads(AM);

AM.queueDownload(SCORE_TEXT);
AM.queueDownload(START_BUTTON);

AM.downloadAll(function () {
    let canvas = document.getElementById("gameWorld");
    let ctx = canvas.getContext("2d");
    let gameEngine = new GameEngine(AM);
    gameEngine.init(ctx);
    SCENE_MANAGER.game = gameEngine;
    // console.log(gameEngine);
    // console.log(sceneManager);
    SCENE_MANAGER.gameScene();
    // sceneManager.gameOverScene();
    // console.log(sceneManager);
    // let background = new Background(gameEngine, AM);
    // let mapHeight = background.spritesheet.height;
    // let playerCharacter = new PlayerCharacter(gameEngine, AM);
    // let musicManager = new MusicManager(document.getElementById("soundTrack"));
    // gameEngine.initCamera(mapHeight, musicManager, playerCharacter);//we don't have game.mapHeight until here

    // gameEngine.addEntity(background);
    // genWalls(gameEngine, AM);
    // gameEngine.floor = new Floor(gameEngine, AM);
    // gameEngine.addEntity(gameEngine.floor);
    // genGenforms(20, gameEngine, AM, mapHeight);
    // playerCharacter.x = lowestGenformCoords[0];
    // playerCharacter.y = lowestGenformCoords[1] - 64;
    
    // gameEngine.addEntity(playerCharacter); 
    
    // let startButton = new StartButton(gameEngine, AM);
    // gameEngine.addEntity(startButton); 
    // gameEngine.draw();
    // let score = new Score(gameEngine, AM, playerCharacter);
    // gameEngine.addEntity(score);
    console.log("All Done!");
});