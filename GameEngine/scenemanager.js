const GAMEOVER_PATH = './Sprites/Scenes/black_Background.jpg';
const MUSIC_MANAGER = new MusicManager(document.getElementById("soundTrack"));

class SceneManager {
    constructor(gameEngine, musicManager) {
        this.scenes = [];
        this.game = gameEngine;
        this.playerCharacter = null;
        this.background = null;
        this.musicManager = MUSIC_MANAGER;
    }
    addScene(scene) {
        this.scenes.push(scene);
    }
    loadScene(scene, ctx) {

    }
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
        // console.log("All Done!");
    }

    gameOverScene() {
        this.game.entities = [];
        this.game.camera.musicManager.currentMusic.pause();
        console.log(GAMEOVER_PATH);
        this.background = new Background(this.game, AM, GAMEOVER_PATH);
        this.game.addEntity(this.background);
        this.game.ctx.font = ("100px Times New Roman");
        this.game.ctx.fillStyle = "white";
        this.game.ctx.fillText('GAME OVER!', 100, 100);
    }
}

