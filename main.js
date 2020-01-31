var AM = new AssetManager();



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


// Each class should have a helper that downloads all their necessary assets.
// For instance Genform class would queueDownload each of the genform assets for each level
// See PlayerCharacter class top function for example!

PlayerCharacterAMDownloads(AM);
MapAMDownloads(AM);

AM.downloadAll(function () {
    let canvas = document.getElementById("gameWorld");
    let ctx = canvas.getContext("2d");
    let gameEngine = new GameEngine();
    gameEngine.init(ctx);
    let background = new Background(gameEngine, AM);
    let mapHeight = background.spritesheet.height;
    gameEngine.initCamera(mapHeight);
    gameEngine.start();
    gameEngine.addEntity(background);
    genGenforms(20, gameEngine, AM, mapHeight);
    gameEngine.addEntity(new PlayerCharacter(gameEngine, AM)); 

    console.log("All Done!");
});