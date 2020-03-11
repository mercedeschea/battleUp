const GLOOP_SHEET_PATHS_GREEN = {
    'turning':"./Sprites/Usables/gloop(green)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(green)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(green)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(green)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(green)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(green)/gloop.png",
    'turning':"./Sprites/Usables/gloop(green)/gloopTurn.png"};
const GLOOP_SHEET_PATHS_PURPLE = {
    'turning':"./Sprites/Usables/gloop(purple)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(purple)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(purple)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(purple)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(purple)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(purple)/gloop.png",
    'turning':"./Sprites/Usables/gloop(purple)/gloopTurn.png"};
const GLOOP_SHEET_PATHS_BLUE = {
    'turning':"./Sprites/Usables/gloop(blue)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(blue)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(blue)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(blue)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(blue)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(blue)/gloop.png",
    'turning':"./Sprites/Usables/gloop(blue)/gloopTurn.png"};
const GLOOP_SHEET_PATHS_ORANGE = {
    'turning':"./Sprites/Usables/gloop(orange)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(orange)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(orange)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(orange)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(orange)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(orange)/gloop.png",
    'turning':"./Sprites/Usables/gloop(orange)/gloopTurn.png"};
const GLOOP_SHEET_PATHS = {'green':GLOOP_SHEET_PATHS_GREEN, 'purple':GLOOP_SHEET_PATHS_PURPLE,
                           'blue':GLOOP_SHEET_PATHS_BLUE, 'orange':GLOOP_SHEET_PATHS_ORANGE};
const DRILL_PROTO = "./Sprites/Usables/items/drillPrototype.png"
const PLACEFORM_LIMIT = 6;
const PLAYER_RADIUS = 25;
const PLAYER_SCALE = PLAYER_RADIUS / 32; //32 is og radius determined by sprite sheet size
const X_CENTER = 32.5;
const Y_CENTER = 36.5;
const PLAYER_SPEED = 200;
const SUPER_ATTACK_HEIGHT = 500;
const DRILL_LENGTH = 47;
const COOKIES_FOR_SUPER = 3;
const COOKIE_SPEED = 10;
// const GOD_MODE = true;//not implemented, use glitch jumps for now
const GOD_MODE = false;

function PlayerCharacterAMDownloads(AM) {
    for (const key of Object.keys(GLOOP_SHEET_PATHS_GREEN)) {
        AM.queueDownload(GLOOP_SHEET_PATHS_GREEN[key]);
    }
    for (const key of Object.keys(GLOOP_SHEET_PATHS_PURPLE)) {
        AM.queueDownload(GLOOP_SHEET_PATHS_PURPLE[key]);
    }
    for (const key of Object.keys(GLOOP_SHEET_PATHS_BLUE)) {
        AM.queueDownload(GLOOP_SHEET_PATHS_BLUE[key]);
    }
    for (const key of Object.keys(GLOOP_SHEET_PATHS_ORANGE)) {
        AM.queueDownload(GLOOP_SHEET_PATHS_ORANGE[key]);
    }
    AM.queueDownload(DRILL_PROTO);
}

class PlayerCharacter extends Entity {
    constructor(game, AM, gloopSheetPath, external) {
        // super(self, game, 0, 0);
        super(game, 0, 0);

        this.game = game;
        this.ctx = game.ctx;
        this.placeformManager = new PlaceformManager(game, AM, PLACEFORM_LIMIT);
        if (this.game.gloopColor)
            this.placeformManager.setColor(this.game.gloopColor);
        this.gloopSheetPath = gloopSheetPath;

        //Collision
        this.wasColliding = false; 
        this.colliding = false;
        this.collidingLeft = false;
        this.collidingRight = false;
        this.collidingTopLeft = false;
        this.collidingTopRight = false;
        this.collidingBotLeft = false;
        this.collidingBotRight = false;
        this.collidingTop = false;
        this.radius = PLAYER_RADIUS;
        this.setupAnimations(gloopSheetPath);

        // Movement
        this.facingLeft = false;
        this.facingRight = true;
        this.speed = PLAYER_SPEED;
        this.normalSpeed = PLAYER_SPEED;
        this.fallSpeed = 200;
        this.jumping = false;
        this.jumpY = this.y;

        // Extras
        this.attackDelay = 0;
        this.attacking = false;
        this.attackingSuper = 0;//can be 0(off), 1(extending), 2(spinning);
        this.attackpoint = null;

        this.floorTimer = 0;
        this.dead = false;

        this.cookies = 0;
        this.totalCookies = 0;

        this.placedTwoAgo = null;
        this.placedOneAgo = null;
        this.placedZeroAgo = null;
        this.slow = false;
        this.slowdownTime = null;
        this.external = external;
    }
    
    setupAnimations(gloopSheetPath) {
        this.moveLeftAnimation = new Animation(AM.getAsset(gloopSheetPath.hopLeft), 0, 0, 64, 68, 0.15, 4, true, true);
        this.moveRightAnimation = new Animation(AM.getAsset(gloopSheetPath.hopRight), 0, 0, 64, 68, 0.15, 4, true, true);
        this.lookForwardAnimation = new Animation(AM.getAsset(gloopSheetPath.lookForward), 0, 0, 64, 68, 1, 1, true, true);
        this.jumpLeftAnimation = new Animation(AM.getAsset(gloopSheetPath.turning), 65, 0, 64, 64, 1, 1, false, true);
        this.jumpRightAnimation = new Animation(AM.getAsset(gloopSheetPath.turning), 193, 0, 64, 64, 1, 1, false, true);
        this.deadAnimation = new Animation(AM.getAsset(gloopSheetPath.dead), 0, 0, 64, 68, 1, 1, false, true);
        this.sadAnimation = new Animation(AM.getAsset(gloopSheetPath.sad), 0, 0, 64, 68, 1, 1, false, true);
        // this.attackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, .12, 2, false, false);
        // this.reverseAttackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, 0.1, 3, false, true);
        let attackCaches = this.buildAttackCache();
        this.attackCache = attackCaches.cache;
        this.superAttackCache = attackCaches.superCache;
        this.currentAttackAnimation = this.attackCache['right'];

    }

    update() {
        super.update();
        this.checkCollisions();

        this.handleDeath();
        
        if (this.isSupported() && !this.wasColliding && this.jumping) {
            this.stopJumping();
        }
        if ((this.collidingTop || this.collidingTopLeft || this.collidingTopRight) && this.jumping) {
            this.stopJumping();
        }
        // gravity
        if (!this.jumping && !this.isSupported() && !this.external) {
            this.y += this.fallSpeed * this.game.clockTick;
        }

        this.handleLeftRightMovement();
        
        this.handleJumping();
        
        this.placePlatforms(); 

        this.checkSlowdown();

        this.handleAttacking();

        this.clearOutPlaceforms();
    }
    externalUpdate(gameState) {
        // console.log(gameState);
        let props = Object.keys(gameState.input.player);
        for (const key of props) {
            if (key === 'placeformsCurrent') {
                continue;
            } else {
                this[key] = gameState.input.player[key];
            }
        }
        this.placeformManager.replaceResources(gameState.input.player.placeformsCurrent);
        this.placeformManager.placeformsCurrent = gameState.input.player.placeformsCurrent;
        // console.log(this);
    }

    
    packageToSend() {
        let placeformsCurrent = this.placeformManager.getStrippedPlaceforms();
        if(Date.now() % 10000 < 10) {
            // console.log(placeformsCurrent);
        }

        let gameState = {game:{left:this.game.left, right:this.game.right, clockTick:this.game.clockTick},
            player:{jumping:this.jumping, facingLeft:this.facingLeft, attackingSuper:this.attackingSuper, facingRight:this.facingRight,
                 jumpY:this.jumpY, x:this.x, y:this.y, placeformsCurrent:placeformsCurrent, dead:this.dead}};
        return gameState;
    }
    

    calcJump(jumpAnimation, totalHeight) {
        var jumpDistance = jumpAnimation.elapsedTime / jumpAnimation.totalTime;
        // var totalHeight = 100;
        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;
        this.height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.jumpY - this.height;
    }

    draw(ctx) {
        let drawY;
        if (this.game.camera) {
            drawY = this.cameraTransform(); 
            // drawY += PLAYER_SCALE * 68 / 2;
        } else {
            drawY = this.y;
        }
    //this  is where we get transformed coordinates, drawY will be null if player is off screen
        if (this.dead) {
            // console.log(this.deadAnimation);
            this.deadAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY, PLAYER_SCALE);
            return;
        } else if (this.jumping && this.facingLeft) {
            this.jumpLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY, PLAYER_SCALE);
        } else if (this.jumping && !this.facingLeft) {
            this.jumpRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY, PLAYER_SCALE);
        } else if (this.movingLeft) {
            this.moveLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY, PLAYER_SCALE);
        } else if (this.movingRight) {
            this.moveRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY, PLAYER_SCALE);
        } else if (this.game.scene !== 'start'){
            this.lookForwardAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY, PLAYER_SCALE);
        } else if (this.game.scene === 'start') {
             // } else if (this.game.scene === 'start') {
            this.lookForwardAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY, 1);
        }
        if (this.attacking) {
            this.currentAttackAnimation['animation'].drawFrame
                (this.game.clockTick, this.ctx, this.x + this.currentAttackAnimation.xOffset,
                    drawY + this.currentAttackAnimation.yOffset);
        }
        if (this.superAttacking === 1) {
            this.superAttackY = this.y - SUPER_ATTACK_HEIGHT;
            Object.keys(this.attackCache).forEach((direction) => {
                let xO = this.attackCache[direction].xOffset;
                let yO = this.attackCache[direction].yOffset;
                // let xO = -2 * this.radius;
                // let yO = -2 * this.radius;
                let curAnimation = this.attackCache[direction].animation;
                curAnimation.drawFrame(this.game.clockTick, this.ctx, this.x+xO, drawY+yO);
                if(this.attackCache[direction].animation.elapsedTime > 
                    this.attackCache[direction].animation.totalTime - curAnimation.totalTime/curAnimation.frames) { //stop one frame early
                    this.attackCache[direction].animation.elapsedTime = 0;
                    this.superAttacking = 2;
                }
            });
        } else if (this.superAttacking === 2) {
            Object.keys(this.superAttackCache).forEach((direction) => {
                let currentFrame = this.superAttackCache[direction].animation.currentFrame();
                let xO = this.superAttackCache[direction].xOffset[currentFrame];
                let yO = this.superAttackCache[direction].yOffset[currentFrame];
                this.superAttackCache[direction].animation.drawFrame(this.game.clockTick, this.ctx, this.x+xO, drawY+yO);
                if (this.y < this.superAttackY) {
                    this.superAttacking = 0;
                    this.superAttackCache[direction].animation.elapsedTime = 0;
                }
            });
        }
        if (this.external) {
            // console.log(this.placeformManager.placeformsCurrent);
        }
        if (this.external && Date.now() % 1000 < 10) {
            // console.log(this.placeformManager.placeformsCurrent);
        }
        this.placeformManager.draw();
        
    }

    stopSuperAttack () {
        Object.keys(this.superAttackCache).forEach((direction) => {
            this.superAttacking = 0;
            this.superAttackCache[direction].animation.elapsedTime = 0;
        });
    }

    isSupported() {
        return this.colliding || this.collidingBotLeft || this.collidingBotRight;
    }

    checkCollisions() {
        this.wasColliding = false;
        if (this.isSupported()) {
            this.wasColliding = true;
        }
        this.colliding = false;
        this.collidingLeft = false;
        this.collidingRight = false;
        this.collidingTop = false;
        this.collidingTopRight = false;
        this.collidingTopLeft = false;
        this.collidingBotLeft = false;
        this.collidingBotRight = false;

        isCharacterColliding(this);
    }

    handleDeath() {
        if (this.dead) {
            // console.log(this.y);
            if (this.game.active) {
                this.game.active = false;
                this.jumpY = this.y;
                this.deadAnimation.elapsedTime = 0;
            }
            if (this.deadAnimation.isDone()) {
                this.game.over = true;
            }
            if (this.game.floor)
                this.calcJump(this.deadAnimation, 100);
            else
                this.calcJump(this.deadAnimation, 100 + FLOOR_HEIGHT);
            return;
        }
    }

    handleLeftRightMovement() {
        this.normalSpeed = PLAYER_SPEED + COOKIE_SPEED * this.cookies;
        if (!this.slow)
            this.speed = this.normalSpeed;

        this.movingLeft = false;
        this.movingRight = false;
        if (this.game.left) {
            this.movingLeft = true;
            this.facingLeft = true;
            this.facingRight = false;
        }
        else if (this.game.right) {
            this.movingRight = true;
            this.facingRight = true;
            this.facingLeft = false;
        }
        if (this.movingLeft && !this.collidingLeft) {
            if (this.x > 0) {
                if (this.collidingBotLeft && !(this.collidingTopLeft || this.collidingTop)) {
                    this.x -= this.game.clockTick * this.speed * Math.sqrt(2)/2;
                    this.y -= this.game.clockTick * this.speed * Math.sqrt(2)/2;
                } else  if (this.collidingBotRight && !(this.colliding)) {
                    this.x -= this.game.clockTick * this.speed * Math.sqrt(2)/2;
                    this.y += this.game.clockTick * this.speed * Math.sqrt(2)/2;
                } else if (!(this.collidingTopLeft) && !(this.collidingBotLeft && this.collidingTop)) {
                    this.x -= this.game.clockTick * this.speed;
                }
            }
            
        } else if (this.movingRight && !this.collidingRight) {
            if (this.x < this.game.surfaceWidth - this.radius * 2) {  // stops character at the right border
                if (this.collidingBotLeft && !(this.colliding || this.collidingBotRight)) {
                    this.x += this.game.clockTick * this.speed * Math.sqrt(2)/2;
                    // this.y = this.x * platformSlope + platformB - PLATFORM_HEIGHT - Math.sqrt(2)/2;
                    this.y += this.game.clockTick * this.speed * Math.sqrt(2)/2;
                } else  if (this.collidingBotRight && !(this.collidingTopRight || this.collidingTop)) {
                    this.x += this.game.clockTick * this.speed * Math.sqrt(2)/2;
                    this.y -= this.game.clockTick * this.speed * Math.sqrt(2)/2;
                    // this.y = this.x * platformSlope + platformB + PLATFORM_HEIGHT + Math.sqrt(2)/2;
                } else if (!(this.collidingTopRight) && !(this.collidingBotRight && this.collidingTop)) {
                    this.x += this.game.clockTick * this.speed;
                }
            }
        }
    }

    handleJumping() {
        if (this.game.jump && !this.jumping && this.isSupported()) {
            this.jumping = true;
            this.jumpY = this.y;
            new Audio("./Music/jump.wav").play();
        }
        if (this.jumping) {
            let jumpAnimation = this.facingLeft ? this.jumpLeftAnimation : this.jumpRightAnimation;
            if (this.jumpLeftAnimation.isDone()) {
                this.stopJumping();
            }

            if (this.jumpRightAnimation.isDone()) {
                this.stopJumping();
            }

            if (this.jumpLeftAnimation.elapsedTime > this.jumpRightAnimation.elapsedTime) {
                this.jumpRightAnimation.elapsedTime = this.jumpLeftAnimation.elapsedTime;
            }

            if (this.jumpRightAnimation.elapsedTime > this.jumpLeftAnimation.elapsedTime) {
                this.jumpLeftAnimation.elapsedTime = this.jumpRightAnimation.elapsedTime;
            }
            this.calcJump(jumpAnimation, 100);
        }
    }

    stopJumping() {
        this.jumping = false;
        this.jumpRightAnimation.elapsedTime = 0;        
        this.jumpLeftAnimation.elapsedTime = 0;        
    }

    placePlatforms() {
        if (this.game.placeAngledLeft && this.isSupported()) {
            this.placed = true;
            this.placeformManager.placeformPlace(true, true, this.x, this.y, 
                this.moveLeftAnimation.frameWidth * PLAYER_SCALE, this.moveLeftAnimation.frameHeight * PLAYER_SCALE);
            this.savePlaceformHistory('aLeft');
            this.setSlowdown();
        } else if (this.game.placeAngledRight && this.isSupported()) {
            this.placed = true;
            this.placeformManager.placeformPlace(false, true, this.x, this.y, 
                this.moveLeftAnimation.frameWidth * PLAYER_SCALE, this.moveLeftAnimation.frameHeight * PLAYER_SCALE);
            this.savePlaceformHistory('aRight');
            this.setSlowdown();
        } else if (this.game.placeFlatLeft && this.isSupported()) {
            this.placed = true;
            this.placeformManager.placeformPlace(true, false, this.x, this.y, 
                this.moveLeftAnimation.frameWidth * PLAYER_SCALE, this.moveLeftAnimation.frameHeight * PLAYER_SCALE);
            this.savePlaceformHistory('fLeft');
            this.setSlowdown();
        } else if (this.game.placeFlatRight && this.isSupported()) {
            this.placed = true;
            this.placeformManager.placeformPlace(false, false, this.x, this.y, 
                this.moveLeftAnimation.frameWidth * PLAYER_SCALE, this.moveLeftAnimation.frameHeight * PLAYER_SCALE);
            this.savePlaceformHistory('fRight');
            this.setSlowdown();
        }
        if (this.game.removePlatforms) {
            this.placeformManager.clearPlaceforms();
        }
    }

    savePlaceformHistory(newForm) {
        this.placedTwoAgo = this.placedOneAgo;
        this.placedOneAgo = this.placedZeroAgo;
        this.placedZeroAgo = newForm;
    }
    clearPlaceFormHistory() {
        this.placedZeroAgo = this.placedOneAgo;
        this.placedOneAgo = null;
        this.placedTwoAgo = null;
    }
    slowdown() {
        this.speed = 100;
        this.slow = true;
        this.slowdownTime = Date.now();
    }
    setSlowdown() {
        if (this.placedZeroAgo && this.placedZeroAgo === this.placedOneAgo && this.placedZeroAgo === this.placedTwoAgo) 
            this.slowdown();
    }
    checkSlowdown() {
        // reset memory of what your last placeform was everytime you stand on a flat platform
        if (this.colliding)
            this.clearPlaceFormHistory();
        // slowdown only lasts 1 second
        if (Date.now() > 1000 + this.slowdownTime) {
            this.stopSlowdown();
        }
    }
    stopSlowdown() {
        this.speed = this.normalSpeed;
        this.slow = false;
    }

    handleAttacking() {
        if (this.attackDelay > 0)
            this.attackDelay--;
        // if (this.game.attack && this.attackDelay <= 0) {
        //     this.attackDelay = 50;
        //     this.attacking = true;
        //     this.currentAttackAnimation = this.attackAnimation;
        // }
        if (this.game.attack && this.attackDelay <= 0) {
            this.attackDelay = 50;
            this.attacking = true;
            if (this.game.up && this.game.right) {
                this.currentAttackAnimation = this.attackCache.upRight;
            } else if (this.game.up && this.game.left) {
                this.currentAttackAnimation = this.attackCache.upLeft;
            } else if (this.game.down && this.game.left) {
                this.currentAttackAnimation = this.attackCache.downLeft;
            } else if (this.game.down && this.game.right) {
                this.currentAttackAnimation = this.attackCache.downRight;
            } else if (this.game.up) {
                this.currentAttackAnimation = this.attackCache.up;
            } else if (this.game.down) {
                this.currentAttackAnimation = this.attackCache.down;
            } else if (this.game.left) {
                this.currentAttackAnimation = this.attackCache.left;
            } else if (this.game.right) {
                this.currentAttackAnimation = this.attackCache.right;
            }
        } else if (this.game.attackSuper && this.cookies >= COOKIES_FOR_SUPER) {
            this.cookies -= COOKIES_FOR_SUPER;
            this.superAttacking = 1;
        }
        if (this.attacking) {
            if (this.currentAttackAnimation.animation.isDone()) {
                this.currentAttackAnimation.animation.elapsedTime = 0;
                this.attacking = false;
            }
            // if (this.currentAttackAnimation === 
            //     this.attackAnimation && this.currentAttackAnimation.isDone()) {
            //     this.attackAnimation.elapsedTime = 0;
            //     this.currentAttackAnimation = this.reverseAttackAnimation;
            // } else if (this.currentAttackAnimation === 
            //     this.reverseAttackAnimation && this.currentAttackAnimation.isDone()) {
            //     this.reverseAttackAnimation.elapsedTime = 0;
            //     this.attacking = false;
            // }
        }
        if (this.superAttacking > 0) {
            this.y -= this.game.clockTick * this.speed * 2;
        }
    }

    clearOutPlaceforms() {
        // let placeformTypes = Object.keys(this.placeformManager.placeformsCurrent);
        // for (const key of placeformTypes) {
            // for (let i = 0; i < this.placeformManager.placeformsCurrent[key].length; i++) {
                // if (this.placeformManager.placeformsCurrent[key][i].removeFromWorld) {
                //     this.placeformManager.placeformsCurrent[key].splice(i, 1);
                // }
        for (let i = 0; i < this.placeformManager.placeformsCurrent.length; i++) {
            if (this.placeformManager.placeformsCurrent[i].removeFromWorld) {
                this.placeformManager.placeformsCurrent.splice(i, 1);
            }
        }
    }

    collectCookie() {
        ++this.cookies;
        ++this.totalCookies;
    }

    buildAttackCache(){
        const cache = {};
        const superCache = {};
        let xO = -2 * this.radius;//offsets to center character
        let yO = -2 * this.radius + 5;//manual adjustment for dead pixels(i think)
        const directions = ['right', 'upRight', 'up', 'upLeft', 'left', 'downLeft', 'down', 'downRight'];
        for (let j = 0; j < directions.length; j++) {
            let rotatedImages = [];
            let superRotatedImages = [];
            let angle = -j * Math.PI/4;
            let i;
            let newCanvas;
            for (i = 0; i < 3; i++) {
                newCanvas = this.rotateAndCache(AM.getAsset(DRILL_PROTO), angle, 63 * i, 0, 63, 47, 1);
                rotatedImages.push(newCanvas);
            }
            superCache[directions[j]] = {};
            superCache[directions[j]].xOffset = [];
            superCache[directions[j]].yOffset = [];
            let spinFrames = 3;
            for (let k = 0; k < spinFrames; k++) {
                let curAngle = angle + (Math.PI/12) * k;
                superRotatedImages.push(this.rotateAndCache(AM.getAsset(DRILL_PROTO), curAngle, 63 * 2, 0, 63, 47, 1));
                superCache[directions[j]].xOffset.push(xO + Math.cos(curAngle) * this.radius * 4);
                superCache[directions[j]].yOffset.push(yO + Math.sin(curAngle) * this.radius * 4);
            }
            superCache[directions[j]].animation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, .12, spinFrames, true, false, superRotatedImages);
            superCache[directions[j]].angle = angle;
            cache[directions[j]] = {animation:new Animation(AM.getAsset(DRILL_PROTO),
                0, 0, 63, 47, .12, 3, false, false, rotatedImages)};
            cache[directions[j]].angle = angle;
            //calculates gloops edge
            cache[directions[j]].xOffset = xO + Math.cos(angle) * this.radius * 3;
            cache[directions[j]].yOffset = yO + Math.sin(angle) * this.radius * 3;
            
            //calculates the point of the end of the current attack animation frame
            cache[directions[j]].xCalcAttack = (framesUntilDone) => {
                return cache[directions[j]].xOffset - 5 + this.radius * (3 - framesUntilDone * Math.cos(angle))};
            cache[directions[j]].yCalcAttack = (framesUntilDone) => {
                return cache[directions[j]].yOffset - 5 + this.radius * (3 - framesUntilDone * Math.sin(angle))};
                    
        }
        return {cache:cache, superCache:superCache};
    }

    newScene() {
        this.stopJumping();
    }

}