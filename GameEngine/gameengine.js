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
const SCROLL_DELAY = 100000;
const SCROLL_POINT = 100;
const START_BUTTON = "./Sprites/HUD/startButtonPress.png";

class GameEngine {
    constructor(musicManager) {
        this.gamepads = {};
        this.entities = {general:[], genforms:[], placeforms:[], cookies:[], top:[]};
        this.gloops = {};
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
        this.attackSuper = false;
        this.placeAngledLeft = false;
        this.placeAngledRight = false;
        this.removePlatforms = false;
        this.placeFlat = false;
        this.started = false;
        this.clockTick = 0;
        this.floor = null;
        this.active = true;
        this.over = false;
        this.scene = null;//string used in control flow
        this.sceneObj = null; //Object used for drawing
        this.musicManager = musicManager;
        this.selectGloop = null;
    }
    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
        console.log('game initialized');
    }

    //initializes camera, in its own method because the background must be loaded first to determine map height
    initCamera(playerCharacter, startY) {
        if (!this.camera)
            this.camera = new Camera(this, SCROLL_SPEED, startY, playerCharacter);
        else
            this.camera.totalDrawOffset = startY;
    }

    start(startY) {
        console.log("starting game");
        var that = this;
        this.started = true;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    }

    // scangamepads() {
    //     var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    //     for (var i = 0; i < gamepads.length; i++) {
    //       if (gamepads[i]) {
    //         if (gamepads[i].index in this.gamepads) {
    //           this.gamepads[gamepads[i].index] = gamepads[i];
    //         } else {
    //           this.gamepads[i] = (gamepads[i]);
    //         }
    //       }
    //     }
    //     console.log(this.gamepads);
    // }
    startInput() {
        // this.scangamepads();
        const keyArr = {'removePlatforms':'KeyF', 'up':'KeyW', /*'left':'KeyA',*/ 'down':'KeyS', /*'right':'KeyD',*/ 
            'altLeft':'ArrowLeft', 'altRight':'ArrowRight', 'altUp':'ArrowUp',
            'altDown':'ArrowDown', 'placeFlatLeft':'KeyA', 'placeFlatRight':'KeyD', 'placeAngledLeft':'KeyQ', 'placeAngledRight':'KeyE', 'jump':'Space',
            /*'attackLeft':'KeyR', 'attackRight':'Tab', */'attackSuper':'KeyR', 'pause':'KeyP'};
        console.log('Starting input');
        var that = this;
        window.addEventListener("gamepadconnected", function (e) {
            that.gamepads[e.gamepad.index] = e.gamepad;
            console.log(that.gamepads);
        } );
        window.addEventListener("gamepaddisconnected", function (e) {
            delete(that.gamepads[e.gamepad.index]);
        });
        this.showButton = true;
        this.mouseDown = false;
        this.mouseReleased = false;
        this.ctx.canvas.addEventListener("mousedown", function (e) {
            if (!that.started) {
                that.showButton = false;
                that.mouseDown = true;
                that.draw();
                // console.log('mouse down')
                // console.log('mouse down in game engine: ' + that.mouseDown);
            }
        }, false);
        this.ctx.canvas.addEventListener("mouseup", function (e) {
            that.mouseDown = false;
            that.mouseReleased = true;
            if (that.scene === 'start' && !that.started) {
                that.active = true;
                console.log('starting');
                SCENE_MANAGER.gameScene();
                that.start();
            } else  if (that.scene == 'gameOver' && that.over){
                SCENE_MANAGER.startScene();
            }
            else {
                that.musicManager.playPause();
            }
            //console.log('mouse up');
        }, false);
        this.ctx.canvas.addEventListener("", function (e) {
            that.mouse = {x: e.clientX, y: e.clientY}
            // if (that.mouse.x = )
        }, false);
        this.ctx.canvas.addEventListener("keydown", function (e) {
            if (e.code === keyArr['up'] || e.code === keyArr['altUp'])
                that.jump = true;
            if ((e.code === keyArr['jump']) && that.active)
                that.jump = true;
            if ((e.code === keyArr['left'] || e.code === keyArr['altLeft']) && that.active)
                that.left = true;
            /*if (e.code === keyArr[2] || e.code === keyArr[8])
                that.down = true;*/
            if (e.code === keyArr['down'] || e.code === keyArr['altDown'])
                that.down = true;
            if ((e.code === keyArr['right'] || e.code === keyArr['altRight']) && that.active)
                that.right = true;
            if (e.code === keyArr['placeAngledLeft'])
                that.placeAngledLeft = true;
            if (e.code === keyArr['placeAngledRight'])
                that.placeAngledRight = true;
            if (e.code === keyArr['placeFlatLeft'])
                that.placeFlatLeft = true;
            if (e.code === keyArr['placeFlatRight'])
                that.placeFlatRight = true;
            if (e.code === keyArr['removePlatforms'])
                that.removePlatforms = true;
            if (e.code === keyArr['attackSuper'])
                that.attackSuper = true;  
            if (e.code === keyArr['attackRight'] || e.code === keyArr['attackLeft'])
                that.attack = true;
            if (e.code === keyArr['pause'])
                that.started ? that.started = false : that.started = true;    
            e.preventDefault();
        }, false);
        this.ctx.canvas.addEventListener("keyup", function (e) {
            if (e.code === keyArr['up'] || e.code === keyArr['altUp'])
                that.up = false;
            if (e.code === keyArr['left'] || e.code === keyArr['altLeft'])
                that.left = false;
            /*if (e.code === keyArr[2] || e.code === keyArr[8])
                that.down = true;*/
            if (e.code === keyArr['down'] || e.code === keyArr['altDown'])
                that.down = false;
            if (e.code === keyArr['right'] || e.code === keyArr['altRight'])
                that.right = false;
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

    controllerStatus(gamepad) {
        if(gamepad.buttons[0] == 1.0)
            this.jump = true;
        // if(game.buttons[1] == 1.0)
        //     this.attack = true;
        // if (game.buttons[2] == 1.0)
        if(gamepad.axes[0] >= .5) 
            this.down =  true;
        if(gamepad.axes[1] >= .5) 
            this.right =  true;
        if(gamepad.axes[2] >= .5)
            this.up =  true;    
        if(gamepad.axes[3] >= .5) 
            this.left =  true;

    }

    // reload() {
    //     this.camera.totalDrawOffset = this.game.mapHeight - this.game.surfaceHeight;
    //     genGenforms(20, gameEngine, AM, mapHeight);
    //     playerCharacter.x = lowestGenformCoords[0];
    //     playerCharacter.y = lowestGenformCoords[1] - 64;
    //     this.playerCharacter = 
    // }
    //game must be off for this to work
    clearAllEntities() {
        console.log('this is called');
        const entityTypes = Object.keys(this.entities);
        // console.log('before clearing', this.entities);
        for (const type of entityTypes) {
            this.entities[type].splice(0,this.entities[type].length);
        }
        // console.log('after clearing', this.entities);
        const gloopsTypes = Object.keys(this.gloops);

        for (const gloop of gloopsTypes) {
            delete this.gloops[gloop];
        }
  
    }


    clearAllButGloop() {
        const entityTypes = Object.keys(this.entities);
        // console.log('before clearing', this.entities);
        for (const type of entityTypes) {
            for (const ent of this.entities[type]) {
                ent.removeFromWorld = true;
                // console.log(ent);
            }
        }
  
    }

    addEntity(entity, type) {
        // console.log('added entity');
        this.entities[type].push(entity);
        this.moveRight = null;
        this.moveLeft = null;
    }

    addGloop(gloop, color) {
        this.gloops[color] = gloop;
        // console.log(this.gloops[color])
    }

    draw() {
        if (this.camera) {
            this.camera.update();
        }
        this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
        this.ctx.save();
        // console.log(this.sceneObj);
        if (this.sceneObj)
            this.sceneObj.draw();
        let entityTypes = Object.keys(this.entities);
        for (const type of entityTypes) {
            for (var i = 0; i < this.entities[type].length; i++) {
                this.entities[type][i].draw();
            }
        }
        let gloopTypes = Object.keys(this.gloops);
        for (const gloop of gloopTypes) {
            if (gloop) {
                this.gloops[gloop].draw();
            }
            
        }
        this.ctx.restore();
    }

    update() {
        this.sceneObj.update();
        let gloopTypes = Object.keys(this.gloops);
        for (const gloop of gloopTypes) {
            var gloopEntity = this.gloops[gloop];
            if (gloopEntity && !gloopEntity.removeFromWorld) {
                gloopEntity.update();
            }
        }

        // if (this.gamepads[0]) {
        //     this.controllerStatus(this.gamepads[0]);
        // }
        const entityTypes = Object.keys(this.entities);
        for (const  type of entityTypes) {
            const typeCount = this.entities[type].length;
            for (var i = 0; i < typeCount; i++) {
                var entity = this.entities[type][i];
                if (!entity.removeFromWorld) {
                    entity.update();
                }
            }
        }
        
        // cookies.filter((cookie) => {
        //     console.log(cookie);
        //     cookie.removeFromWorld === false;
        // });
        for (const  type of entityTypes) {
            for (var i = this.entities[type].length - 1; i >= 0; --i) {
                if (this.entities[type][i].removeFromWorld) {
                    this.entities[type].splice(i, 1);
                }
            }
        }
        if (this.over) {
            console.log(this.sceneObj);
            if(this.sceneObj)
                SCENE_MANAGER.gameOverScene(this.sceneObj.score); 
            else 
                SCENE_MANAGER.gameOverScene(); 
            // console.log('game is over');
        }
        // console.log(this.timer.gameTime);
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
        this.attackSuper = false;
        this.placeAngledLeft = false;
        this.placeAngledRight = false;
        this.placeFlatLeft = false;
        this.placeFlatRight = false;
        this.removePlatforms = false;
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
    update() {}

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
        // if(drawY > this.game.surfaceHeight + removalTolerance) {
        //     this.removeFromWorld = true;
        //     return null;
        // }
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

    update() {
        //if the player has interacted with the dom, play the music
        if(this.musicManager.activated)
            this.musicManager.currentMusic.play();
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
    constructor(game, speed, startY, playerCharacter) {
        this.game = game;
        this.speed = speed;
        this.totalDrawOffset = startY;
        this.currentDrawOffset = 0;
        this.playerCharacter = playerCharacter;
        this.advanceTime = 0;
        this.advanceFactor = 15;
    }
    draw() {}
    update() {
        //if the player is at the top of the canvas
        // console.log(this);
        // console.log(this.playerCharacter.y - this.totalDrawOffset);
        if (this.playerCharacter.y - this.totalDrawOffset < SCROLL_POINT) {
            this.advanceTime = .5;//set to the amount of seconds you want to scroll the camera for
        }
        if(this.advanceTime > 0) {
            this.currentDrawOffset = this.game.clockTick * this.speed * this.advanceFactor;
            // console.log(this.game.clockTick, 'a tick with this value');
            // console.log(this.advanceTime);
            this.advanceTime -= this.game.clockTick;
            // console.log(this.advanceTime);
        }
        else if(this.game.timer.gameTime > SCROLL_DELAY){
            this.currentDrawOffset = this.game.clockTick * this.speed;
        } else {
            this.currentDrawOffset = 0;
        }
        this.totalDrawOffset -= this.currentDrawOffset;
    }
}