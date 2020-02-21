const GLOOP_SHEET_PATHS_GREEN = {'turning':"./Sprites/Usables/gloop(green)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(green)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(green)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(green)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(green)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(green)/gloop.png",
    'turning':"./Sprites/Usables/gloop(green)/gloopTurn.png"};
const GLOOP_SHEET_PATHS_PURPLE = {'turning':"./Sprites/Usables/gloop(purple)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(purple)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(purple)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(purple)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(purple)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(purple)/gloop.png",
    'turning':"./Sprites/Usables/gloop(purple)/gloopTurn.png"};
const GLOOP_SHEET_PATHS_BLUE = {'turning':"./Sprites/Usables/gloop(blue)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(blue)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(blue)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(blue)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(blue)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(blue)/gloop.png",
    'turning':"./Sprites/Usables/gloop(blue)/gloopTurn.png"};
const GLOOP_SHEET_PATHS_ORANGE = {'turning':"./Sprites/Usables/gloop(orange)/gloopTurn.png",
    'hopLeft':"./Sprites/Usables/gloop(orange)/gloopHopLeft.png",
    'hopRight':"./Sprites/Usables/gloop(orange)/gloopHopRight.png",
    'sad':"./Sprites/Usables/gloop(orange)/gloopFloor.png",
    'dead':"./Sprites/Usables/gloop(orange)/gloopDead.png",
    'lookForward':"./Sprites/Usables/gloop(orange)/gloop.png",
    'turning':"./Sprites/Usables/gloop(orange)/gloopTurn.png"};
const GLOOP_SHEET_PATHS = {'green':GLOOP_SHEET_PATHS_GREEN, 'purple':GLOOP_SHEET_PATHS_PURPLE,
                           'blue':GLOOP_SHEET_PATHS_BLUE, 'orange':GLOOP_SHEET_PATHS_ORANGE};
const DRILL_PROTO = "./Sprites/Usables/items/drillPrototype.png"
const PLACEFORM_LIMIT = 4;
const PLAYER_RADIUS = 32;
const X_CENTER = 32.5;
const Y_CENTER = 36.5;
const PLAYER_SPEED = 200;
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

 /*     constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
NEW ANIMATION CLASS CONSTRUCTOR  */
class PlayerCharacter extends Entity {
    constructor(game, AM, gloopSheetPath) {
        super(self, game, 0, 0);

        this.game = game;
        this.ctx = game.ctx;
        this.placeformManager = new PlaceformManager(game, AM, PLACEFORM_LIMIT);
        this.gloopSheetPath = gloopSheetPath;
        // console.log(this.gloopSheetPath);

        //Collision
        this.wasColliding = false; 
        this.colliding = false;
        this.collidingTopLeft = false;
        this.collidingTopRight = false;
        this.collidingBotLeft = false;
        this.collidingBotRight = false;
        this.collidingTop = false;
        this.radius = 32;
        // console.log(this.gloopSheetPath);
        this.setupAnimations(gloopSheetPath);

        // Movement
        this.facingLeft = false;
        this.facingRight = true;
        // this.speed = 100;
        this.fallSpeed = 200;
        this.jumping = false;
        this.jumpY = this.y;

        // Extras
        this.attackDelay = 0;
        this.attacking = false;
        this.attackpoint = null;
        this.floorTimer = 0;
        this.dead = false;
        this.currentPlatform = null;
        this.cookies = 0;
    }
    
    setupAnimations(gloopSheetPath) {
        this.moveLeftAnimation = new Animation(AM.getAsset(gloopSheetPath.hopLeft), 0, 0, 64, 68, 0.15, 4, true, true);
        this.moveRightAnimation = new Animation(AM.getAsset(gloopSheetPath.hopRight), 0, 0, 64, 68, 0.15, 4, true, true);
        this.lookForwardAnimation = new Animation(AM.getAsset(gloopSheetPath.lookForward), 0, 0, 64, 68, 1, 1, true, true);
        this.jumpLeftAnimation = new Animation(AM.getAsset(gloopSheetPath.turning), 65, 0, 64, 64, 1, 1, false, true);
        this.jumpRightAnimation = new Animation(AM.getAsset(gloopSheetPath.turning), 193, 0, 64, 64, 1, 1, false, true);
        this.deadAnimation = new Animation(AM.getAsset(gloopSheetPath.dead), 0, 0, 64, 68, 1, 1, false, true);
        // this.attackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, .12, 2, false, false);
        // this.reverseAttackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, 0.1, 3, false, true);
        this.attackCache = this.buildAttackCache();
        this.currentAttackAnimation = this.attackCache['right'];

    }

    buildAttackCache(){
        const cache = {};
        let xO = -2 * this.radius;//offsets to center character
        let yO = -2 * this.radius + 5;//manual adjustment for dead pixels(i think)
        const directions = ['right', 'upRight', 'up', 'upLeft', 'left', 'downLeft', 'down', 'downRight'];
        for (let j = 0; j < directions.length; j++) {
            let rotatedImages = [];
            let angle = -j * Math.PI/4;
            for (let i = 0; i < 3; i++) {
                rotatedImages.push(this.rotateAndCache(AM.getAsset(DRILL_PROTO), angle, 63 * i, 0, 63, 47, 1));
            }
            cache[directions[j]] = {animation:new Animation(AM.getAsset(DRILL_PROTO),
                0, 0, 63, 47, .12, 3, false, false, rotatedImages)};
            cache[directions[j]].angle = angle;
            //calculates gloops edge
            cache[directions[j]].xOffset = xO + Math.cos(angle) * this.radius * 4;
            cache[directions[j]].yOffset = yO + Math.sin(angle) * this.radius * 4;
            //calculates the point of the end of the current attack animation frame
            cache[directions[j]].xCalcAttack = (framesUntilDone) => {
                return cache[directions[j]].xOffset - 5 + this.radius * (3 - framesUntilDone * Math.cos(angle))};
            cache[directions[j]].yCalcAttack = (framesUntilDone) => {
                return cache[directions[j]].yOffset - 5 + this.radius * (3 - framesUntilDone * Math.sin(angle))};
                    
        }
        return cache;
    }


    update() {
        super.update();
        this.wasColliding = false;
        if (this.isSupported()) {
            this.wasColliding = true;
        }
        this.colliding = false;
        this.collidingTop = false;
        this.collidingTopRight = false;
        this.collidingTopLeft = false;
        this.collidingBotLeft = false;
        this.collidingBotRight = false;
        this.currentPlatform = null;
        this.checkCollisions();
        if (this.dead) {
            if (this.game.active) {
                this.game.active = false;
                this.jumpY = this.y;
                this.deadAnimation.elapsedTime = 0;
            }
            if (this.deadAnimation.isDone()) {
                this.game.over = true;
            }
            this.calcJump(this.deadAnimation);
            return;
        }
        if (this.isSupported() && !this.wasColliding) {
            if (this.jumping) {
                this.jumping = false;
                this.jumpRightAnimation.elapsedTime = 0;
                this.jumpLeftAnimation.elapsedTime = 0;
            }
                
        }
        if (this.collidingTop || this.collidingTopLeft || this.collidingTopRight) {
            if (this.jumping) {
                // console.log('here');
                this.jumping = false;
                this.jumpRightAnimation.elapsedTime = 0;
                this.jumpLeftAnimation.elapsedTime = 0;
            }
        }
        if (!this.jumping && !this.isSupported()) {
            this.y += this.fallSpeed * this.game.clockTick;
        }
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
        if (this.movingLeft) {
            if (this.x > 0) {
                // const platformSlope = this.currentPlatform.equation.mSlope;
                // const platformB = this.currentPlatform.equation.gameB;
                if (this.collidingBotLeft && !(this.collidingTopLeft || this.collidingTop)) {
                    this.x -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    // console.log(platformSlope, platformB);
                    this.y -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                } else  if (this.collidingBotRight && !(this.colliding)) {
                    this.x -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    // console.log(platformSlope, platformB);
                    this.y += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                } else if (!(this.collidingTopLeft) && !(this.collidingBotLeft && this.collidingTop)) {
                    this.x -= this.game.clockTick * PLAYER_SPEED;
                }
            }
            
        } else if (this.movingRight) {
            if (this.x < this.game.surfaceWidth - this.radius * 2) {  // stops character at the right border
                // const platformSlope = this.currentPlatform.equation.mSlope;
                // const platformB = this.currentPlatform.equation.gameB;
                if (this.collidingBotLeft && !(this.colliding || this.collidingBotRight)) {
                    this.x += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    // console.log(platformSlope, platformB);
                    // this.y = this.x * platformSlope + platformB - PLATFORM_HEIGHT - Math.sqrt(2)/2;
                    this.y += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                } else  if (this.collidingBotRight && !(this.collidingTopRight || this.collidingTop)) {
                    this.x += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    // console.log(platformSlope, platformB);
                    this.y -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    // this.y = this.x * platformSlope + platformB + PLATFORM_HEIGHT + Math.sqrt(2)/2;
                } else if (!(this.collidingTopRight) && !(this.collidingBotRight && this.collidingTop)) {
                    this.x += this.game.clockTick * PLAYER_SPEED;
                }
            
                
            }
        }



        // if (this.game.jump) { //glitch jumpppsss
        if (this.game.jump && !this.jumping && this.isSupported()) {
            this.jumping = true;
            this.jumpY = this.y;
            // console.log('jumping', this.y);
            // console.log('colliding', this.colliding)
        }

        if (this.jumping) {
            let jumpAnimation = this.facingLeft ? this.jumpLeftAnimation : this.jumpRightAnimation;
            if (this.jumpLeftAnimation.isDone()) {
                this.jumpLeftAnimation.elapsedTime = 0;
                this.jumpRightAnimation.elapsedTime = 0;
                this.jumping = false;
            }

            if (this.jumpRightAnimation.isDone()) {
                this.jumpLeftAnimation.elapsedTime = 0;
                this.jumpRightAnimation.elapsedTime = 0;
                this.jumping = false;
            }

            if (this.jumpLeftAnimation.elapsedTime > this.jumpRightAnimation.elapsedTime) {
                this.jumpRightAnimation.elapsedTime = this.jumpLeftAnimation.elapsedTime;
            }

            if (this.jumpRightAnimation.elapsedTime > this.jumpLeftAnimation.elapsedTime) {
                this.jumpLeftAnimation.elapsedTime = this.jumpRightAnimation.elapsedTime;
            }
            
            this.calcJump(jumpAnimation);
        }

        //do we want players to be able to double place?
        // /__ has interesting blocking? or not I have bad spacial awareness
        //written to favor angled because it seems like those are going to be more likely to be used
        //also since jumping is going to disable platform placing do we want this before jump?
        //thinking of when a player jumps and places simultaneously
        if (this.game.placeAngled && this.isSupported()) {
            this.placed = true;
            this.placeformManager.placeformPlace(this.facingLeft, true, this.x, this.y, 
                this.moveLeftAnimation.frameWidth, this.moveLeftAnimation.frameHeight);
        } else if (this.game.placeFlat && this.isSupported()) {
            this.placed = true;
            this.placeformManager.placeformPlace(this.facingLeft, false, this.x, this.y, 
                this.moveLeftAnimation.frameWidth, this.moveLeftAnimation.frameHeight);
        }
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
        for (let i = 0; i < this.placeformManager.placeformsCurrent.length; i++) {
            if (this.placeformManager.placeformsCurrent[i].removeFromWorld) {
                this.placeformManager.placeformsCurrent.splice(i, 1);
            }
        }
        this.placeformManager.placeformsCurrent.filter((platform) => {platform.removeFromWorld === false});

    }

    calcJump(jumpAnimation) {
        var jumpDistance = jumpAnimation.elapsedTime / jumpAnimation.totalTime;
        var totalHeight = 100;
        if (jumpDistance > 0.5)
        jumpDistance = 1 - jumpDistance;
            this.height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.jumpY - this.height;
    }

    draw(ctx) {
        let drawY;
        if (this.game.camera) {
            drawY = this.cameraTransform(); 
        } else {
            drawY = this.y;
        }
    //this  is where we get transformed coordinates, drawY will be null if player is off screen
        if (this.dead) {
            this.deadAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY);
            return;
        } else if (this.jumping && this.facingLeft) {
            this.jumpLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY);
        } else if (this.jumping && !this.facingLeft) {
            this.jumpRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY);
        } else if (this.movingLeft) {
            this.moveLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY);
        } else if (this.movingRight) {
            this.moveRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY);
        } else {
            this.lookForwardAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY);
        }
        if (this.attacking) {
            this.currentAttackAnimation['animation'].drawFrame
                (this.game.clockTick, this.ctx, this.x + this.currentAttackAnimation.xOffset,
                    drawY + this.currentAttackAnimation.yOffset);
        }
    }

    isSupported() {
        return this.colliding || this.collidingBotLeft || this.collidingBotRight;
    }

    checkCollisions() {
        isCharacterColliding(this);
    }

    collectCookie() {
        console.log(++this.cookies);
    }

}
