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
        // let gloopColor = gameGloopColor.slice(0, -8);
        let gloopColor = gameGloopColor;
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
        // this.game.addEntity(placeformPlaced, 'placeforms');
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

    getStrippedPlaceforms() {
        let stripped = [];
        this.placeformsCurrent.forEach(placeform => {
            let current = new Platform(null, placeform.type, placeform.x, placeform.y, this.game);
            current.game = null;
            // console.log(current);
            stripped.push(current);
        });
        return stripped;
    }
    replaceResources(listOfPlaceforms) {
        if(listOfPlaceforms.length > 0) {
            listOfPlaceforms.forEach(placeform => {
                // console.log('this is entering?', this);
                placeform.game = this.game;
                placeform.spriteSheet = this.placeformSpriteSheet;
                placeform.draw = function () {
                        let drawY = placeform.y - this.game.camera.totalDrawOffset;
                        // console.log(drawY);
                        // console.log(drawY);
                        if(drawY) {
                            // if (this.animation) {
                            //     // console.log(this);
                            //     this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x, drawY, 1);
                            // } else {
                                let width = placeform.srcWidthAndHeight[placeform.type][0];
                                let height = placeform.srcWidthAndHeight[placeform.type][1];
                                this.game.ctx.drawImage(placeform.spriteSheet, placeform.srcCoordinates[placeform.type][0], placeform.srcCoordinates[placeform.type][1], 
                                    width, height, placeform.x, drawY, 
                                    width * placeform.scale, height * placeform.scale);
                
                            // }
                        }
                };
            });
        }
    }

    draw() {
        // console.log(this);
        this.placeformsCurrent.forEach(placeform => {
            placeform.draw();
            // console.log(placeform);
        })
    }
}





