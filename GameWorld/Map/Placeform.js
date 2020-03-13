const PLACEFORM_LIMITS = {'left':1, 'right':1, 'center':5};
const PLACEFORM_OFFSET =0//-5;
class PlaceformManager {
    constructor(game, AM, placeformLimit) {
        this.placeformsCurrent = []//{'right':[], 'left':[], 'center':[]};
        this.placeformLimit = placeformLimit;
        this.placeformSpriteSheet = AM.getAsset(PLACEFORM_PATHS['blue']);//dl all the placeforms then pass theright onelater
        this.game = game;
    }
    setColor(gameGloopColor) {
        let gloopColor = gameGloopColor.slice(0, -8);
        this.placeformSpriteSheet = AM.getAsset(PLACEFORM_PATHS[gloopColor]);//dl all the placeforms then pass theright onelater
    }
    //should we allow placeforms to be placed partly offscreen?
    placeformPlace(placeLeft, angled, x, y, characterWidth, characterHeight) {
       let placeformPlaced;
        // if (this.placeformsCurrent.length === this.placeformLimit) {
        //     this.placeformsCurrent[0].removeFromWorld = true;
        // }
        if (placeLeft) {
            if (angled) {
                // let type = 'left';
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'left', 
                x - HOR_BLOCK_SIZE - PLACEFORM_OFFSET, y - HOR_BLOCK_SIZE + characterHeight - PLACEFORM_OFFSET - 6, this.game);
                this.updateCurrentPlaceforms(placeformPlaced);
            } else {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'center', 
                x - HOR_BLOCK_SIZE, y + characterHeight - 2, this.game);
                this.updateCurrentPlaceforms(placeformPlaced);
            }
        } else {
            if (angled) {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'right', 
                x + characterWidth + PLACEFORM_OFFSET, y - HOR_BLOCK_SIZE + characterHeight - PLACEFORM_OFFSET - 6, this.game);
                this.updateCurrentPlaceforms(placeformPlaced);
            } else {
                placeformPlaced = new Platform(this.placeformSpriteSheet, 'center', 
                x + characterWidth, y + characterHeight - 2, this.game);
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
        // let type = placeformPlaced.type;
        // if (this.placeformsCurrent[type].length >= PLACEFORM_LIMITS[type]) {
        //     this.placeformsCurrent[type][0].removeFromWorld = true;
        // }
        // this.placeformsCurrent[type].push(placeformPlaced);
        if (this.placeformsCurrent.length >= PLACEFORM_LIMITS['center']) {
            this.placeformsCurrent[0].removeFromWorld = true;
        }
        this.placeformsCurrent.push(placeformPlaced);
    }

    clearPlaceforms() {
        for (let i = 0; i < this.placeformsCurrent.length; i++) {
            this.placeformsCurrent[i].removeFromWorld = true;
        }
    }
}





