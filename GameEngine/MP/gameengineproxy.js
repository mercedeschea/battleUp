class GameEngineProxy {
    constructor(game) {
        this.ctx = game.ctx;
        this.entities = game.entities;
        this.gloops = game.gloops;
        this.surfaceHeight = game.surfaceHeight;
        this.surfaceWidth = game.surfaceWidth;
        this.mapHeight = game.mapHeight;
        this.floor = game.floor;
        this.down = false;
        this.left = false;
        this.right = false;
        this.up = false;
        this.jump = false;
        this.attack = false;
        this.attackSuper = false;
        this.placeAngledLeft = false;
        this.placeAngledRight = false;
        this.removePlatforms = false;
        this.placeFlat = false;
        this.started = false;
        this.clockTick = 0;
        this.active = true;
        this.timer = game.timer;
        this.camera = game.camera;
    }

    update(gameState) {
        // console.log(gameState);
        let props = Object.keys(gameState.input.game);
        for (const key of props) {
            this[key] = gameState.input.game[key];
        }
        // console.log(this);
    }

}
