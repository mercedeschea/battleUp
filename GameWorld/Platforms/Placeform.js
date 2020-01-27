
function PlaceformManager (game, AM, placeformLimit) {
    this.gameEngine = game;
    this.placeformsCurrent = [];
    this.placeformLimit = placeformLimit;
    this.formWidth = Math.floor(game.surfaceWidth/10);
    this.placeformSpritesheet = AM.getAsset(placeformPath);
    this.ctx = game.ctx;
}

function Placeform(x, y, spritesheet, ctx) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.spritesheet = spritesheet;
}

PlaceformManager.prototype.placeformPlace = function (x, y) {
    if(this.placeformsCurrent.length === this.placeformLimit) {
        this.placeformsCurrent.shift();
    }
    this.placeformsCurrent.push(new Placeform(x, y, this.placeformSpritesheet, this.ctx));
}
PlaceformManager.prototype.placeformsDraw = function () {
    for (var i = 0; i < this.placeformsCurrent.length; i++) {
        this.placeformsCurrent[i].draw();
    }
}
Placeform.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Placeform.prototype.update = function () {
};