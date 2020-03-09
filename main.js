const AM = new AssetManager();
const SCENE_MANAGER = new SceneManager();
const BACKEND_URL = "http://localhost:5000/";
// const BACKEND_URL = "https://battleup-backend.herokuapp.com/"
let myHost;
let myPlayer;
class Animation {
    constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, rotatedCache) {
        this.spriteSheet = spriteSheet;
        this.startX = startX;
        this.startY = startY;
        this.frameWidth = frameWidth;
        this.frameDuration = frameDuration;
        this.frameHeight = frameHeight;
        this.frames = frames;
        this.totalTime = frameDuration * frames;
        this.elapsedTime = 0;
        this.loop = loop;
        this.reverse = reverse;
        this.rotatedCache = rotatedCache;
    }
    drawFrame(tick, ctx, x, y, scaleBy, rotation) {
        var scaleBy = scaleBy || 1;
        
        this.elapsedTime += tick;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = this.elapsedTime - this.totalTime;
            }
        } else if (this.isDone()) {
            return;
        }
        var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
        var vindex = 0;
        // console.log(this);
        if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
            index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
            vindex++;
        }
        while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
            index -= Math.floor(this.spriteSheet.width / this.frameWidth);
            vindex++;
        }
        var locX = x;
        var locY = y;
        var offset = vindex === 0 ? this.startX : 0;
        if (this.rotatedCache) {
            ctx.drawImage(this.rotatedCache[index], locX, locY);
        } else if (this.spriteSheet) {
            ctx.drawImage(this.spriteSheet,
                index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                this.frameWidth, this.frameHeight,
                locX, locY,
                this.frameWidth * scaleBy,
                this.frameHeight * scaleBy);
        }
    }
    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }
    isDone() {
        return (this.elapsedTime >= this.totalTime);
    }
}

PlayerCharacterAMDownloads(AM);
MapAMDownloads(AM);

// AM.queueDownload(SCORE_TEXT);
function showMP() {
    let mpForm = document.getElementById('mPDetails');
    mpForm.style.display = 'block';
    mpForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let data = new FormData(mpForm);
        console.log(data.get('mPHost'));
        console.log(data);
        let code;
        if (data.get('mPHost') == 'on') {
            console.log('i am host');
            console.log(data.get('mPName'));
            myHost = new Host(data.get('mPName'));
            myHost.runHost();
            code = myHost.state.code;
        } else {
            console.log('i am player');
            console.log(data.get('mPName'));
            code = data.get('roomCode');
        }
        myPlayer = new Player(data.get('mPName'), code);
        myPlayer.joinGame();
        SCENE_MANAGER.game.peer = myPlayer;
    });
}

function hideMP() {
    document.getElementById('mPDetails').style.display = 'none';
}

function showRoom() {
    document.getElementById('roomCode').style.display = 'block';
}

function hideRoom() {
    document.getElementById('roomCode').style.display = 'none';
}


AM.downloadAll(function () {
    let canvas = document.getElementById("gameWorld");
    let ctx = canvas.getContext("2d");
    let gameEngine = new GameEngine(MUSIC_MANAGER);
    gameEngine.init(ctx);
    SCENE_MANAGER.game = gameEngine;
    console.log(myPlayer);
    SCENE_MANAGER.startScene();
    console.log("All Done!");
});