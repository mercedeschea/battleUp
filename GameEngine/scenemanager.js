const GAMEOVER_PATH = './Sprites/Scenes/black_Background.jpg';
const MUSIC_MANAGER = new MusicManager(document.getElementById("soundTrack"));

class SceneManager {
    constructor(gameEngine, musicManager) {
        this.scenes = [];
        this.gameSceneArr = [];
        this.game = gameEngine;
        this.playerCharacter = null;
        this.background = null;
        this.musicManager = MUSIC_MANAGER;
    }
    // addScene(scene) {
    //     this.scenes.push(scene);
    // }
    // loadScene(scene, ctx) {

    // }
    gameScene() {
        this.background = new Background(this.game, AM, BACKGROUND_PATH);
        let mapHeight = this.background.spritesheet.height;
        this.playerCharacter = new PlayerCharacter(this.game, AM);
        //let musicManager = new MusicManager(document.getElementById("soundTrack"));
        this.game.initCamera(mapHeight, this.musicManager, this.playerCharacter);//we don't have game.mapHeight until here

        this.game.addEntity(this.background);
        genWalls(this.game, AM);
        this.game.floor = new Floor(this.game, AM);
        this.game.addEntity(this.game.floor);
        genGenforms(20, this.game, AM, mapHeight);
        this.playerCharacter.x = lowestGenformCoords[0];
        this.playerCharacter.y = lowestGenformCoords[1] - 64;
        
        this.game.addEntity(this.playerCharacter); 
        let startButton = new StartButton(this.game, AM);
        this.game.addEntity(startButton); 
        this.game.draw();
        let score = new Score(this.game, AM, this.playerCharacter);
        this.game.addEntity(score);
        
        for (var i = 0; i < this.game.entities.length; i++) {
            this.gameSceneArr.push(this.game.entities[i]);
        }
        // console.log(this.gameSceneArr);
    }


    gameOverScene() {
        this.game.entities = [];
        this.gameOver = new GameOver(this.game, AM);
        this.game.addEntity(this.gameOver);
        this.game.started = false;

    }
}

class GameOver {
    constructor(gameEngine, AM) {
        this.game = gameEngine;
        this.background = new Background(this.game, AM, GAMEOVER_PATH);
    }
    update() {
    }
    draw(){
        // console.log(this.background);
        this.background.draw();
        // this.game.ctx.font = ("50px");
        this.game.ctx.fillStyle = "red";
        this.game.ctx.textAlign = 'center';
        this.game.ctx.fillText("Game over!", this.game.surfaceWidth/2, this.game.surfaceHeight/2);
        let startButton = new StartButton(this.game, AM);
        this.game.addEntity(startButton); 
    }
}