const GAMEOVER_PATH = './Sprites/Scenes/black_Background.jpg';
const GAMEOVER_ICON = './Sprites/HUD/gameOver.png';
const STARTSCREEN_PATH = './Sprites/Usables/lvl1/background.png';
const STARTSCREEN_FLOOR = './Sprites/Usables/lvl1/floor.png';
const MUSIC_MANAGER = new MusicManager(document.getElementById("soundTrack"));
const COOKIE_COUNT_SIZE_X = 150;

class SceneManager {
    constructor(gameEngine, musicManager) {
        this.gameSceneArr = [];
        this.game = gameEngine;
        this.playerCharacter = null;
        this.background = null;
        this.musicManager = MUSIC_MANAGER;
    }

    // clears entities on screen, switches to start screen
    startScene() {
        this.game.scene = 'start';
        this.game.over = false;
        this.game.clearAllEntities();
        this.game.camera = null;

        this.greenGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_GREEN);
        this.purpleGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_PURPLE);
        this.orangeGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_ORANGE);
        this.blueGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_BLUE);

        this.startScreen = new StartScreen(this.game, AM, this.greenGloop, this.purpleGloop, this.orangeGloop, this.blueGloop);
        this.startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5 + 63);

        this.game.addEntity(this.startScreen, 'general');
        this.game.addEntity(this.startButton, 'general');

        this.game.addGloops(this.greenGloop, 'greenGloop');
        this.game.addGloops(this.purpleGloop, 'purpleGloop');
        this.game.addGloops(this.orangeGloop, 'orangeGloop');
        this.game.addGloops(this.blueGloop, 'blueGloop');

        this.game.draw();

    }

    gameScene() {
        this.game.scene = 'game';   
        this.game.clearAllEntities();
    
        this.background = new Background(this.game, AM, BACKGROUND_PATH, 'level0');
        this.gameplayScene = new GameScene(this.game, AM, this.background);
        this.playerCharacter = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_ORANGE);
        this.game.floor = new Floor(this.game, AM, AM.getAsset(FLOOR_PATH));
        let testCookie = new Cookie(AM.getAsset(COOKIE_PATH),  150, 
                            this.game.mapHeight - this.playerCharacter.radius * 4 - FLOOR_HEIGHT, this.game);
        let score = new Score(this.game, AM, this.playerCharacter);

        this.game.mapHeight = this.background.spriteSheet.height;

        // we don't have game.mapHeight until here
        this.game.initCamera(this.playerCharacter, this.game.mapHeight - this.game.surfaceHeight);
        this.game.addEntity(this.gameplayScene, 'general');

        genWalls(this.game, AM);
        
        this.game.addEntity(this.game.floor, 'general');

        let startCoordinates = genGenforms(10, this.game, AM, 
                                this.game.mapHeight - this.game.surfaceHeight - FLOOR_HEIGHT, this.game.mapHeight - FLOOR_HEIGHT);
        this.playerCharacter.x = startCoordinates.x;
        this.playerCharacter.y = startCoordinates.y - this.playerCharacter.radius * 2;
        // for ez scrolling -> this.playerCharacter.y = this.game.surfaceHeight - 200//+ 200;
        genLevel0Exit(this.game, AM, this.game.mapHeight - this.game.surfaceHeight);
        
        this.game.addEntity(testCookie, 'cookies');    
        this.game.addGloops(this.playerCharacter, 'orangeGloop'); 
        this.game.addEntity(score, 'general');
        this.game.draw();
        
    }

    // clears entities on screen, switches to end scene
    gameOverScene() {
        // this.game.entities = [];
        this.game.scene = 'gameOver';
        this.game.clearAllEntities();

        this.gameOver = new GameOver(this.game, AM);
        let startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5);

        this.game.addEntity(this.gameOver, 'general');
        this.game.addEntity(startButton, 'general');

        this.gameOver.draw();

        this.game.started = false;
    }
}

// game play scene
class GameScene {
    constructor(gameEngine, AM, background) {
        this.game = gameEngine;
        this.background = background;
    }

    update() {
        if (this.game.camera.totalDrawOffset <= (this.game.surfaceHeight + 100) && this.background.name === 'level0') {
                this.background = new Background(this.game, AM, STARTSCREEN_PATH, 'levell');
                this.game.mapHeight = this.background.spriteSheet.height;
                this.game.camera.totalDrawOffest = this.game.mapHeight - this.game.camera.surfaceHeight;
        }
    }

    draw() {
        this.background.draw();
    }
}

// end scene
class GameOver {
    constructor(gameEngine, AM) {
        this.game = gameEngine;
        this.background = new Background(this.game, AM, GAMEOVER_PATH, 'game over');
        this.spriteSheet = AM.getAsset(GAMEOVER_ICON);
        this.spriteWidth = this.spriteSheet.width;
        this.spriteHeight = this.spriteSheet.height;
    }
    update() {}
    draw(){
        this.background.draw();
        this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
                                this.game.surfaceWidth/2 - this.spriteWidth/2, this.game.surfaceHeight/6, 
                                this.spriteWidth, this.spriteHeight, this.spriteWidth/2, this.spriteHeight/2);        
    }
}

// start screen
class StartScreen {
    constructor(gameEngine, AM, greenGloop, purpleGloop, orangeGloop, blueGloop) {
        this.game = gameEngine;
        this.background = new Background(this.game, AM, STARTSCREEN_PATH, 'start screen');
        this.floor = new Floor(this.game, AM, AM.getAsset(STARTSCREEN_FLOOR));

        this.greenGloop = greenGloop;
        this.purpleGloop = purpleGloop;
        this.orangeGloop = orangeGloop;
        this.blueGloop = blueGloop;

        this.midSpacing = 50;
        this.spacing = 100;
        this.gloopWidth = 2 * this.greenGloop.radius;

        this.gloopY = this.game.surfaceHeight - 123;
        this.greenGloop.x = this.game.surfaceWidth - (this.game.surfaceWidth/2) - 
                            this.gloopWidth - this.midSpacing - this.spacing - this.gloopWidth;
        this.purpleGloop.x = this.game.surfaceWidth - (this.game.surfaceWidth/2) - 
                             this.gloopWidth - this.midSpacing;
        this.orangeGloop.x = this.game.surfaceWidth - (this.game.surfaceWidth/2) + this.midSpacing;
        this.blueGloop.x = this.game.surfaceWidth - (this.game.surfaceWidth/2) + 
                           this.midSpacing + this.gloopWidth + this.spacing;

        this.greenGloop.y = this.gloopY;
        this.purpleGloop.y = this.gloopY;
        this.orangeGloop.y = this.gloopY;
        this.blueGloop.y = this.gloopY;
    }

    update() {
        this.greenGloop.jumping = true;
    }

    draw() {
        this.background.draw();
        this.floor.draw();
    }
}

// animates start button
class StartButton {
    constructor(game, AM, destY) {
        this.game = game;
        this.spriteSheet = AM.getAsset(START_BUTTON);
        this.spriteWidth = this.spriteSheet.width/2;
        this.spriteHeight = this.spriteSheet.height;
        this.destX = this.game.surfaceWidth/2 - (this.spriteWidth/2);
        this.destY = destY;
    }
    
    draw() {
        if (!this.game.mouseDown) {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
                                    this.destX, this.destY, 70, this.spriteHeight);
            this.showButton = false;
            this.removeFromWorld = true;
        } if (this.game.mouseDown) {
            this.game.ctx.drawImage(this.spriteSheet, this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
                                    this.destX, this.destY, 70, this.spriteHeight);
            this.removeFromWorld = true;
        }
    }

    update() {}
}

// player score based on max height and number of cookies
class Score {
    constructor(game, AM, PlayerCharacter) {
        this.spriteSheet = AM.getAsset(SCORE_TEXT);
        this.game = game;
        this.scoreTimer = new Timer();
        this.displayScore = 0;
        this.displayCookie = new Cookie(AM.getAsset(COOKIE_PATH), 
        this.game.surfaceWidth - COOKIE_COUNT_SIZE_X, 0, game);
        this.displayCookie.animation = null;
        this.playerCharacter = PlayerCharacter;
        this.currentY = 0;
        this.maxY = 0;
        this.startY = this.game.mapHeight - this.playerCharacter.y;
    }

    draw() {
        if (this.game.mouseReleased) {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0,
                this.spriteSheet.width/5, this.spriteSheet.height/5);
            this.game.ctx.font = ("20px Times New Roman");
            this.game.ctx.fillStyle = "#D4AF37";
            this.game.ctx.fillText(this.maxY, this.spriteSheet.width/5 + 50, 20);
            this.displayCookie.draw();
            this.game.ctx.fillText(this.playerCharacter.cookies, this.game.surfaceWidth - this.displayCookie.radius * 2, 20);
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
    }

    loop() {}
}
