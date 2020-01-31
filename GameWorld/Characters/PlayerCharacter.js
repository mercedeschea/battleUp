const GLOOP_TURNING = "./Sprites/Usables/glopTurnAnimationgit.png";
const GLOOP_HOP_LEFT = "./Sprites/Usables/glopHopLeft.png";
const GLOOP_HOP_RIGHT = "./Sprites/Usables/glopHopRight.png";
const GLOOP_LOOK_FORWARD = "./Sprites/Usables/CuterGloopGlob.png";
const PLACEFORM_LIMIT = 6;

function PlayerCharacterAMDownloads(AM) {
    AM.queueDownload(GLOOP_HOP_LEFT);
    AM.queueDownload(GLOOP_HOP_RIGHT);
    AM.queueDownload(GLOOP_LOOK_FORWARD);
    AM.queueDownload(GLOOP_TURNING);
}

 /*     constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
NEW ANIMATION CLASS CONSTRUCTOR  */
class PlayerCharacter extends Entity {
    self = this;
    constructor(game, AM) {
        super(self, game, 250, 250);
        this.placeformManager = new PlaceformManager(game, AM, PLACEFORM_LIMIT);
        this.moveLeftAnimation = new Animation(AM.getAsset(GLOOP_HOP_LEFT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.moveRightAnimation = new Animation(AM.getAsset(GLOOP_HOP_RIGHT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.lookForwardAnimation = new Animation(AM.getAsset(GLOOP_LOOK_FORWARD), 0, 0, 64, 64, 1, 1, true, true);
        this.jumpLeftAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 65, 0, 64, 64, 1, 1, false, true);
        this.jumpRightAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 193, 0, 64, 64, 1, 1, false, true);

        // facingLeft instead of just "this.facing" with true/false or 0/1 which we would have to keep track of
        this.facingLeft = false;
        this.facingRight = true;
        this.radius = 32;
        this.speed = 100;
        this.game = game;
        this.ctx = game.ctx;
        this.jumping = false;
    }
    update() {
        this.movingLeft = false;
        this.movingRight = false;
        if (this.game.left) {
            this.movingLeft = true;
            this.facingLeft = true;
            this.facingRight = false;
            //console.log('switched to left key')
        }
        else if (this.game.right) {
            this.movingRight = true;
            this.facingRight = true;
            this.facingLeft = false;
            //console.log('switched to right key')
        }

        if (this.movingLeft) {
            if (this.x > 2) {   // stops character at the left border
                this.x -= this.game.clockTick * 200;
            }
            
        } else if (this.movingRight) {
            if (this.x < 1200 - 115) {  // stops character at the right border
                this.x += this.game.clockTick * 200;
            }
        }


        if (this.game.up)
            this.jumping = true;
        if (this.jumping) {
            let jumpAnimation = this.facingLeft ? this.jumpLeftAnimation : this.jumpRightAnimation;
            if (this.jumpLeftAnimation.isDone()) {
                this.jumpLeftAnimation.elapsedTime = 0;
                this.jumpRightAnimation.elapsedTime = 0;
                this.jumping = false;
                //console.log('jump left animation done');
            }

            if (this.jumpRightAnimation.isDone()) {
                this.jumpLeftAnimation.elapsedTime = 0;
                this.jumpRightAnimation.elapsedTime = 0;
                this.jumping = false;
               //console.log('jump right animation done')
            }
            console.log("left time " + this.jumpLeftAnimation.elapsedTime);
            console.log("right time " + this.jumpLeftAnimation.elapsedTime);

            if (this.jumpLeftAnimation.elapsedTime > this.jumpRightAnimation.elapsedTime) {
                this.jumpRightAnimation.elapsedTime = this.jumpLeftAnimation.elapsedTime;
                //console.log('switched to left animation');
            }
            if (this.jumpRightAnimation.elapsedTime > this.jumpLeftAnimation.elapsedTime) {
                this.jumpLeftAnimation.elapsedTime = this.jumpRightAnimation.elapsedTime;
                //console.log('switched to right animation');
            }
            
            var jumpDistance = jumpAnimation.elapsedTime / jumpAnimation.totalTime;
            var totalHeight = 100;
            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;
            this.height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = 250 - this.height;
            console.log(this.facingLeft);
        }


        //this.jumping = false;
        //do we want players to be able to double place?
        // /__ has interesting blocking? or not I have bad spacial awareness
        //written to favor angled because it seems like those are going to be more likely to be used
        //also since jumping is going to disable platform placing do we want this before jump?
        //thinking of when a player jumps and places simultaneously
        if (this.game.placeAngled) {
            this.placeformManager.placeformPlace(this.facingLeft, true, this.x, this.y, 
                this.moveLeftAnimation.frameWidth, this.moveLeftAnimation.frameHeight);
        } else  if (this.game.placeFlat) {
            this.placeformManager.placeformPlace(this.facingLeft, false, this.x, this.y, 
                this.moveLeftAnimation.frameWidth, this.moveLeftAnimation.frameHeight);
        }
        Entity.prototype.update.call(this);
    }
    draw(ctx) {
        if (this.jumping && this.facingLeft) {
            console.log("trying to jump left");
            this.jumpLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else if (this.jumping && !this.facingLeft) {
            console.log("trying to jump right");
            this.jumpRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else if (this.movingLeft && !this.jumping) {
            this.moveLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else if (this.movingRight && !this.jumping) {
            this.moveRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.lookForwardAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }

        // if (this.jumping) {
        //     if (this.facingLeft) {
        //         this.jumpLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        //         //console.log('facing left: ' );
        //     }
        //     else if (this.facingRight) {
        //         //console.log('hello i am facing right whilst jumping');
        //         this.jumpRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        //     }
        //     else {
        //         this.lookForwardAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        //     }
        // }
        // else {  // not jumping
        //     if (this.movingLeft) {
        //         this.moveLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        //     }
        //     else if (this.movingRight) {
        //         this.moveRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        //     }
        //     else {
        //         this.lookForwardAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        //     }
        // }

        this.placeformManager.placeformsDraw();
        Entity.prototype.draw.call(this);
    }
}
