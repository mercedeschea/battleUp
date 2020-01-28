var AM = new AssetManager();
var genformPath = './Sprites/Level_0_genform_spritesheet.png';
var placeformPath = './Sprites/Level_0_placeform_spritesheet.png';


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
        console.log(this.spriteSheet);
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

const BACKGROUND_PATH = "./img/background.jpg";
class Background {
    constructor(game, AM) {
        this.x = 0;
        this.y = 0;
        this.spritesheet = AM.getAsset(BACKGROUND_PATH);
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

// Each class should have a helper that downloads all their necessary assets.
// For instance Genform class would queueDownload each of the genform assets for each level
// See PlayerCharacter class top function for example!
PlayerCharacterAMDownloads(AM);

AM.queueDownload("./img/RobotUnicorn.png");
AM.queueDownload("./img/guy.jpg");
AM.queueDownload("./img/mushroomdude.png");
AM.queueDownload("./img/runningcat.png");
AM.queueDownload("./img/background.jpg");
AM.queueDownload("./Sprites/GloopGlop_full_turn.png");
AM.queueDownload(genformPath);
AM.queueDownload(placeformPath);
// To be refactored:
AM.queueDownload(genformPath);
AM.queueDownload(BACKGROUND_PATH);

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

    // pass AM to each class so they queue their own downloads and track their own asset paths
    // I have refactored PlayerCharacter and Background, but have not touched the platform entities
    gameEngine.addEntity(new Background(gameEngine, AM));
    gameEngine.addEntity(new PlayerCharacter(gameEngine, AM)); 

    console.log("All Done!");
});