const GAMEOVER_PATH = './Sprites/Scenes/black_Background.jpg';
const GAMEOVER_ICON = './Sprites/HUD/gameOver.png';
const START_PATH = './Sprites/Usables/lvl1/background.png';
const MUSIC_MANAGER = new MusicManager(document.getElementById("soundTrack"));
const COOKIE_COUNT_SIZE_X = 100;
const KRIMTROK_SHEET = './Sprites/Usables/Misc/krimtrokHead.png';
const BUBBLE_SHEET = './Sprites/Usables/Misc/speechBubble.png';
const LOGO_ICON = './Sprites/HUD/battleUpLogo.png';
const SCORE_FONT = "20px mainFont";
const KT_FONT = "12px mainFont";
const START_BUTTON = "./Sprites/HUD/startButtonPress.png";
const ARROW_ICON = './Sprites/HUD/arrow.png';
const FONT_COLOR = '#F1C40F';

const ADD_SCORE_EP = 'addscore/';
const SCOREBOARD_EP = 'scoreboard/';

class SceneManager {
    constructor(gameEngine) {
        this.backgrounds = {};
        this.game = gameEngine;
        this.playerCharacter = null;
        this.background = null;
        this.musicManager = MUSIC_MANAGER;
        this.nameForm = document.getElementById("nameForm");
    }
    
    addBackground(background, name) {
        this.backgrounds[name] = background;
    }

    updateStartScreenPlayers(listOfPlayers) {
        console.log(listOfPlayers);
        if (this.game.scene === 'start') {
            for (const gloop of Object.values(this.game.gloops)) {
                gloop.name = null;
            }
            for (const player of listOfPlayers) {
                if(player.gloopColor)
                    this.game.gloops[player.gloopColor].setName(player.name);
            }
            this.game.draw();
        } else {
            console.error('update start screen called when not on startscreen');
        }
    }

    // clears entities on screen, switches to start screen
    startScene() {
        this.game.scene = 'start';
        this.game.over = false;
        this.game.clearAllEntities();
        this.game.camera = null;

        this.greenGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_GREEN, true);
        this.purpleGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_PURPLE, true);
        this.orangeGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_ORANGE, true);
        this.blueGloop = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS_BLUE, true);

        this.startScreen = new StartScreen(this.game, AM, this.greenGloop, this.purpleGloop, this.orangeGloop, this.blueGloop);
        this.game.sceneObj = this.startScreen;
        this.startButton = new StartButton(this.game, AM);
        this.arrow = new Arrow(this.game);

        this.game.addEntity(this.startButton, 'general');
        this.game.addEntity(this.arrow, 'general');

        this.game.addGloop(this.greenGloop, 'green');
        this.game.addGloop(this.purpleGloop, 'purple');
        this.game.addGloop(this.orangeGloop, 'orange');
        this.game.addGloop(this.blueGloop, 'blue');

        this.game.draw();
        this.nameForm.style.display = 'none';
    }

    gameScene(thisGloop, otherGloops) {
        this.game.scene = 'game';
        // console.log('should at least be here');
        // console.log(this.startButton.removeFromWorld);
        // this.startScene.startButton.removeFromWorld;  
        this.game.clearAllEntities();
        let level0 = new Background(this.game, AM, BACKGROUND_PATH, 'level0');
        let level1 = new Background(this.game, AM, LEVEL1_PATH, 'level1');
        let level2 = new Background(this.game, AM, LEVEL2_PATH, 'level2');
        let level3 = new Background(this.game, AM, LEVEL3_PATH, 'level3');
        let level4 = new Background(this.game, AM, LEVEL4_PATH, 'level4');
        this.addBackground(level0, 'level0');
        this.addBackground(level1, 'level1');
        this.addBackground(level2, 'level2');
        this.addBackground(level3, 'level3');
        this.addBackground(level4, 'level4');
        this.game.mapHeight = level0.spriteSheet.height;
        this.playerCharacter = new PlayerCharacter(this.game, AM, GLOOP_SHEET_PATHS[thisGloop.gloopColor], false, thisGloop.name);
        console.log(thisGloop, otherGloops);
        this.playerCharacter.number = thisGloop.number;
        // console.log('right before camera init');
        this.game.initCamera(this.playerCharacter, this.game.mapHeight - this.game.surfaceHeight);
        this.gameplayScene = new GameScene(this.game, AM, level0, this.backgrounds);
        this.game.sceneObj = this.gameplayScene;
        let otherPlayerCharacters = [];
        if (otherGloops) {
            for (const otherGloop of otherGloops) {
                let gameEngineProxy = new GameEngineProxy(this.game);
                gameEngineProxy.gloopColor = otherGloop.gloopColor;
                let newGloop = new PlayerCharacter(gameEngineProxy, AM, GLOOP_SHEET_PATHS[otherGloop.gloopColor], true, otherGloop.name);
                newGloop.number = otherGloop.number;
                otherPlayerCharacters.push(newGloop);
            }
        }
        this.gameplayScene.level0(this.playerCharacter, otherPlayerCharacters);
    }

    // clears entities on screen, switches to end scene
    gameOverScene(score) {
        // this.game.entities = [];
        // console.log(score.maxY);
        this.game.scene = 'gameOver';
        this.game.clearAllEntities();
        if (this.gameOver) {
            this.game.sceneObj = this.gameOver;
            this.game.sceneObj.score = score;
        }
        else {
            this.gameOver = new GameOver(this.game, AM, score);
        }
        // let startButton = new StartButton(this.game, AM, (this.game.surfaceHeight/6)*5);

        // this.game.addEntity(startButton, 'general');

        this.gameOver.draw();

        this.game.started = false;
        this.nameForm.style.display = 'block';
    }

    

}

// game play scene
class GameScene {
    constructor(gameEngine, AM, background, backgrounds) {
        this.game = gameEngine;
        this.backgrounds = backgrounds;
        // console.log(this.game.camera);
        this.background = background;
        this.score = null;
        this.kT = new Krimtrok(gameEngine, AM);
    }

    update() {
        this.score.update();
        this.background.update();
        this.kT.update();
        // logEverySecond([this.game.camera.playerCharacter, this.playerCharacter]);
        if (this.game.camera.totalDrawOffset <= (this.game.surfaceHeight - 50)) {
            if(this.background.name === 'level0') {
                this.transitionLevel(this.playerCharacter, 'level1')
            }
            else if (this.background.name === 'level1') {
                this.transitionLevel(this.playerCharacter, 'level2');
            }
            else if (this.background.name === 'level2') {
                this.transitionLevel(this.playerCharacter, 'level3');
            }
            else if (this.background.name === 'level3') {
                this.transitionLevel(this.playerCharacter, 'level4');
            }
        }
        if (this.game.camera.totalDrawOffset <= (-this.game.surfaceHeight/2) && this.background.name === 'level4') {
            console.log('won');
            this.score.win = true;
            this.game.over = true;
        }
    }

    level0(activeGloop, otherGloops) {
        this.playerCharacter = activeGloop;
        this.game.floor = new Floor(this.game, AM.getAsset(FLOOR_FLASH_PATH), AM.getAsset(FLOOR_PATH));
        let testCookie = new Cookie(AM.getAsset(COOKIE_PATH),  this.playerCharacter.radius * 14, 
                            this.game.mapHeight - this.playerCharacter.radius * 5 - FLOOR_HEIGHT, this.game);
        this.game.addEntity(this.game.floor, 'general');
        genWalls(this.game, AM);
        let startX = this.game.surfaceWidth/6;
        let startY = this.game.mapHeight - FLOOR_HEIGHT - this.playerCharacter.radius * 4; 
        this.playerCharacter.x = startX * this.playerCharacter.number + this.playerCharacter.radius;
        this.playerCharacter.y = startY - this.playerCharacter.radius * 2;
        let startform = new Platform(AM.getAsset(GENFORM_PATHS.level0), 'center',
         this.playerCharacter.x - this.playerCharacter.radius, startY, this.game);
        this.game.addEntity(startform, 'genforms');
        console.log(this.playerCharacter.number);
        // this.playerCharacter.y = this.game.surfaceHeight + 400//+ 200;//spawn at the top for testing

        buildMapFromFile(this.game, AM, this.game.mapHeight - 4 * VERT_BLOCK_SIZE,
                         LEVEL_MAP_PATHS['level0'], 'level0');
        this.score = new Score(this.game, AM, this.playerCharacter);
        this.game.addEntity(testCookie, 'cookies');    
        this.game.addGloop(this.playerCharacter, activeGloop.name); 
        for (const otherGloop of otherGloops) {
            // startX = this.playerCharacter.radius * 20;
            otherGloop.x = startX * otherGloop.number + this.playerCharacter.radius;
            otherGloop.y = startY - this.playerCharacter.radius * 2;
            startform = new Platform(AM.getAsset(GENFORM_PATHS.level0), 'center',
            otherGloop.x - otherGloop.radius, startY, this.game);
            this.game.addEntity(startform, 'genforms');
            this.game.addGloop(otherGloop, otherGloop.name);
        }
        this.game.addEntity(this.kT, 'top');
        this.game.addEntity(this.score, 'top');
    }

    // transitions levels
    transitionLevel(activeGloop, level) {
        this.game.clearAllButGloopAndTop();
        this.playerCharacter = activeGloop;
        this.background = this.backgrounds[level];
        this.game.mapHeight = this.background.spriteSheet.height;
        this.game.camera.advanceTime = 0;
        this.game.floor = null;
        
        // bc level 0 is appended to bottom of level1 img
        if (level === 'level1') {
            this.game.camera.totalDrawOffset = this.game.mapHeight;
            this.playerCharacter.y = this.game.mapHeight - 8 * this.playerCharacter.radius;
        }
        else {
            this.game.camera.totalDrawOffset = this.game.mapHeight - this.game.surfaceHeight;

            this.playerCharacter.y = this.game.mapHeight - 6 * this.playerCharacter.radius; 
        }
        
        if (this.playerCharacter.superAttacking) {
            this.playerCharacter.stopSuperAttack();
        }
        this.playerCharacter.newScene();

        for (let i = -1; i < 2; i++) {
            this.game.addEntity(new Platform(AM.getAsset(GENFORM_PATHS[level]), 'center', this.playerCharacter.x + HOR_BLOCK_SIZE * i,
            this.playerCharacter.y + this.playerCharacter.radius * 2 + PLATFORM_HEIGHT * 2, this.game), 'genforms');
            // this.playerCharacter.y + PLATFORM_HEIGHT * 2, this.game), 'genforms');
        }
        buildMapFromFile(this.game, AM, this.game.surfaceHeight * 5.5, LEVEL_MAP_PATHS[level], level);
        

        this.kT.speak('Well done Gloop,\n you\'re fattening up\n quite nicely!'); 
    }

    draw() {
        this.background.draw();
        // this.score.draw();
        // this.kT.draw();
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
        this.scores = null;
        this.nameForm = document.getElementById("nameForm");
        let that = this;
        this.arrowSpriteSheet = AM.getAsset(ARROW_ICON);
        this.nameForm.addEventListener( "submit", function ( event ) {
            event.preventDefault();
            that.sendScore();
        });
    }
    update() {}
    draw(){
        // this.game.ctx.font = KT_FONT;
        // this.game.ctx.fillStyle = "#D4AF37";
        this.background.draw();
        // if(this.score.win) {
            this.game.ctx.fillStyle = "#D4AF37";
            this.game.ctx.font = SCORE_FONT;
            if (!this.scoreSent) {
                this.game.ctx.fillText("Enter your name below! \t Click screen to play again!", 10, this.game.surfaceHeight - this.arrowSpriteSheet.height - 20);
                this.game.ctx.drawImage(this.arrowSpriteSheet, 0, this.game.surfaceHeight - this.arrowSpriteSheet.height);
            }
            this.kT.drawGameOver(this.score, 0, this.game.surfaceHeight/16);
            let drawX = this.game.surfaceWidth/2;
            let drawY = this.game.surfaceHeight/16;
            if (!this.scores) {
                this.getScoreBoard();
            } else {
                // console.log(this.scores);
                this.game.ctx.fillText("High Scores", drawX, drawY);
                drawY += this.game.surfaceHeight/12;
                this.game.ctx.font = KT_FONT;
                for (const player of this.scores) {
                    // console.log('hello', player.username, player.mscore);
                    this.game.ctx.fillText(player.username, drawX, drawY);
                    drawX += this.game.surfaceWidth/3;
                    this.game.ctx.fillText(player.mscore, drawX, drawY);
                    drawX -= this.game.surfaceWidth/3;
                    drawY += this.game.surfaceHeight/16;
                }
            }
        // } else {
        //     this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
        //         this.game.surfaceWidth/2 - this.spriteWidth/2, this.game.surfaceHeight/6, 
        //         this.spriteWidth, this.spriteHeight, this.spriteWidth/2, this.spriteHeight/2);
        // } 
    }
    getScoreBoard() {
        const XHR = new XMLHttpRequest();
        const that = this;
        XHR.addEventListener( "load", function(event) {
            // alert( event.target.responseText );
            // console.log(this);
            // let parsed = JSON.parse(this.reponseText);
            // that.scores = parsed.data;
            that.scores = this.response.data;
            // console.log(that.scores);
            that.draw();
        } );
        XHR.addEventListener( "error", function( event ) {
            alert( 'Oops! Something went wrong.' );
        } );
        XHR.open( "GET", BACKEND_URL + SCOREBOARD_EP );
        XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        XHR.responseType = 'json';
        //   The data sent is what the user provided in the form
        XHR.send();
        
        // ...and take over its submit event.
    }
    sendScore() {
        const XHR = new XMLHttpRequest();

        // Bind the FormData object and the form element
        const FD = new FormData( this.nameForm );
        const that = this;
        //Define what happens on successful data submission
        XHR.addEventListener( "load", function(event) {
            that.scoreSent = true;
            that.getScoreBoard();
            that.nameForm.style.display = 'none';
        } );

        // Define what happens in case of error
        XHR.addEventListener( "error", function( event ) {
            alert( 'Oops! Something went wrong.' );
        } );
        // Set up our request
        XHR.open( "POST", BACKEND_URL + ADD_SCORE_EP );
        XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        const username = FD.get("playerName");
        //   if (!username || !username.trim())
        let JSONFD = JSON.stringify({username:username, score:that.score.maxY}); 
        console.log(JSONFD);
        let inputField = document.getElementById("playerName");
        inputField.value = "";
        //   The data sent is what the user provided in the form
        XHR.send(JSONFD);
        // ...and take over its submit event.
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

        this.midSpacing = 100;
        this.spacing = 200;
        this.gloopWidth = 64;

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
        this.message = "Select a gloop and press start to play!";
    }

    update() {
    }

    hostWaitForPlayerColors() {
        this.message = "Wait for all players to choose a color!";
        this.draw();
    }

    playerWaitForHost() {
        this.message = "Select a gloop and wait for your host!"
        this.draw();
    }

    joinAGame() {
        this.message = ("Enter your game code to join a game!");
    }

    hostWaitForPlayers() {
        this.message = "Wait for other players to join the game!"
        this.draw();
    }

    draw() {
        this.background.draw();
        this.floor.draw();
        // console.log(this.spriteHeight);
        this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
            this.destX, this.game.surfaceHeight/6, this.spriteWidth, this.spriteHeight);

        this.game.ctx.font = SCORE_FONT;
        this.game.ctx.fillStyle = FONT_COLOR;
        this.game.ctx.fillText(this.message, this.game.surfaceWidth/6, this.game.surfaceHeight/2);
    }


}

// animates start button
class StartButton {
    constructor(game, AM) {
        this.game = game;
        this.spriteSheet = AM.getAsset(START_BUTTON);
        this.spriteWidth = this.spriteSheet.width/2;
        this.spriteHeight = this.spriteSheet.height;
        this.destX = this.game.surfaceWidth/2 - (this.spriteWidth/2);
        this.destY = this.game.surfaceHeight - 46;
    }
    
    draw() { // 70 is the y, so that the button fits in space of the floor
        // animates start button when pressed
        if (!this.game.multiplayer || this.game.peer instanceof Host) {
            if (this.game.mouseDown && this.game.mouseStart && this.game.gloopColor != null){
                this.game.ctx.drawImage(this.spriteSheet, this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
                                        this.destX, this.destY, this.spriteWidth, this.spriteHeight);
                this.removeFromWorld = true;
            } // default start button
            else {
                this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight, 
                                        this.destX, this.destY, this.spriteWidth, this.spriteHeight);
                this.removeFromWorld = true;
            }
        }
    }

    update() {}
}

class Arrow {
    constructor(game) {
        this.game = game;
        this.surfaceWidth = this.game.surfaceWidth;
        this.spriteSheet = AM.getAsset(ARROW_ICON);
        this.spriteWidth = this.spriteSheet.width;
        this.spriteHeight = this.spriteSheet.height;
        this.spacing = 100;
        this.gloopStartSize = 64;
    }
    update(){
    }
    draw(){
        let destY = 525 - this.spriteHeight;
        if (this.game.scene === 'start' && this.game.gloopColor === 'green') {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight,
                this.surfaceWidth - (this.surfaceWidth/2) - (this.gloopStartSize * 2) - (this.spacing + this.spacing*2) - (this.spriteWidth/4), 
                destY, this.spriteWidth, this.spriteHeight - 50);
        }
        if (this.game.scene === 'start' && this.game.gloopColor === 'purple') {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight,
                this.surfaceWidth - (this.surfaceWidth/2) - this.gloopStartSize - this.spacing - this.spriteWidth/4, 
                destY, this.spriteWidth, this.spriteHeight - 50);
        }
        if (this.game.scene === 'start' && this.game.gloopColor === 'orange') {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight,
                this.surfaceWidth - (this.surfaceWidth/2) + this.spacing - this.spriteWidth/4, 
                destY, this.spriteWidth, this.spriteHeight - 50);
        }
        if (this.game.scene === 'start' && this.game.gloopColor === 'blue') {
            this.game.ctx.drawImage(this.spriteSheet, 0, 0, this.spriteWidth, this.spriteHeight,
                this.surfaceWidth - (this.surfaceWidth/2) + this.spacing + this.gloopStartSize + this.spacing*2 - this.spriteWidth/4, 
                destY, this.spriteWidth, this.spriteHeight - 50);
        }
    }

}


// player score based on max height and number of cookies
class Score {
    constructor(game, AM, PlayerCharacter) {
        // this.spriteSheet = AM.getAsset(SCORE_TEXT);
        this.game = game;
        this.scoreTimer = new Timer();
        this.displayScore = 0;
        this.displayCookie = new Cookie(AM.getAsset(COOKIE_HUD_PATH), 
            this.game.surfaceWidth - COOKIE_COUNT_SIZE_X, 0, game);
        this.displayCookie.animation = null;
        this.displayCookie.scale = .5;
        this.playerCharacter = PlayerCharacter;
        this.currentY = 0;
        this.maxY = 0;
        this.lastCookieCount = 0;
        this.startY = this.game.mapHeight - this.playerCharacter.y;
    }

    draw() {
        this.game.ctx.font = SCORE_FONT;
        this.game.ctx.fillStyle = FONT_COLOR;
        this.game.ctx.fillText("Score: " + this.maxY, 5, 20);
        this.displayCookie.draw();
        this.game.ctx.fillText(this.playerCharacter.cookies, this.game.surfaceWidth - this.displayCookie.radius * 2, 20);
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
        super(game, 0, 0);
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
        this.speakingTime = 5;
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
    drawGameOver(score, x, y) {
        let sWidth = this.spriteSheet.width;
        let sHeight = this.spriteSheet.height;
        this.x = x;
        this.y = y + this.bubbleAnimation.frameHeight;
        this.game.ctx.drawImage(this.spriteSheet, 0, 0, sWidth, sHeight, this.x, this.y, sWidth, sHeight);
        let bubX = this.x + this.bubbleAnimation.frameWidth * .45;
        let bubY = this.y - this.bubbleAnimation.frameHeight;
        this.bubbleAnimation.drawFrame(this.game.clockTick, this.game.ctx, 
        bubX, bubY, 1.5);
        this.game.ctx.font = KT_FONT;
        this.game.ctx.fillStyle = FONT_COLOR;
        let scoreString = "Score: " + score.maxY;
        let cookieString = "Cookies: " + score.lastCookieCount;
        if(score.win) {
            this.game.ctx.fillText('Acceptable Job', bubX+5, bubY + 25);
        } else {
            this.game.ctx.fillText('Do Better', bubX+5, bubY + 25);
        }
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
                bubX, bubY, 1.5);
            
            this.game.ctx.font = KT_FONT;
            this.game.ctx.fillStyle = FONT_COLOR;
            let msg = this.message.split('\n');
            this.game.ctx.fillText(msg[0], bubX+5, bubY + 25);
            this.game.ctx.fillText(msg[1], bubX+5, bubY + 50);
            this.game.ctx.fillText(msg[2], bubX+5, bubY+ 75);
            
        }
    
    }
    
}