class PlaceformManager {
    constructor(game, AM, placeformLimit) {
        this.AM = AM;
        this.gameEngine = game;
        this.placeformsCurrent = [];
        this.placeformLimit = placeformLimit;
        this.placeformSpriteSheet = AM.getAsset(placeformPath);
        this.ctx = game.ctx;
    }
    placeformPlace(type, x, y) {
       
        if (this.placeformsCurrent.length === this.placeformLimit) {
            this.placeformsCurrent.shift();
        }
        this.placeformsCurrent.push(new Platform(this.placeformSpriteSheet, type, x, y, 1, this.ctx));
        console.log(this.placeformsCurrent);
    }
    placeformsDraw() {
        for (var i = 0; i < this.placeformsCurrent.length; i++) {
            this.placeformsCurrent[i].draw();
        }
    }
}



