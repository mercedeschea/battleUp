var AM = new AssetManager();
var genformPath = './Sprites/Level_0_genform_spritesheet.png';
var placeformPath = './Sprites/Level_0_placeform_spritesheet.png';


class Animation {
    constructor(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
        this.spriteSheet = spriteSheet;
        this.frameWidth = frameWidth;
        this.frameDuration = frameDuration;
        this.frameHeight = frameHeight;
        this.sheetWidth = sheetWidth;
        this.frames = frames;
        this.totalTime = frameDuration * frames;
        this.elapsedTime = 0;
        this.loop = loop;
        this.scale = scale;
    }
    drawFrame(tick, ctx, x, y) {
        this.elapsedTime += tick;
        if (this.isDone()) {
            if (this.loop)
                this.elapsedTime = 0;
        }
        var frame = this.currentFrame();
        var xIndex = 0;
        var yIndex = 0;
        xIndex = frame % this.sheetWidth;
        yIndex = Math.floor(frame / this.sheetWidth);
        ctx.drawImage(this.spriteSheet, xIndex * this.frameWidth, yIndex * this.frameHeight, // source from sheet
            this.frameWidth, this.frameHeight, x, y, this.frameWidth * this.scale, this.frameHeight * this.scale);
    }
    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }
    isDone() {
        return (this.elapsedTime >= this.totalTime);
    }
}

// no inheritance
class Background {
    constructor(game, spritesheet) {
        this.x = 0;
        this.y = 0;
        this.spritesheet = spritesheet;
        this.game = game;
        this.ctx = game.ctx;
    }
    draw() {
        this.ctx.drawImage(this.spritesheet, this.x, this.y);
    }
    update() {
    }
};

class MushroomDude {
    constructor(game, spritesheet, placeformManager) {
        this.animation = new Animation(spritesheet, 189, 230, 5, 0.10, 14, true, 1);
        this.x = 0;
        this.y = 0;
        this.speed = 100;
        this.game = game;
        this.ctx = game.ctx;
        this.placeformManager = placeformManager;
    }
    draw() {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        this.placeformManager.placeformsDraw();
    }
    update() {
        if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14) {
            this.x += this.game.clockTick * this.speed;
        }
        if (this.game.key1) {
            this.placeformPlace('center', this.x + this.animation.frameWidth, this.y + this.animation.frameHeight);
            console.log(this.placeformManager);
        } else if (this.game.key2) {
            if (true) {
                this.placeformPlace('right', this.x + this.animation.frameWidth, this.y  + this.animation.frameHeight);
            } else {
                this.placeformPlace('left', this.x - 87, this.y);
            }
        }
        if (this.x > 800) this.x = -230;
    }
    //'right' for /, 'center' for __, 'left' for \
    placeformPlace(type, destX, destY) {
        this.placeformManager.placeformPlace(type, destX, destY);
    }
    
}


AM.queueDownload("./img/RobotUnicorn.png");
AM.queueDownload("./img/guy.jpg");
AM.queueDownload("./img/mushroomdude.png");
AM.queueDownload("./img/runningcat.png");
AM.queueDownload("./img/background.jpg");
AM.queueDownload("./Sprites/GloopGlop_full_turn.png");
AM.queueDownload(genformPath);
AM.queueDownload(placeformPath);

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    gameEngine.addEntity(new MushroomDude(gameEngine, AM.getAsset("./img/mushroomdude.png"), new PlaceformManager(gameEngine, AM, 6)));
    // gameEngine.addEntity(new Cheetah(gameEngine, AM.getAsset("./img/runningcat.png")));
    // gameEngine.addEntity(new Guy(gameEngine, AM.getAsset("./img/guy.jpg")));
    // gameEngine.addEntity(new PlayerCharacter(gameEngine, AM.getAsset(PLAYER_CHARACTER_PATH)));
    genGenforms(5, gameEngine, AM);
    console.log("All Done!");
});