const GAMEOVER_PATH = './Sprites/Scenes/black_Background.jpg';
const GAMEOVER_ICON = './Sprites/HUD/gameOver.png';
const MUSIC_MANAGER = new MusicManager(document.getElementById("soundTrack"));

class SceneManager {
    constructor(gameEngine, musicManager) {
        // this.scenes = [];
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

    startScene() {
        this.game.scene = 'start';
        this.game.over = false;
        this.game.entities.splice(0, this.game.entities.length);

        // for (var i = this.game.entities.length - 1; i >= 0; --i) {
        //     this.game.entities[i].removeFromWorld = true;
        // }
        // console.log('start scene entities: ', this.game.entities);
        
        this.startScreen = new StartScreen(this.game, AM);
        // console.log(this.game.scene);
        this.game.addEntity(this.startScreen);
        let startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5);
        this.game.addEntity(startButton);
        this.game.draw();
        // console.log('start scene entities after start scene draw: ', this.game.entities);
    }

    gameScene() {
        this.game.scene = 'game';   
        this.game.entities.splice(0, this.game.entities.length);
        // for (var i = this.game.entities.length - 1; i >= 0; --i) {
        //     this.game.entities[i].removeFromWorld = true;
        // }
        console.log('game scene entities: ', this.game.entities)
        console.log(this.game.scene);
        this.background = new Background(this.game, AM, BACKGROUND_PATH);
        this.game.mapHeight = this.background.spritesheet.height;

        this.playerCharacter = new PlayerCharacter(this.game, AM);
        //let musicManager = new MusicManager(document.getElementById("soundTrack"));
        console.log(this.game.surfaceHeight);
        this.game.initCamera(this.playerCharacter, this.game.mapHeight - this.game.surfaceHeight);//we don't have game.mapHeight until here
        this.game.addEntity(this.background);
        genWalls(this.game, AM);
        this.game.floor = new Floor(this.game, AM);
        this.game.addEntity(this.game.floor);
        let startCoordinates = genGenforms(40, this.game, AM, 7 * this.game.mapHeight/9, this.game.mapHeight - FLOOR_HEIGHT);
        this.playerCharacter.x = startCoordinates.x;
        this.playerCharacter.y = startCoordinates.y - this.playerCharacter.radius * 2;
        genLevel0Exit(this.game, AM, 7 * this.game.mapHeight/9);    
        this.game.addEntity(this.playerCharacter); 
        this.game.draw();
        let score = new Score(this.game, AM, this.playerCharacter);
        this.game.addEntity(score);
            
        // console.log('start scene entities after game scene draw: ', this.game.entities);
        // for (var i = 0; i < this.game.entities.length; i++) {
        //     this.gameSceneArr.push(this.game.entities[i]);
        // }
    }

    gameOverScene() {
        // this.game.entities = [];
        this.game.scene = 'gameOver';
        this.game.entities = [];
        for (var i = this.game.entities.length - 1; i >= 0; --i) {
            this.game.entities[i].removeFromWorld = true;
        }
        console.log('gameOver scene entities: ', this.game.entities)
        
        this.gameOver = new GameOver(this.game, AM);
        this.game.addEntity(this.gameOver);
        this.gameOver.draw();
        console.log('game scene entities after draw: ', this.game.entities)
        this.game.started = false;
    }
}

class GameOver {
    constructor(gameEngine, AM) {
        this.game = gameEngine;
        this.background = new Background(this.game, AM, GAMEOVER_PATH);
        this.spritesheet = AM.getAsset(GAMEOVER_ICON);
        this.spriteWidth = this.spritesheet.width;
        this.spriteHeight = this.spritesheet.height;
    }
    update() {}
    draw(){
        this.background.draw();
        this.game.ctx.drawImage(this.spritesheet, 0, 0, this.spriteWidth, this.spriteHeight, 
                                this.game.surfaceWidth/2 - this.spriteWidth/2, this.game.surfaceHeight/6, 
                                this.spriteWidth, this.spriteHeight, this.spriteWidth/2, this.spriteHeight/2);
        let startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5);
        this.game.addEntity(startButton); 
    }
}

class StartScreen {
    constructor(gameEngine, AM) {
        this.game = gameEngine;
        this.background = new Background(this.game, AM, GAMEOVER_PATH);

    }
    update() {}
    draw() {
        this.background.draw();
        // this.game.ctx.drawImage(this.spritesheet, 0, 0, this.spriteWidth, this.spriteHeight, 
        //     this.game.surfaceWidth/2 - this.spriteWidth/2, this.game.surfaceHeight/6, 
        //     this.spriteWidth, this.spriteHeight, this.spriteWidth/2, this.spriteHeight/2);
        let startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5);
        this.game.addEntity(startButton); 
    }
}


class StartButton {
    constructor(game, AM, destY) {
        this.game = game;
        this.spriteSheet = AM.getAsset(START_BUTTON);
        //this.clicked = true;
        this.spriteWidth = this.spriteSheet.width/2;
        this.spriteHeight = this.spriteSheet.height;
        this.destX = this.game.surfaceWidth/2 - this.spriteWidth/2;
        this.destY = destY;
    }
    draw() {
        //console.log('mouse down game engine in draw: ' + this.game.mouseDown)
        if (!this.game.mouseDown) {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
                                    this.destX, this.destY, 70, this.spriteHeight);
            //console.log('start button appeared');
            this.showButton = false;
            this.removeFromWorld = true;
            // console.log('remove from world' + this.removeFromWorld);
            // console.log('mouseDown should be false: ' + this.game.mouseDown);
        } if (this.game.mouseDown) {
            // console.log('mouseDown should be true: ' + this.game.mouseDown);
            // console.log('other button appeared');
            this.game.ctx.drawImage(this.spriteSheet, this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
                                    this.destX, this.destY, 70, this.spriteHeight);
            this.removeFromWorld = true;
        }
  
    }
    update(){
    }
}

class Score {
    constructor(game, AM, PlayerCharacter) {
        this.spriteSheet = AM.getAsset(SCORE_TEXT);
        this.game = game;
        this.scoreTimer = new Timer();
        this.displayScore = 0;
        this.playerCharacter = PlayerCharacter;
        this.currentY = 0;
        this.maxY = 0;
        this.startY = this.game.mapHeight - this.playerCharacter.y;
    }
    draw() {
        //console.log(this.game.mouseReleased);
        if (this.game.mouseReleased) {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0,
                this.spriteSheet.width/5, this.spriteSheet.height/5);
            //this.game.ctx.font("Press Start 2P");
            this.game.ctx.font = ("20px Times New Roman");
            this.game.ctx.fillStyle = "gold";
            //console.log(this.playerY);
            this.game.ctx.fillText(this.maxY, this.spriteSheet.width/5 + 50, 20);
        }
        
        
    }
    update() {
        this.displayScore = this.scoreTimer.tick();
        let formatTime = Math.round(this.scoreTimer.gameTime*100)/100;
        this.currentY = Math.round(((this.game.mapHeight - this.playerCharacter.y - this.startY)* 100)/100);
        if (this.currentY > this.maxY) {
            this.maxY = this.currentY;
        }
        this.currentY = Math.round(((this.game.mapHeight - this.playerCharacter.y)* 100)/100);
        
        // console.log(formatTime);
        //console.log(this.playerCharacter);
    }

    loop() { 
    }
}



