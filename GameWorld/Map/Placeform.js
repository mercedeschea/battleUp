const PLACEFORM_LIMITS = {'left':1, 'right':1, 'center':5};
const PLACEFORM_OFFSET = 5;
class PlaceformManager {
    constructor(game, AM, placeformLimit) {
        this.placeformsCurrent = {'right':[], 'left':[], 'center':[]};
        this.placeformLimit = placeformLimit;
        this.placeformSpriteSheet = AM.getAsset(PLACEFORM_PATH);
        this.game = game;
    }
    //should we allow placeforms to be placed partly offscreen?
    placeformPlace(facingLeft, angled, x, y, characterWidth, characterHeight) {
       const scale = 1; //modify this line to resize;
       let placeformPlaced;
        // if (this.placeformsCurrent.length === this.placeformLimit) {
        //     this.placeformsCurrent[0].removeFromWorld = true;
        // }
        if (facingLeft) {
            if (angled) {
                let type = 'left';
                placeformPlaced = new Platform(this.placeformSpriteSheet, type, 
                x - 87 * scale - PLACEFORM_OFFSET, y - 87 * scale + characterHeight - PLACEFORM_OFFSET, scale, this.game);
                this.updateCurrentPlaceforms(placeformPlaced);
            } else {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'center', 
                x - 87 * scale, y + characterHeight - 2, scale, this.game);
                this.updateCurrentPlaceforms(placeformPlaced);
            }
            
        } else {
            if (angled) {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'right', 
                x + characterWidth + PLACEFORM_OFFSET, y - 87 * scale + characterHeight - PLACEFORM_OFFSET, scale, this.game);
                this.updateCurrentPlaceforms(placeformPlaced);
            } else {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'center', 
                x + characterWidth, y + characterHeight - 2, scale, this.game);
                this.updateCurrentPlaceforms(placeformPlaced);
            }
        }
        this.game.addEntity(placeformPlaced, 'placeforms');
        // console.log(this.placeformsCurrent);
    }
    // placeformsDraw() {
    //     for (var i = 0; i < this.placeformsCurrent.length; i++) {
    //         this.placeformsCurrent[i].draw();
    //     }
    // }
    updateCurrentPlaceforms (placeformPlaced) {
        let type = placeformPlaced.type;
        if (this.placeformsCurrent[type].length >= PLACEFORM_LIMITS[type]) {
            this.placeformsCurrent[type][0].removeFromWorld = true;
        }
        this.placeformsCurrent[type].push(placeformPlaced);
    }
}





