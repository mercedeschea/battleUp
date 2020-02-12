window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
//change this to change scroll speed
const SCROLL_SPEED = 50;
//change this to change time before map starts scrolling.
const SCROLL_DELAY = 100000000000;
const SCROLL_PERCENTAGE = .6;

class GameEngine {
    constructor() {
        this.entities = [];
        this.ctx = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;
        this.mapHeight = null;
        this.down = false;
        this.left = false;
        this.right = false;
        this.up = false;
        this.jump = false;
        this.attack = false;
        this.placeAngled = false;
        this.placeFlat = false;
        this.started = false;
        this.clockTick = 0;
    }
    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
        //console.log(this.timer.gameTime);
        console.log('game initialized');
    }
    //initializes camera, in its own method because the background must be loaded first to determine map height
    initCamera(mapHeight, musicManager, playerCharacter) {
        this.mapHeight = mapHeight;
        this.camera = new Camera(this, SCROLL_SPEED, this.surfaceHeight, mapHeight, musicManager, playerCharacter);
    }
    start() {
        console.log("starting game");
        var that = this;
        this.started = true;
        this.camera.musicManager.activated = true;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    }
    //'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 
    startInput() {
        const keyArr = {'up':'KeyW', 'left':'KeyA', 'down':'KeyS', 'right':'KeyD', 
            'placeFlat':'KeyE', 'placeAngled':'KeyQ', 'jump':'Space',
            'attackLeft':'KeyR', 'attackRight':'Tab', 'pause':'KeyP'};
        console.log('Starting input');
        var that = this;
        this.ctx.canvas.addEventListener("click", function (e) {
            if (!that.started) {
                that.start();
            } else {
                that.camera.musicManager.playPause();
            }
        }, false);
        this.ctx.canvas.addEventListener("keydown", function (e) {
            if (e.code === keyArr['up'])
                that.up = true;
            if (e.code === keyArr['jump'])
                that.jump = true;
            if (e.code === keyArr['left'])
                that.left = true;
            /*if (e.code === keyArr[2] || e.code === keyArr[8])
                that.down = true;*/
            if (e.code === keyArr['down'])
                that.down = true;
            if (e.code === keyArr['right'])
                that.right = true;
            if (e.code === keyArr['placeAngled'])
                that.placeAngled = true;
            if (e.code === keyArr['placeFlat'])
                that.placeFlat = true;   
            if (e.code === keyArr['attackRight'] || e.code === keyArr['attackLeft'])
                that.attack = true;
            if (e.code === keyArr['pause'])
                that.started ? that.started = false : that.started = true;    
            e.preventDefault();
        }, false);

        this.ctx.canvas.addEventListener("keyup", function (e) {
            if (e.code === keyArr['up'])
                that.up = false;
            if (e.code === keyArr['left'])
                that.left = false;
            /*if (e.code === keyArr[2] || e.code === keyArr[8])
                that.down = false;*/
            if (e.code === keyArr['right'])
                that.right = false;
            if (e.code === keyArr['down'])
                that.down = false;
            // if (e.code === keyArr['')
            //     that.placeAngled = false;
            // if (e.code === keyArr[5])
            //     that.placeFlat = false;
            // if (e.code === keyArr[10])
            //     that.attack = false;
            // if (e.code === keyArr[11])
            //     that.attack = false;
            e.preventDefault();
        }, false);
        console.log('Input started');
    }
    addEntity(entity) {
        console.log('added entity');
        this.entities.push(entity);
        this.moveRight = null;
        this.moveLeft = null;
    }
    draw() {
        this.camera.update();
        this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
        this.ctx.save();
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw();
        }
        this.ctx.restore();
    }
    update() {
        var entitiesCount = this.entities.length;
        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];
            if (!entity.removeFromWorld) {
                entity.update();
            }
        }
        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
        //console.log(this.timer.gameTime);
    }
    loop() {
        if (!this.started) {
            return;
        }
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
        this.jump = false; // jump and placements only happen once
        this.attack = false;
        this.placeAngled = false;
        this.placeFlat = false;
        this.up = false;
        this.down = false;
    }
}

class Timer {
    constructor() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.wallLastTimestamp = 0;
    }
    tick() {
        var wallCurrent = Date.now();
        var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
        this.wallLastTimestamp = wallCurrent;
        var gameDelta = Math.min(wallDelta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    }
}

class Entity {
    constructor(scope, game, x, y) { // pretty sure "scope" here should be refactored out, will do later
        this.game = game;
        this.x = x;
        this.y = y;
        this.removeFromWorld = false;
    }
    update() {
    }
    draw() {
        if (this.game.showOutlines && this.radius) {
            this.game.ctx.beginPath();
            this.game.ctx.strokeStyle = "green";
            this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
        }
    }
    //calculates where to draw entity relative to the current camera and returns the offset y coordinate
    //if the entity is more than removalTolerance pixels off the screen, the entity is deleted;
    cameraTransform(removalTolerance, parallaxFactor) {
        let drawY = this.y - this.game.camera.totalDrawOffset;
        if (parallaxFactor) drawY *= parallaxFactor;
        if(drawY > this.game.surfaceHeight + removalTolerance) {
            this.removeFromWorld = true;
            return null;
        }
        return drawY;
    }
    
    rotateAndCache(image, angle, srcX, srcY, frameWidth, frameHeight, scale) {
        var offscreenCanvas = document.createElement('canvas');
        var size = Math.max(image.width, image.height);
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;
        var offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.save();
        offscreenCtx.translate(size / 2, size / 2);
        offscreenCtx.rotate(angle);
        offscreenCtx.translate(0, 0);
        offscreenCtx.drawImage(image, srcX, srcY, frameWidth, frameHeight,
            -(image.width / 2), -(image.height / 2), scale * frameWidth, scale * frameHeight);
        offscreenCtx.restore();
        //offscreenCtx.strokeStyle = "red";
        //offscreenCtx.strokeRect(0,0,size,size);
        return offscreenCanvas;
    }
}

class MusicManager {
    constructor (music) {
        this.currentMusic = music;
        this.activated = false;
    }
    playPause() {
        if(!this.currentMusic.paused) {
            console.log('here');
            this.currentMusic.pause();
            this.activated = false;
        } else {
            this.currentMusic.play();
            this.activated = true;
        }

    }
}

//Records the total offset which we use to calculate drawing platforms and gloop
//Also records the the offset for the current tick which we use to scroll the background
class Camera {
    constructor(game, speed, surfaceHeight, mapHeight, musicManager, playerCharacter) {
        this.game = game;
        this.speed = speed;
        this.totalDrawOffset = mapHeight - surfaceHeight;
        this.currentDrawOffset = 0;
        this.musicManager = musicManager;
        this.playerCharacter = playerCharacter;
        this.advanceTime = 0;//set to the amount of seconds you want to scroll the camera for
        this.advanceFactor = 15;
    }
    draw() {}
    update() {
        //if the player has interacted with the dom, play the music
        if(this.musicManager.activated)
            this.musicManager.currentMusic.play();
        //if the player is at the top of the canvas
        if (this.playerCharacter.y - this.totalDrawOffset < 0) {
            this.advanceTime = .5;
        }
        if(this.advanceTime > 0) {
            this.currentDrawOffset = this.game.clockTick * this.speed * this.advanceFactor;
            console.log(this.game.clockTick, 'a tick with this value');
            console.log(this.advanceTime);
            this.advanceTime -= this.game.clockTick;
            console.log(this.advanceTime);
        }
        else if(this.game.timer.gameTime > SCROLL_DELAY){
            this.currentDrawOffset = this.game.clockTick * this.speed;
        } else {
            this.currentDrawOffset = 0;
        }
        this.totalDrawOffset -= this.currentDrawOffset;
    }
}

class Score {
    constructor(game, AM, PlayerCharacter) {
        this.spriteSheet = AM.getAsset(SCORE_TEXT);
        this.game = game;
        this.scoreTimer = new Timer();
        this.displayScore = 0;
        this.playerCharacter = PlayerCharacter;
        this.currentY = 0;
        this.maxY = 0;
        this.startY = this.game.mapHeight - this.playerCharacter.y;
    }
    draw() {
        this.game.ctx.drawImage(this.spriteSheet, 0, 0,
            this.spriteSheet.width/5, this.spriteSheet.height/5);
        //this.game.ctx.font("Press Start 2P");
        this.game.ctx.font = ("20px Times New Roman");
        this.game.ctx.fillStyle = "gold";
        //console.log(this.playerY);
        this.game.ctx.fillText(this.maxY, this.spriteSheet.width/5 + 50, 20);
        
    }
    update() {
        this.displayScore = this.scoreTimer.tick();
        let formatTime = Math.round(this.scoreTimer.gameTime*100)/100;
        this.currentY = Math.round(((this.game.mapHeight - this.playerCharacter.y - this.startY)* 100)/100);
        if (this.currentY > this.maxY) {
            this.maxY = this.currentY;
        }
        
        // console.log(formatTime);
        //console.log(this.playerCharacter);
    }

    loop() { 
    }
}