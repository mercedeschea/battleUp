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
        super(self, game, lowestGenformCoords[0], lowestGenformCoords[1] - 64);
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
        this.radius = 32;

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

        this.colliding = false;
        this.checkCollisions();

        if (this.colliding) {
            if (this.jumping)
                this.jumping = false;
        }
        if (!this.jumping && !this.colliding) {
            this.y += 1;
        }



        // if (this.game.up) { //glitch jumpppsss
        if (this.game.up && !this.jumping) {
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
            
            var jumpDistance = jumpAnimation.elapsedTime / jumpAnimation.totalTime;
            var totalHeight = 100;
            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;
            this.height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.jumpY - this.height;
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
    checkCollisions() {
        isCharacterColliding(this);
    }

}



