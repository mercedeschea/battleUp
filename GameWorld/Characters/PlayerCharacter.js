const GLOOP_SHEET_PATHS_GREEN = {'turning':"./Sprites/Usables/glopTurn(green).png",
'hopLeft':"./Sprites/Usables/glopHopLeft(green).png",
'hopRight':"./Sprites/Usables/glopHopRight(green).png",
'lookForward':"./Sprites/Usables/gloop(green).png",
'turning':"./Sprites/Usables/glopTurn(green).png"};
const GLOOP_SHEET_PATHS_PURPLE = {'turning':"./Sprites/Usables/glopTurn(purple).png",
'hopLeft':"./Sprites/Usables/glopHopLeft(green).png",
'hopRight':"./Sprites/Usables/glopHopRight(green).png",
'lookForward':"./Sprites/Usables/gloop(green).png",
'turning':"./Sprites/Usables/glopTurn(green).png"};
const GLOOP_SHEET_PATHS = {'green':GLOOP_SHEET_PATHS_GREEN, 'purple':GLOOP_SHEET_PATHS_PURPLE};
const GLOOP_TURNING = "./Sprites/Usables/glopTurn(green).png";
const GLOOP_HOP_LEFT = "./Sprites/Usables/glopHopLeft(green).png";
const GLOOP_HOP_RIGHT = "./Sprites/Usables/glopHopRight(green).png";
const GLOOP_LOOK_FORWARD = "./Sprites/Usables/gloop(green).png";
const DRILL_PROTO = "./Sprites/Usables/tools/drillPrototype.png"
const PLACEFORM_LIMIT = 6;
const PLAYER_RADIUS = 32;
const X_CENTER = 32.5;
const Y_CENTER = 36.5;
const PLAYER_SPEED = 200;
// const GOD_MODE = true;//not implemented, use glitch jumps for now
const GOD_MODE = false;

function PlayerCharacterAMDownloads(AM) {
    AM.queueDownload(GLOOP_HOP_LEFT);
    AM.queueDownload(GLOOP_HOP_RIGHT);
    AM.queueDownload(GLOOP_LOOK_FORWARD);
    AM.queueDownload(GLOOP_TURNING);
    AM.queueDownload(DRILL_PROTO);
}

 /*     constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
NEW ANIMATION CLASS CONSTRUCTOR  */
class PlayerCharacter extends Entity {
    constructor(game, AM) {
        super(self, game, 0, 0);

        this.game = game;
        this.ctx = game.ctx;
        this.placeformManager = new PlaceformManager(game, AM, PLACEFORM_LIMIT);

        //Collision 
        this.colliding = false;
        this.radius = 32;
        this.setupAnimations();

        // Movement
        this.facingLeft = false;
        this.facingRight = true;
        this.speed = 100;
        this.jumping = false;
        this.jumpY = this.y;

        // Extras
        this.attackDelay = 0;
        this.attacking = false;
        this.attackpoint = null;
        this.floorTimer = 0;
        this.dead = false;
        this.currentPlatform = null;
    }

    setupAnimations() {
        this.moveLeftAnimation = new Animation(AM.getAsset(GLOOP_HOP_LEFT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.moveRightAnimation = new Animation(AM.getAsset(GLOOP_HOP_RIGHT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.lookForwardAnimation = new Animation(AM.getAsset(GLOOP_LOOK_FORWARD), 0, 0, 64, 68, 1, 1, true, true);
        this.jumpLeftAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 65, 0, 64, 64, 1, 1, false, true);
        this.jumpRightAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 193, 0, 64, 64, 1, 1, false, true);
        this.deadAnimation = this.jumpRightAnimation;
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
            if (this.currentPlatform) {
                const platformSlope = this.currentPlatform.equation.mSlope;
                const platformB = this.currentPlatform.equation.gameB;
                if (this.currentPlatform.type === 'left') {
                    this.x -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    console.log(platformSlope, platformB);
                    this.y -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                } else  if (this.currentPlatform.type === 'right') {
                    this.x -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    console.log(platformSlope, platformB);
                    this.y += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                } else {
                    this.x -= this.game.clockTick * PLAYER_SPEED;
                }

            } else {
                this.x -= this.game.clockTick * PLAYER_SPEED;
            }
            
        } else if (this.movingRight) {
            if (this.x < 1200 - 115) {  // stops character at the right border
                if (this.currentPlatform) {
                    const platformSlope = this.currentPlatform.equation.mSlope;
                    const platformB = this.currentPlatform.equation.gameB;
                    if (this.currentPlatform.type === 'left') {
                        this.x += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                        console.log(platformSlope, platformB);
                        this.y += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    } else  if (this.currentPlatform.type === 'right') {
                        this.x += this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                        console.log(platformSlope, platformB);
                        this.y -= this.game.clockTick * PLAYER_SPEED * Math.sqrt(2)/2;
                    } else {
                        this.x += this.game.clockTick * PLAYER_SPEED;
                    }

                } else {
                    this.x += this.game.clockTick * PLAYER_SPEED;
                }
                
                
            }
        }

        this.colliding = false;
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
        if (this.colliding) {
            if (this.jumping)
                this.jumping = false;
        }
        if (!this.jumping && !this.colliding) {
            this.y += 1;
        }



        // if (this.game.jump) { //glitch jumpppsss
        if (this.game.jump && !this.jumping) {
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
        if (this.game.placeAngled) {
            this.placed = true;
            this.placeformManager.placeformPlace(this.facingLeft, true, this.x, this.y, 
                this.moveLeftAnimation.frameWidth, this.moveLeftAnimation.frameHeight);
        } else if (this.game.placeFlat) {
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
        let drawY = this.cameraTransform(); //this  is where we get transformed coordinates, drawY will be null if player is off screen
        if (drawY) {
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
                //This code is used to debug attacks
                // this.ctx.save();
                // this.ctx.fillStyle = 'red';
                // this.ctx.fillRect(this.x + this.currentAttackAnimation.xOffset,
                //     drawY + this.currentAttackAnimation.yOffset, 10, 10);
                // this.ctx.beginPath();
                // this.ctx.moveTo(this.x + 32.5 + 32 * Math.cos(this.currentAttackAnimation.angle), drawY + 36.5 + 32 * Math.sin(this.currentAttackAnimation.angle));
                // let frame = this.currentAttackAnimation.animation.frames - this.currentAttackAnimation.animation.currentFrame();
                // this.ctx.lineTo(this.x + this.currentAttackAnimation.xCalcAttack(frame), drawY + this.currentAttackAnimation.yCalcAttack(frame));
                // this.ctx.stroke();
                // this.ctx.restore();
            }

            
            // let colors = ['black', 'blue', 'green', 'red', 'yellow', 'orange', 'yellow', 'pink'];
            // let ndx = 0;
            // Object.keys(this.attackCache).forEach((direction) => {//function for testing attacks, leave until after resizing -sterling
            //     let xO = this.attackCache[direction].xOffset;
            //     let yO = this.attackCache[direction].yOffset;
            //     // let xO = -2 * this.radius;
            //     // let yO = -2 * this.radius;
            //     this.attackCache[direction].animation.drawFrame(this.game.clockTick, this.ctx, this.x+xO, drawY+yO);
            //     this.ctx.save();
            //     this.ctx.fillStyle = colors[ndx++];
            //     this.ctx.beginPath();
            //     this.ctx.moveTo(this.x + 32.5 + 32 * Math.cos(this.attackCache[direction].angle), drawY + 36.5 + 32 * Math.sin(this.attackCache[direction].angle));
            //     let frame = this.attackCache[direction].animation.frames - this.attackCache[direction].animation.currentFrame();
            //     this.ctx.lineTo(this.x + this.attackCache[direction].xCalcAttack(frame), drawY + this.attackCache[direction].yCalcAttack(frame));
            //     this.ctx.stroke();
            //     console.log(this.attackCache[direction].xCalcAttack(frame), this.attackCache[direction].yCalcAttack(frame));
            //     this.ctx.fillRect(this.x + this.attackCache[direction].xCalcAttack(frame),
            //         drawY + this.attackCache[direction].yCalcAttack(frame), 10, 10);
            //     this.ctx.restore();
            // });
        }
        //this.attackCache[direction].yOffset - 5 + this.radius * (3 - frame * Math.sin(this.attackCache[direction].angle))
        //this.attackCache[direction].xOffset - 5 + this.radius * (3 - frame * Math.cos(this.attackCache[direction].angle))
    }
    checkCollisions() {
        isCharacterColliding(this);
    }

}



