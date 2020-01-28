const PLAYER_CHARACTER_PATH = "./Sprites/GloopGlop full turn.png";

/*     constructor(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
 */

class PlayerCharacter extends Entity {
    self = this;
    constructor(game, spritesheet) {
        super(self, game, 300, 300);
        this.moveLeftAnimation = new Animation(spritesheet, 64, 64, 206, 0.02, 4, true, 1);
        // this.moveRightAnimation = new Animation(spritesheet, 64, 64, )
        this.radius = 32;
        this.speed = 100;
        this.game = game;
        this.ctx = game.ctx;
    }
    update() {
        if (this.game.right || this.game.left || this.game.up || this.game.down)
            this.moving = true;
        if (this.moving && this.game.right === true) {
            this.x += this.game.clockTick * 200;
            // console.log(this.moving + ' moving state');
            this.moving = false;
            // console.log(this.moving + ' moving state');
        }
        if (this.moving && this.game.left === true) {
            this.x -= this.game.clockTick * 200;
            this.moving = false;
        }
        if (this.moving && this.game.up === true) {
            this.y -= this.game.clockTick * this.speed;
            //this.moving = false;
        }
        if (this.moving && this.game.down === true) {
            this.y += this.game.clockTick * this.speed;
        }
        //this.moving = false;
        else {
            this.moving = false;
        }
    }
    draw(ctx) {
        super.draw(this);
        if (this.moving) {
            this.moveLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
        else {
            this.moveLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
    }
}

/*
class Unicorn {
    constructor(game) {
        this.animation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 0, 0, 206, 110, 0.02, 30, true, true);
        this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 618, 334, 174, 138, 0.02, 40, false, true);
        this.jumping = false;
        this.radius = 100;
        this.ground = 400;
        Entity.call(this, game, 0, 400);
    }
    update() {
        if (this.game.space)
            this.jumping = true;
        if (this.jumping) {
            if (this.jumpAnimation.isDone()) {
                this.jumpAnimation.elapsedTime = 0;
                this.jumping = false;
            }
            var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
            var totalHeight = 200;
            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;
            //var height = jumpDistance * 2 * totalHeight;
            var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.ground - height;
        }
        Entity.prototype.update.call(this);
    }
    draw(ctx) {
        if (this.jumping) {
            this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
        }
        else {
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
        Entity.prototype.draw.call(this);
    }
}

Unicorn.prototype = new Entity();
Unicorn.prototype.constructor = Unicorn;
*/
