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
let GE_COUNT = 0;
//change this to change scroll speed
const SCROLL_SPEED = 50;
//change this to change time before map starts scrolling.
const SCROLL_DELAY = 100000;
const SCROLL_POINT = 100;

class GameEngine {
    constructor(musicManager) {
        GE_COUNT++;
        console.log(GE_COUNT, 'never more than 1');
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
        this.gloopColor = null;
        this.selectGloop = false;
        this.mouseStart = false;
        this.mouseDown = false;
        this.click = false;
        this.mouse = null;
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
        
        let canvas = document.getElementById("gameWorld");
        function getMousePos(canvas, e) {
            let rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }
        };
        this.ctx.canvas.addEventListener("click", function (e) {
            that.mouse = getMousePos(canvas, e);
            // console.log(that.mouse);
            that.click = true;
            this.gloopStartSize = 64;
            this.spacing = 50;
            // 55 is the dist of the floor on start screen
            this.minMouseY = that.surfaceHeight - 55 - this.gloopStartSize; 
            this.maxMouseY = that.surfaceWidth - 55;
            // mouse hover for green gloop
            if (that.scene === 'start' && 
                that.mouse.x >= (that.surfaceWidth - (that.surfaceWidth/2) - (this.gloopStartSize * 2) - (this.spacing + this.spacing*2)) && 
                that.mouse.x < (that.surfaceWidth - (that.surfaceWidth/2) - this.gloopStartSize - this.spacing - this.spacing*2) &&
                that.mouse.y >= this.minMouseY &&
                that.mouse.y < this.maxMouseY) {
                    that.gloopColor = 'greenSelected';
                    console.log(that.gloopColor);
                    that.mouseStart = false;
            } // mouse hover for purple gloop
            if (that.scene === 'start' && 
                that.mouse.x >= that.surfaceWidth - (that.surfaceWidth/2) - this.gloopStartSize - this.spacing && 
                that.mouse.x < that.surfaceWidth - (that.surfaceWidth/2) - this.spacing &&
                that.mouse.y >= this.minMouseY &&
                that.mouse.y < this.maxMouseY) {
                    that.gloopColor = 'purpleSelected';
                    that.mouseStart = false;
            } // mouse hover for orange gloop
            if (that.scene === 'start' &&
                that.mouse.x >= that.surfaceWidth - (that.surfaceWidth/2) + this.spacing &&
                that.mouse.x < that.surfaceWidth - (that.surfaceWidth/2) + this.spacing + this.gloopStartSize &&
                that.mouse.y >= this.minMouseY &&
                that.mouse.y < this.maxMouseY) {
                    that.gloopColor = 'orangeSelected';
                    that.mouseStart = false;
            } // mouse hover for blue gloop
            if (that.scene === 'start' &&
                that.mouse.x >= that.surfaceWidth - (that.surfaceWidth/2) + this.spacing + this.gloopStartSize + this.spacing*2 &&
                that.mouse.x < that.surfaceWidth - (that.surfaceWidth/2) + this.spacing + 64 + this.spacing*2 + this.gloopStartSize &&
                that.mouse.y >= this.minMouseY &&
                that.mouse.y < this.maxMouseY) {
                    that.gloopColor = 'blueSelected';
                    that.mouseStart = false;
            } // gloop color null unless gloop is selected
            if (that.scene === 'start' && !that.started && that.selectGloop && that.mouseStart) {
                that.active = true;
                if (that.gloopColor === 'greenSelected') {
                    console.log(that.mouse);
                    SCENE_MANAGER.gameScene(GLOOP_SHEET_PATHS_GREEN);
                }
                else if (that.gloopColor === 'purpleSelected') {
                    console.log(that.mouse);
                    SCENE_MANAGER.gameScene(GLOOP_SHEET_PATHS_PURPLE);
                }
                else if (that.gloopColor === 'orangeSelected') {
                    console.log(that.mouse);
                    SCENE_MANAGER.gameScene(GLOOP_SHEET_PATHS_ORANGE);
                } else if (that.gloopColor === 'blueSelected') {
                    console.log(that.mouse);
                    SCENE_MANAGER.gameScene(GLOOP_SHEET_PATHS_BLUE);
                }
                that.start();
            } 
            else if (that.scene === 'gameOver' && that.over){
                SCENE_MANAGER.startScene();
            }
            if (!that.started) {
                that.draw();      
            }
            console.log(that.gloopColor);
        }, false);
        this.ctx.canvas.addEventListener("mousemove", function (e) {
            that.mouse = {x: e.clientX, y: e.clientY}
            this.startButtonWidth = 70;
            this.startButtonHeight = 33;
            console.log(that.mouse);
            console.log(that.surfaceWidth/2 - this.startButtonWidth/2);
            console.log(that.surfaceWidth/2 - this.startButtonWidth/2 + this.startButtonWidth);
            console.log(that.surfaceHeight - 46);
            console.log(that.surfaceHeight - 46 + this.startButtonHeight);
            // used for mouse hover on start button
            if (that.scene === 'start' &&
                that.mouse.x >= that.surfaceWidth/2 - this.startButtonWidth/2 && 
                that.mouse.x < that.surfaceWidth/2 - this.startButtonWidth/2 + this.startButtonWidth &&
                that.mouse.y >= that.surfaceHeight - 46 && 
                that.mouse.y < that.surfaceHeight - 46 + this.startButtonHeight) {
                    that.mouseStart = true;
                    console.log('logging mouse start state', that.mouseStart)
            }
        }, false);
        this.ctx.canvas.addEventListener("mouseup", function (e) {
            that.mouseDown = false;
            if (that.gloopColor !== null) {
                that.selectGloop = true;
            }
        }, false);
        this.ctx.canvas.addEventListener("mousedown", function (e) {
            // that.mouse = {x: e.clientX, y: e.clientY}
            if (!that.started) {
                that.mouseDown = true;
                that.draw();   
            }
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
        // console.log('this is called');
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

    //clears all entities but Gloop and entities stored in the 'top' subarray
    clearAllButGloopAndTop() {
        const entityTypes = Object.keys(this.entities);
        // console.log('before clearing', this.entities);
        for (const type of entityTypes) {
            if(type === 'top') {
                continue;
            }
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
