const AM = new AssetManager();
const SCENE_MANAGER = new SceneManager();
// const BACKEND_URL = "http://localhost:5000/";
const BACKEND_URL = "https://battleup-backend.herokuapp.com/"
let myPeer;

const PEER_CONFIG = {"username": "0671b05553c83272f11d6f6d86f4c85e5de161d85f70d1dee44c11372dfb6dfe", "password": "vW4vD9Cb2wZ9JLM1kCpJinQZP19ivrowC9BHxQzkIL0=",
 "iceServers": [{"urls": "stun:global.stun.twilio.com:3478?transport=udp"}, 
 {"username": "0671b05553c83272f11d6f6d86f4c85e5de161d85f70d1dee44c11372dfb6dfe", "urls": "turn:global.turn.twilio.com:3478?transport=udp", "credential": "vW4vD9Cb2wZ9JLM1kCpJinQZP19ivrowC9BHxQzkIL0="},
  {"username": "0671b05553c83272f11d6f6d86f4c85e5de161d85f70d1dee44c11372dfb6dfe", "urls": "turn:global.turn.twilio.com:3478?transport=tcp", "credential": "vW4vD9Cb2wZ9JLM1kCpJinQZP19ivrowC9BHxQzkIL0="},
   {"username": "0671b05553c83272f11d6f6d86f4c85e5de161d85f70d1dee44c11372dfb6dfe", "urls": "turn:global.turn.twilio.com:443?transport=tcp", "credential": "vW4vD9Cb2wZ9JLM1kCpJinQZP19ivrowC9BHxQzkIL0="}]};
// let myPlayer;
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
    let mPForm = document.getElementById('mPDetails');
    let mPReady = document.getElementById('mPReady');
    mPForm.style.display = 'block';
    mPForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let data = new FormData(mPForm);
        console.log(data.get('mPHost'));
        console.log(data);
        let code;
        if (data.get('mPHost') == 'on') {
            console.log('i am host');
            console.log(data.get('mPName'));
            myPeer = new Host(data.get('mPName'));
            myPeer.runHost();
        } else {
            console.log('i am player');
            console.log(data.get('mPName'));
            code = data.get('roomCode');
            // mPReady.style.display ='block';
            myPeer = new Player(data.get('mPName'), code);
            myPeer.joinGame();
        }
        if (!code) {
            setTimeout(async function () {
                //STOPT THE FUNCTION UNTIL CONDITION IS CORRECT
                while (!myPeer.state.code) {
                    console.log('adelay');
                    await __delay__(1000);
                }
                code = myPeer.state.code;
                document.getElementById('roomCodeDisplay').innerHTML = 'Your code is: ' + code;
            }, 1);
        } else {
            document.getElementById('roomCodeDisplay').innerHTML = 'Your code is: ' + code;
        }
        // mPReady.style.display ='block';
        SCENE_MANAGER.game.peer = myPeer;
        SCENE_MANAGER.game.multiplayer = true;
        myPeer.game = SCENE_MANAGER.game;
        myPeer.game.myName = data.get('mPName');
        myPeer.game.draw();
    });
    mPReady.addEventListener('submit', function (e) {
        e.preventDefault();
        if(mPReady.readyOn.checked) {
            myPeer.sendReady(true);
        } else {
            myPeer.sendReady(false);
        }
    });
}

//First define some delay function which is called from async function
function __delay__(timer) {
    return new Promise(resolve => {
        timer = timer || 2000;
        setTimeout(function () {
            resolve();
        }, timer);
    });
};


function hideMP() {
    document.getElementById('mPDetails').style.display = 'none';
    if (SCENE_MANAGER.game) {
        SCENE_MANAGER.game.peer = null;
        SCENE_MANAGER.game.multiplayer = false;
        SCENE_MANAGER.startScreen.updateStartScreenPlayers([]);
    }
}

function showRoom() {
    document.getElementById('roomCode').style.display = 'block';
    if(SCENE_MANAGER.scene === 'start') {
        SCENE_MANAGER.startScreen.playerWaitForHost();
        SCENE_MANAGER.startScreen.draw();
    }
}

function hideRoom() {
    document.getElementById('roomCode').style.display = 'none';

}

//use this to log things that are called every update without ruining your console
function logEverySecond(toLog) {
    if (Date.now() % 1000 < 1) {
        console.log(toLog);
    }
}


AM.downloadAll(function () {
    let canvas = document.getElementById("gameWorld");
    let ctx = canvas.getContext("2d");
    let gameEngine = new GameEngine(MUSIC_MANAGER);
    gameEngine.init(ctx);
    SCENE_MANAGER.game = gameEngine;
    SCENE_MANAGER.startScene();
    console.log("All Done!");
});