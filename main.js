var AM = new AssetManager();

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
    constructor(game, spritesheet) {
        this.animation = new Animation(spritesheet, 189, 230, 5, 0.10, 14, true, 1);
        this.x = 0;
        this.y = 0;
        this.speed = 100;
        this.game = game;
        this.ctx = game.ctx;
    }
    draw() {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    update() {
        if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
            this.x += this.game.clockTick * this.speed;
        if (this.x > 800)
            this.x = -230;
    }
}

// inheritance 
class Cheetah extends Entity {
    self = this;
    constructor(game, spritesheet) {
        super(self, game, 0, 250);
        this.animation = new Animation(spritesheet, 512, 256, 2, 0.05, 8, true, 0.5);
        this.speed = 350;
        this.ctx = game.ctx;
    }
    update() {
        super.update();
        this.x += this.game.clockTick * this.speed;
        if (this.x > 800)
            this.x = -230;
    }
    draw() {
        super.draw(self);
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
}

// Cheetah.prototype = new Entity();
// Cheetah.prototype.constructor = Cheetah;
// inheritance 
class Guy extends Entity {
    self = this;
    constructor(game, spritesheet) {
        super(self, game, 0, 450);
        this.animation = new Animation(spritesheet, 154, 215, 4, 0.15, 8, true, 0.5);
        //this.animation = new Animation(spritesheet, 154, 215, 1, 0.15, 1, true, 0.5);
        this.moving = false;
        this.speed = 600;
        this.ctx = game.ctx;
        // Entity.call(this, game, 0, 450);
    }
    update() {
        if (this.game.right || this.game.left || this.game.up || this.game.down)
            this.moving = true;
        if (this.moving && this.game.right === true) {
            this.x += this.game.clockTick * 200;
            console.log(this.moving + ' moving state');
            this.moving = false;
            console.log(this.moving + ' moving state');
            //console.log(this.x); 
        }
        if (this.moving && this.game.left === true) {
            this.x -= this.game.clockTick * 200;
            //console.log(this.x);
            this.moving = false;
        }
        if (this.moving && this.game.up === true) {
            this.y -= this.game.clockTick * this.speed;
            //console.log(this.y);
            //this.moving = false;
        }
        if (this.moving && this.game.down === true) {
            this.y += this.game.clockTick * this.speed;
        }
        //console.log(this.y);
        //this.moving = false;
        else {
            this.moving = false;
        }
        // Entity.prototype.update.call(this);
    }
    draw(ctx) {
        super.draw(this);
        //console.log(this.x + " is x" + this.y + " is y");
        if (this.moving) {
            this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
        else {
            this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
        // Entity.prototype.draw.call(this);
    }
}

// Guy.prototype = new Entity();
// Guy.prototype.constructor = Guy;



AM.queueDownload("./img/RobotUnicorn.png");
AM.queueDownload("./img/guy.jpg");
AM.queueDownload("./img/mushroomdude.png");
AM.queueDownload("./img/runningcat.png");
AM.queueDownload("./img/background.jpg");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    gameEngine.addEntity(new MushroomDude(gameEngine, AM.getAsset("./img/mushroomdude.png")));
    gameEngine.addEntity(new Cheetah(gameEngine, AM.getAsset("./img/runningcat.png")));
    gameEngine.addEntity(new Guy(gameEngine, AM.getAsset("./img/guy.jpg")));

    console.log("All Done!");
});