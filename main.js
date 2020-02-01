var AM = new AssetManager();
const SCORE_TEXT = "./Sprites/HUD/score_Text.png";

class Animation {
    constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
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
    }
    drawFrame(tick, ctx, x, y, scaleBy) {
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
        ctx.drawImage(this.spriteSheet,
                    index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                    this.frameWidth, this.frameHeight,
                    locX, locY,
                    this.frameWidth * scaleBy,
                    this.frameHeight * scaleBy);
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

AM.downloadAll(function () {
    let canvas = document.getElementById("gameWorld");
    let ctx = canvas.getContext("2d");
    let gameEngine = new GameEngine();
    gameEngine.init(ctx);
    let background = new Background(gameEngine, AM);
    let mapHeight = background.spritesheet.height;
    gameEngine.initCamera(mapHeight, new MusicManager(document.getElementById("soundTrack")));//we don't have game.mapHeight until here

    // gameEngine.start();
    gameEngine.addEntity(background);
    gameEngine.addEntity(new Floor(gameEngine, AM));
    
    genGenforms(20, gameEngine, AM, mapHeight);
    let playerCharacter = new PlayerCharacter(gameEngine, AM);
    let score = new Score(gameEngine, AM, playerCharacter);
    gameEngine.addEntity(playerCharacter); 
    gameEngine.addEntity(score);
    gameEngine.draw();
    ctx.font = '40px Times New Roman';
    ctx.fillStyle = 'gold';
    ctx.textAlign = 'center';
    console.log(canvas.width/2, canvas.height/2);
    ctx.fillText("Click to Start!", canvas.width/2, canvas.height/2); 
    //ctx.drawImage(AM.getAsset("./Sprites/HUD/score_Text.png"), 0, 0, 64, 68,);
    console.log("All Done!");
});