class PlaceformManager {
    constructor(game, AM, placeformLimit) {
        this.placeformsCurrent = [];
        this.placeformLimit = placeformLimit;
        this.placeformSpriteSheet = AM.getAsset(PLACEFORM_PATH);
        this.game = game;
    }
    //should we allow placeforms to be placed partly offscreen?
    placeformPlace(facingLeft, angled, x, y, characterWidth, characterHeight) {
       const scale = 1; //modify this line to resize;
       let placeformPlaced;
        if (this.placeformsCurrent.length === this.placeformLimit) {
            this.placeformsCurrent[0].removeFromWorld = true;
        }
        if (facingLeft) {
            if (angled) {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'left', 
                x - 87 * scale + 5, y - 87 * scale + characterHeight + 5, scale, this.game);
                this.placeformsCurrent.push(placeformPlaced);
            } else {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'center', 
                x - 87 * scale, y + characterHeight - 2, scale, this.game);
                this.placeformsCurrent.push(placeformPlaced);
            }
            
        } else {
            if (angled) {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'right', 
                x + characterWidth - 10, y - 87 * scale + characterHeight + 10, scale, this.game);
                this.placeformsCurrent.push(placeformPlaced);
            } else {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'center', 
                x + characterWidth, y + characterHeight - 2, scale, this.game);
                this.placeformsCurrent.push(placeformPlaced);
            }
        }
        this.game.addEntity(placeformPlaced);
        // console.log(this.placeformsCurrent);
    }
    // placeformsDraw() {
    //     for (var i = 0; i < this.placeformsCurrent.length; i++) {
    //         this.placeformsCurrent[i].draw();
    //     }
    // }
}



