class GameEngineShim {
    constructor(game) {
        this.ctx = game.ctx;
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
        // this.timer = game.timer;
    }

    update(gameState) {
        let props = Object.keys(gameState);
        for (const key of props) {
            this[key] = gameState[key];
        }
    }

}
