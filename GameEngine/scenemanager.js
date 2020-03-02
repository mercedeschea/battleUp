const GAMEOVER_PATH = './Sprites/Scenes/black_Background.jpg';
const GAMEOVER_ICON = './Sprites/HUD/gameOver.png';
const START_PATH = './Sprites/Usables/lvl1/background.png';
const LEVEL1_PATH = './Sprites/Usables/lvl1/backgroundAppended.png';
const LEVEL1_FLOOR = './Sprites/Usables/lvl1/floor.png';
const LEVEL1_FLOOR_FLASH = './Sprites/Usables/lvl1/floorFlashing.png';
const MUSIC_MANAGER = new MusicManager(document.getElementById("soundTrack"));
const COOKIE_COUNT_SIZE_X = 150;
const KRIMTROK_SHEET = './Sprites/Usables/Misc/krimtrokHead.png';
const BUBBLE_SHEET = './Sprites/Usables/Misc/speechBubble.png';
const LOGO_ICON = './Sprites/HUD/battleUpLogo.png';

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
        this.game.sceneObj = this.startScreen;
        this.startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5 + 63);

        this.game.addEntity(this.startButton, 'general');

        this.game.addGloop(this.greenGloop, 'greenGloop');
        this.game.addGloop(this.purpleGloop, 'purpleGloop');
        this.game.addGloop(this.orangeGloop, 'orangeGloop');
        this.game.addGloop(this.blueGloop, 'blueGloop');

        this.game.draw();

    }

    gameScene() {
        this.game.scene = 'game';   
        this.game.clearAllEntities();
        let background = new Background(this.game, AM, BACKGROUND_PATH, 'level0');
        this.gameplayScene = new GameScene(this.game, AM, background);
        this.game.mapHeight = background.spriteSheet.height;
        this.game.sceneObj = this.gameplayScene;
        this.playerCharacter = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_ORANGE);
        this.game.initCamera(this.playerCharacter, this.game.mapHeight - this.game.surfaceHeight);
        this.gameplayScene.level0(this.playerCharacter);
    }

    // clears entities on screen, switches to end scene
    gameOverScene(score) {
        // this.game.entities = [];
        this.game.scene = 'gameOver';
        this.game.clearAllEntities();

        this.gameOver = new GameOver(this.game, AM, score);
        this.game.sceneObj = this.gameOver;
        let startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5);

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
        this.score = null;
        this.kT = new Krimtrok(gameEngine, AM);
    }

    update() {
        // console.log(this.game.surfaceHeight);
        // console.log(this.game.mapHeight);
        this.score.update();
        this.background.update();
        this.kT.update();
        if (this.game.camera.totalDrawOffset <= (this.game.surfaceHeight - 50)) {
            if(this.background.name === 'level0')
                this.level1(this.playerCharacter);
                // console.log(this.game.gloops['orangeGloop'].y);
        }
        // console.log(this.game.camera.totalDrawOffset);
        // console.log(this.background.name);
        if (this.game.camera.totalDrawOffset <= (-this.game.surfaceHeight/2) && this.background.name === 'level1') {
            console.log('won');
            this.score.win = true;
            this.game.over = true;
        }
    }

    level0(activeGloop) 
    {
        this.playerCharacter = activeGloop;
        this.game.floor = new Floor(this.game, AM.getAsset(FLOOR_FLASH_PATH), AM.getAsset(FLOOR_PATH));
        let testCookie = new Cookie(AM.getAsset(COOKIE_PATH),  this.playerCharacter.radius * 14, 
                            this.game.mapHeight - this.playerCharacter.radius * 5 - FLOOR_HEIGHT, this.game);
        this.game.addEntity(this.game.floor, 'general');
        genWalls(this.game, AM);
        let startX = this.playerCharacter.radius * 8;
        let startY = this.game.mapHeight - FLOOR_HEIGHT - this.playerCharacter.radius * 4; 
        let startform = new Platform(AM.getAsset(GENFORM_PATH), 'center', startX, startY, 1, this.game);
        this.game.addEntity(startform, 'genforms');
        genGenforms(10, this.game, AM, 
            this.game.mapHeight - this.game.surfaceHeight - FLOOR_HEIGHT, this.game.mapHeight - FLOOR_HEIGHT);
        
        this.playerCharacter.x = startX + this.playerCharacter.radius;
        this.playerCharacter.y = startY - this.playerCharacter.radius * 2;
        //this.playerCharacter.y = this.game.surfaceHeight + 400//+ 200;


        // console.log(this.playerCharacter.y);
        genLevel0Exit(this.game, AM, this.game.mapHeight - this.game.surfaceHeight);
        this.score = new Score(this.game, AM, this.playerCharacter);
        this.game.addEntity(testCookie, 'cookies');    
        this.game.addGloop(this.playerCharacter, 'orangeGloop'); 
        this.game.addEntity(this.kT, 'general');
        // this.game.addEntity(this.score, 'general');
    }


    level1(activeGloop) {
        // console.log(this.game.clearAllButGloop);
        this.game.clearAllButGloop();
        this.playerCharacter = activeGloop;
        this.background = new Background(this.game, AM, LEVEL1_PATH, 'level1');
        this.game.floor = new Floor(this.game, null, AM.getAsset(LEVEL1_FLOOR));
        this.game.mapHeight = this.background.spriteSheet.height;
        console.log('mapheight could be a problem', this.game.mapHeight);
        let oldPCY = this.playerCharacter.y;
        this.playerCharacter.y = this.game.mapHeight - 8 * this.playerCharacter.radius;
        if (this.playerCharacter.superAttacking) {
            //should we stop super attack on level transition?
            // this.playerCharacter.superAttackY = this.playerCharacter.y - (SUPER_ATTACK_HEIGHT - (oldPCY - this.playerCharacter.superAttackY));
            this.playerCharacter.stopSuperAttack();
        }
        this.playerCharacter.stopJumping();

        for (let i = -1; i < 2; i++) {
            this.game.addEntity(new Platform(AM.getAsset(GENFORM_PATH), 'center', this.playerCharacter.x + PLATFORM_WIDTH *i,
            this.playerCharacter.y + this.playerCharacter.radius * 2 + PLATFORM_HEIGHT * 2, 1, this.game), 'genforms');
        }
        
        this.game.camera.totalDrawOffset = this.game.mapHeight;
        // this.game.addEntity(this.game.floor, 'general');
        buildMapFromFile(this.game, AM, this.game.surfaceHeight * 5.5, LEVEL1_MAP_FILE_NAME);
        // this.game.addEntity(this.kT, 'top'); //i wanted it to draw on top maybe rethink later
        this.kT.speak('Well done Gloop,\n you\'re fattening up\n quite nicely!');  
        // console.log(this.score);
        // this.game.addEntity(this.score, 'general');
        // console.log(this.game.entities.general);
    }
    

    draw() {
        // console.log(this.background.name, 'background');
        this.background.draw();
        this.score.draw();
        this.kT.draw();
    }
}

// end scene
class GameOver {
    constructor(gameEngine, AM, score) {
        this.game = gameEngine;
        this.score = score;
        this.background = new Background(this.game, AM, GAMEOVER_PATH, 'game over');
        this.spriteSheet = AM.getAsset(GAMEOVER_ICON);
        this.spriteWidth = this.spriteSheet.width;
        this.spriteHeight = this.spriteSheet.height;
        this.kT = new Krimtrok(this.game, AM);
    }
    update() {}
    draw(){
        this.background.draw();
        if(this.score.win) {
            this.kT.drawWin(this.score);
        } else {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
                this.game.surfaceWidth/2 - this.spriteWidth/2, this.game.surfaceHeight/6, 
                this.spriteWidth, this.spriteHeight, this.spriteWidth/2, this.spriteHeight/2);
        } 
    }
}

// start screen
class StartScreen {
    constructor(gameEngine, AM, greenGloop, purpleGloop, orangeGloop, blueGloop) {
        this.game = gameEngine;
        this.background = new Background(this.game, AM, START_PATH, 'start screen');
        this.floor = new Floor(this.game, null, AM.getAsset(LEVEL1_FLOOR));
        this.spriteSheet = AM.getAsset(LOGO_ICON);
        this.spriteWidth = this.spriteSheet.width;
        this.spriteHeight = this.spriteSheet.height;
        this.destX = this.game.surfaceWidth/2 - (this.spriteWidth/2);

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
        console.log(this.game.mouse.x);
    }

    draw() {
        this.background.draw();
        this.floor.draw();
        // console.log(this.spriteHeight);
        this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
            this.destX, this.game.surfaceHeight/6, this.spriteWidth, this.spriteHeight);
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
        // 70 is the y, so that the button fits in space of the floor
        if (!this.game.mouseDown) { // default button animation
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
                                    this.destX, this.destY, 70, this.spriteHeight);
            this.showButton = false;
            this.removeFromWorld = true;
        } if (this.game.mouseDown) { // button press animation
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
        this.lastCookieCount = 0;
        this.startY = this.game.mapHeight - this.playerCharacter.y;
    }

    draw() {
        //console.log(this.game.mouseReleased);
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
        if (this.playerCharacter.totalCookies > this.lastCookieCount) {
            this.maxY += this.playerCharacter.totalCookies * 50;
            this.lastCookieCount = this.playerCharacter.totalCookies;
        }

        // this.currentY = Math.round(((this.game.mapHeight - this.playerCharacter.y)* 100)/100);
        // console.log(this.currentY);
    }

    loop() {}

}

class Krimtrok extends Entity {
    constructor(game, AM) {
        super(self, game, 0, 0);
        this.y = game.surfaceHeight/4 - 5;
        this.speakingTime = 0;
        this.speed = 100;
        this.spriteSheet = AM.getAsset(KRIMTROK_SHEET);
        this.animation = new Animation(this.rotateAndCache(AM.getAsset(KRIMTROK_SHEET), 
            Math.PI/4, 0, 0, 78, 84, 1),
            0, 0, 78, 84, 1, 1, true, false);
        this.x = -this.animation.frameWidth;
        this.bubbleAnimation = new Animation(AM.getAsset(BUBBLE_SHEET), 0, 0, 165, 100, 1, 1, true, false);
    }

    speak(message) {
        this.speakingTime = 4;
        this.message = message;

    }

    update() {
        let xLimit = 0;
        if (this.speakingTime > 0) {
            if (this.x < xLimit)
                this.x += this.game.clockTick * this.speed;
            else
                this.speakingTime -= this.game.clockTick;
        } else if (this.x > -this.animation.frameWidth){
            this.x -= this.game.clockTick * this.speed;
        }
    }
    drawWin(score) {
        let sWidth = this.spriteSheet.width;
        let sHeight = this.spriteSheet.height;
        this.x = this.game.surfaceWidth/3;
        this.y = this.game.surfaceHeight/2;
        this.game.ctx.drawImage(this.spriteSheet, 0, 0, sWidth, sHeight, this.x, this.y, sWidth, sHeight);
        let bubX = this.x + this.bubbleAnimation.frameWidth * .45;
        let bubY = this.y - this.bubbleAnimation.frameHeight * .65;
        this.bubbleAnimation.drawFrame(this.game.clockTick, this.game.ctx, 
        bubX, bubY, 1);
        this.game.ctx.font = ("20px Times New Roman");
        this.game.ctx.fillStyle = "#D4AF37";
        let scoreString = "Score: " + score.maxY;
        let cookieString = "Cookies: " + score.lastCookieCount;
        this.game.ctx.fillText('Acceptable Job', bubX+5, bubY + 25);
        this.game.ctx.fillText(scoreString, bubX+5, bubY + 50);
        this.game.ctx.fillText(cookieString, bubX+5, bubY+ 75);
    }
    draw() {
        let xLimit = 0
        if (this.speakingTime > 0 || this.x > -this.animation.frameWidth) {
            this.animation.drawFrame(this.game.clockTick, this.game.ctx, this.x, this.y, 1);
        } 
        if (this.x > xLimit) {
            let bubX = this.x + this.bubbleAnimation.frameWidth * .45;
            let bubY = this.y - this.bubbleAnimation.frameHeight * .65;
            this.bubbleAnimation.drawFrame(this.game.clockTick, this.game.ctx, 
                bubX, bubY, 1);
            
            this.game.ctx.font = ("20px Times New Roman");
            this.game.ctx.fillStyle = "#D4AF37";
            let msg = this.message.split('\n');
            this.game.ctx.fillText(msg[0], bubX+5, bubY + 25);
            this.game.ctx.fillText(msg[1], bubX+5, bubY + 50);
            this.game.ctx.fillText(msg[2], bubX+5, bubY+ 75);
            
        }
    
    }
    
}