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
const DRILL_PROTO = "./Sprites/Usables/drillPrototype.png"
const PLACEFORM_LIMIT = 6;
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
        this.setupAnimations();

        // Movement
        this.facingLeft = false;
        this.facingRight = true;
        this.speed = 100;
        this.jumping = false;
        this.jumpY = this.y;

        //Collision 
        this.colliding = false;
        this.collidingWithHoriz = false;
        this.colldingWithLeftSlope = false;
        this.colldingWithRightSlope = false;
        this.radius = 32.5;

        // Extras
        this.attackDelay = 50;
    }

    setupAnimations() {
        this.moveLeftAnimation = new Animation(AM.getAsset(GLOOP_HOP_LEFT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.moveRightAnimation = new Animation(AM.getAsset(GLOOP_HOP_RIGHT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.lookForwardAnimation = new Animation(AM.getAsset(GLOOP_LOOK_FORWARD), 0, 0, 64, 68, 1, 1, true, true);
        this.jumpLeftAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 65, 0, 64, 64, 1, 1, false, true);
        this.jumpRightAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 193, 0, 64, 64, 1, 1, false, true);
        this.attackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, .12, 2, false, false);
        this.reverseAttackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, 0.1, 3, false, true);
        this.currentAttackAnimation = null;
    }
    update() {
        super.update();
        // Determine if character is colliding and how
        // Then check movement commands and how they should be moving based on these collisions
        // Then enact special actions like attacking and placing platforms

        // Determine collisions 
        this.colliding = false;
        this.needsMovingUp = false;
        this.checkCollisions();

        // if (this.colliding) {
        //     if (this.jumping)
        //         this.jumping = false;
        // }
        if (this.colliding && this.fallingDown) {
            this.stopJumping();
        }

        // if (this.colliding && !this.needsMovingUp) { // if I'm perfectly colliding
        //     if (this.jumping) {
        //         this.jumping = false;                  // stop my jumping - which would take me to an imperfect collision?
        //         console.log("stopped jumping here");
        //     }
        // }
        
        // Gravity
        if (!this.jumping && !this.colliding){//} && !this.needsMovingUp) {
            this.y += 1;
        }

        // Left right movement
        this.updateLeftRightMovement();
        
        // Debugging
        if (this.needsMovingUp) {
            console.log("need to move up");
            // this.y -= .2;
        }

        // Jumping
        this.updateJumping();
        // Special actions
        this.updateSpecialActions();

        console.log(this.colliding);
        // console.log(this.needsMovingUp)
 


    }
    draw(ctx) {
        let drawY = this.cameraTransform(); //this  is where we get transformed coordinates, drawY will be null if player is off screen
        if (drawY) {
            if (this.jumping && this.facingLeft) {
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
                if (this.facingLeft) {
                    console.log("attack left");
                    this.ctx.scale(-1, 1);
                    this.currentAttackAnimation.drawFrame(this.game.clockTick, this.ctx, -1 * this.x, drawY);
                    this.ctx.restore();
                } else {
                    console.log("attack right");
                    this.currentAttackAnimation.drawFrame(this.game.clockTick, this.ctx, (this.x + this.lookForwardAnimation.frameWidth), drawY);
                }
            }
            // this.placeformManager.placeformsDraw();
        }
    }
    updateLeftRightMovement() {
        // Check movement commands and move character
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
            if (this.x > 2) {   // stops character at the left border
                this.x -= this.game.clockTick * 200;
            }
        } else if (this.movingRight) {
            if (this.x < 1200 - 115) {  // stops character at the right border
                this.x += this.game.clockTick * 200;
            }
        }
    }
    updateJumping() {
        if (this.game.up && !this.jumping) {
            this.jumping = true;
            this.jumpY = this.y;
            this.jumpLeftAnimation.elapsedTime = 0;
            this.jumpRightAnimation.elapsedTime = 0;
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
            
            var jumpDistance = jumpAnimation.elapsedTime / jumpAnimation.totalTime;
            var totalHeight = 100;
            if (jumpDistance > 0.5) {
                this.fallingDown = true;
                jumpDistance = 1 - jumpDistance;
            }
            this.height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.jumpY - this.height;
        }
    }
    stopJumping() {
        this.jumping = false;
        this.jumpLeftAnimation.elapsedTime = 0;
        this.jumpRightAnimation.elapsedTime = 0;
        this.fallingDown = false;
    }
    updateSpecialActions() {
        //do we want players to be able to double place?
        // /__ has interesting blocking? or not I have bad spacial awareness
        //written to favor angled because it seems like those are going to be more likely to be used
        //also since jumping is going to disable platform placing do we want this before jump?
        //thinking of when a player jumps and places simultaneously
        if (this.game.placeAngled) {
            this.placed = true;
            this.placeformManager.placeformPlace(this.facingLeft, true, this.x, this.y, 
                this.moveLeftAnimation.frameWidth, this.moveLeftAnimation.frameHeight);
        } else  if (this.game.placeFlat) {
            this.placed = true;
            this.placeformManager.placeformPlace(this.facingLeft, false, this.x, this.y, 
                this.moveLeftAnimation.frameWidth, this.moveLeftAnimation.frameHeight);
        }
        if (this.attackDelay > 0)
            this.attackDelay--;
        if (this.game.attack && this.attackDelay <= 0) {
            this.attackDelay = 50;
            this.attacking = true;
            this.currentAttackAnimation = this.attackAnimation;
        }
        if (this.attacking) {
            if (this.currentAttackAnimation === 
                this.attackAnimation && this.currentAttackAnimation.isDone()) {
                this.attackAnimation.elapsedTime = 0;
                this.currentAttackAnimation = this.reverseAttackAnimation;
            } else if (this.currentAttackAnimation === 
                this.reverseAttackAnimation && this.currentAttackAnimation.isDone()) {
                this.reverseAttackAnimation.elapsedTime = 0;
                this.attacking = false;
            }
        }
    }
    checkCollisions() {
        isCharacterColliding(this);
    }

}



