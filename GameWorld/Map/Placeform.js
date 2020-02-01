class PlaceformManager {
    constructor(game, AM, placeformLimit) {
        this.placeformsCurrent = [];
        this.placeformLimit = placeformLimit;
        this.placeformSpriteSheet = AM.getAsset(PLACEFORM_PATH);
        this.game = game;
    }
    //should we allow placeforms to be placed partly offscreen?
    placeformPlace(facingLeft, angled, x, y, characterWidth, characterHeight) {
       const scale = 1;
       let placeformPlaced;
        if (this.placeformsCurrent.length === this.placeformLimit) {
<<<<<<< HEAD
            console.log("lmao");
=======
            this.placeformsCurrent[0].removeFromWorld = true;
>>>>>>> 6b071dddaeaa5cda18ff0629a5c23af04b1634cd
            this.placeformsCurrent.shift();
        }
        if (facingLeft) {
            if (angled) {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'left', 
                x - 87 * scale, y - 87 * scale + characterHeight, scale, this.game);
                this.placeformsCurrent.push(placeformPlaced);
            } else {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'center', 
                x - 87 * scale, y + characterHeight - 2, scale, this.game);
                this.placeformsCurrent.push(placeformPlaced);
            }
            
        } else {
            if (angled) {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'right', 
                x + characterWidth, y - 87 * scale + characterHeight, scale, this.game);
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



