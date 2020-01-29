class PlaceformManager {
    constructor(game, AM, placeformLimit) {
        this.AM = AM;
        this.gameEngine = game;
        this.placeformsCurrent = [];
        this.placeformLimit = placeformLimit;
        this.placeformSpriteSheet = AM.getAsset(PLACEFORM_PATH);
        this.ctx = game.ctx;
    }
    placeformPlace(facingLeft, angled, x, y, characterWidth, characterHeight) {
       const scale = 1;
        if (this.placeformsCurrent.length === this.placeformLimit) {
            this.placeformsCurrent.shift();
        }
        if (facingLeft) {
            if (angled) {
                this.placeformsCurrent.push(new Platform(this.placeformSpriteSheet, 'left', 
                x - 87 * scale, y - 87 * scale + characterHeight, scale, this.ctx));
            } else {
                this.placeformsCurrent.push(new Platform(this.placeformSpriteSheet, 'center', 
                x - 87 * scale, y + characterHeight - 2, scale, this.ctx));
            }
            
        } else {
            if (angled) {
                this.placeformsCurrent.push(new Platform(this.placeformSpriteSheet, 'right', 
                x + characterWidth, y - 87 * scale + characterHeight, scale, this.ctx));
            } else {
                this.placeformsCurrent.push(new Platform(this.placeformSpriteSheet, 'center', 
                x + characterWidth, y + characterHeight - 2, scale, this.ctx));
            }
        }
        // console.log(this.placeformsCurrent);
    }
    placeformsDraw() {
        for (var i = 0; i < this.placeformsCurrent.length; i++) {
            this.placeformsCurrent[i].draw();
        }
    }
}



