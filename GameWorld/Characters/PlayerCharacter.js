const GLOOP_TURNING = "./Sprites/Usables/glopTurn(green).png";
const GLOOP_HOP_LEFT = "./Sprites/Usables/glopHopLeft(green).png";
const GLOOP_HOP_RIGHT = "./Sprites/Usables/glopHopRight(green).png";
const GLOOP_LOOK_FORWARD = "./Sprites/Usables/gloop(purple).png";
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
        this.placeformManager = new PlaceformManager(game, AM, PLACEFORM_LIMIT);
        this.moveLeftAnimation = new Animation(AM.getAsset(GLOOP_HOP_LEFT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.moveRightAnimation = new Animation(AM.getAsset(GLOOP_HOP_RIGHT), 0, 0, 64, 68, 0.15, 4, true, true);
        this.lookForwardAnimation = new Animation(AM.getAsset(GLOOP_LOOK_FORWARD), 0, 0, 64, 64, 1, 1, true, true);
        this.jumpLeftAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 65, 0, 64, 64, 1, 1, false, true);
        this.jumpRightAnimation = new Animation(AM.getAsset(GLOOP_TURNING), 193, 0, 64, 64, 1, 1, false, true);
        this.attackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, .12, 2, false, false);
        this.reverseAttackAnimation = new Animation(AM.getAsset(DRILL_PROTO), 0, 0, 63, 47, 0.1, 3, false, true);
        this.currentAttackAnimation = null;
        this.attackDelay = 50;
        // facingLeft instead of just "this.facing" with true/false or 0/1 which we would have to keep track of
        this.facingLeft = false;
        this.facingRight = true;
        this.radius = 32;
        this.speed = 100;
        this.game = game;
        this.ctx = game.ctx;
        this.jumping = false;
        this.jumpY = this.y;
        this.colliding = false;
    }

    update() {
        super.update();
        if (this.placed)
            this.isColliding();
        if (this.colliding) {
            this.jumping = false;
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
            if (this.x > 2) {   // stops character at the left border
                this.x -= this.game.clockTick * 200;
            }
            
        } else if (this.movingRight) {
            if (this.x < 1200 - 115) {  // stops character at the right border
                this.x += this.game.clockTick * 200;
            }
        }
        // if (this.game.up) { //glitch jumpppsss
        if (this.game.up && !this.jumping) {
            this.jumping = true;
            this.jumpY = this.y;
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
                console.log("gulpadulp");
            }
        }
    }
    draw(ctx) {
        let drawY = this.cameraTransform(); //this  is where we get transformed coordinates, drawY will be null if player is off screen
        if (drawY) {
            if (this.jumping && this.facingLeft) {
                // console.log("trying to jump left");
                this.jumpLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, drawY);
            } else if (this.jumping && !this.facingLeft) {
                // console.log("trying to jump right");
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
            this.placeformManager.placeformsDraw();
        }
    }
    isColliding() {
        // for each existing platform
        // am i colliding
        // for each placeform in this.placeformmanager.placeformscurrent
        let collidePlaceform = this.placeformManager.placeformsCurrent[0];
        //console.log(collidePlaceform);

        // Convert the player character
        let PlayerGWCords = convertCharacterToGameWorldCoords(this.x, this.y);
        // console.log("Player gw coords", PlayerGWCords);

        let PlayerCartCords = convertToCartesianCoords(PlayerGWCords.gameWorldX, PlayerGWCords.gameWorldY, this.game.surfaceHeight);
        // console.log("Player cart coords", PlayerCartCords);

        let PlayerCircleInfo = {
            radius: this.radius,
            cartesianX: PlayerCartCords.cartesianX,
            cartesianY: PlayerCartCords.cartesianY
        }

        // Convert the horizontal platform
        let PlatformGWCords = convertHorizontalLineToCartesianCoords(collidePlaceform.x, collidePlaceform.y, this.game.surfaceHeight);
        // console.log("Platform Cart cords", PlatformGWCords);

        // console.log(isCircleCollidingWithHorizontalLine(PlayerCircleInfo, PlatformGWCords));  
        this.colliding = isCircleCollidingWithHorizontalLine(PlayerCircleInfo, PlatformGWCords);


    }

}

function convertCharacterToGameWorldCoords(thisX, thisY) {
    //Assumes the circle character is 64x68 with 4 dead pixels on top
    // Returns the center of the character circle
    return { gameWorldX: thisX + 32.5, gameWorldY: thisY + 36.5 };
}

function convertHorizontalLineToCartesianCoords(thisX, thisY, gameHeight) {
    return {yValue: gameHeight - thisY, xLeft: thisX, xRight: thisX + 119};
}

function convertToCartesianCoords(gameWorldX, gameWorldY, gameHeight) {
    return { cartesianX: gameWorldX, cartesianY: gameHeight - gameWorldY };
}


//Circle has radius, cartX, cartY
//Line has y = mx + b
//Horizontal line has y = [number]
//These flat platforms are very simple
function isCircleCollidingWithHorizontalLine(CircleInfo, LineInfo) { // Char is circle, Platform is a line
    // ax^2 + bx + c = 0
    const a = 1;
    const b = -2 * CircleInfo.cartesianX;

    // console.log("1", CircleInfo.cartesianX * CircleInfo.cartesianX + LineInfo.yValue * LineInfo.yValue);
    // console.log("2", 2 * CircleInfo.cartesianY * LineInfo.yValue + CircleInfo.cartesianY * CircleInfo.cartesianY)
    // console.log("3", CircleInfo.radius * CircleInfo.radius)


    const c = CircleInfo.cartesianX * CircleInfo.cartesianX + LineInfo.yValue * LineInfo.yValue 
        - 2 * CircleInfo.cartesianY * LineInfo.yValue + CircleInfo.cartesianY * CircleInfo.cartesianY 
        - CircleInfo.radius * CircleInfo.radius;
    // console.log("a b c ", a, b, c);
    // console.log(quadraticFormula(a, b, c));

    let answer = quadraticFormula(a,b,c);

    if (isNaN(answer.result1) && isNaN(answer.result2)) {
        return false;//console.log("No collide");
    } else {
        if (CircleInfo.cartesianX >= LineInfo.xLeft && CircleInfo.cartesianX <= LineInfo.xRight)
        return true;//console.log("Collide");
    }
}


function quadraticFormula(a, b, c) {
    var result1 = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    var result2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    return {result1: result1, result2: result2};
}
