//based on this project https://dev.to/rynobax_7/creating-a-multiplayer-game-with-webrtc
const ROOM_CODE_OPTS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function generateRoomCode() {
  let code = '';
  for(let i=0; i<4; i++){
    const ndx = Math.floor(Math.random() * ROOM_CODE_OPTS.length);
    code += ROOM_CODE_OPTS[ndx];
  }
  return code;
}

function createRoom(room,){
  return room.set({
    'createdAt': firebase.database.ServerValue.TIMESTAMP
  });
}

function getOpenRoom(){
  return new Promise((resolve, reject) => {
    const code = generateRoomCode();
    const room = DATABASE.ref('rooms/'+code);
    room.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      if (roomData == null) {
        // Room does not exist
        createRoom(room).then(resolve(code));
      } else {
        const roomTimeout = 1800000; // 30 min
        const now = Date.now();
        const msSinceCreated = now - roomData.createdAt;
        if (msSinceCreated > roomTimeout) {
          // It is an old room so wipe it and create a new one
          room.remove().then(() => createRoom(room)).then(resolve(code));
        } else {
          // The room is in use so try a different code
          resolve(getOpenRoom(DATABASE));
        }
      }
    })
  });
}

class Host {
    constructor(name) {
        const players = {};
        players[name] = {
            host: true,
            ready: false,
            input: null,
            gloopColor: null,
            number:1,
            // Peer object with blank methods so I don't have to
            // filter when I iterate over players
            peer: {
            send: () => {}
            }
        }
        this.state = {
            players: players,
            code: null,
            gameStarted: false
        }
        this.game = null;
        this.hostName = name;
        this.copyPlayers = () => Object.assign({}, this.state.players);
        this.playerNumbers = [true, true, false, false, false];
        this.playersToArray = () => {
            const playersArr = [];
            for (const playerName in this.state.players){
            playersArr.push({
                name: playerName,
                input: this.state.players[playerName].input,
                peer: this.state.players[playerName].peer,
                ready: this.state.players[playerName].ready,
                gloopColor: this.state.players[playerName].gloopColor,
                number:this.state.players[playerName].number
            });
            }
            return playersArr;
        }

        this.handleGameUpdate = (playerName, data) => {
          this.broadcast(data);
          // console.log(playerName, data);
          this.game.updateOtherGloop(playerName, data);
        }

        // this.sendReady = (ready) => {
        //   this.handleReady(this.hostName, ready);
        // }

        this.getPlayersForGame = () => {
            // Don't send peer info
            const players = {};
            for(const playerName in this.state.players) {
            players[playerName] = {
                input: this.state.players[playerName].input
            }
            }
            return players;
        }

        // Send message to all players
        this.broadcast = (obj) => {
            for(const playerName in this.state.players){
            const peer = this.state.players[playerName].peer;
            // console.log(this.state.players[playerName].peer);
            if(peer.connected && playerName !== obj.name) peer.send(JSON.stringify(obj));
            }
        }

        this.broadcastPlayers = () => {
        this.broadcast({
            type: 'players',
            players: this.playersToArray().map((e) => {
            return {
                name: e.name,
                ready: e.ready,
                gloopColor: e.gloopColor,
                number: e.number
            }
            })
        })
        }

        this.handleColorChange = (name, color, ready) => {
          this.state.players[name].gloopColor = color;
          this.state.players[name].ready = ready;
          if (!this.state.players[name].number) {
            this.state.players[name].number = this.playerNumbers.findIndex(number => !number);
            console.log(this.state.players[name].number);
          }
          this.broadcastPlayers();
          SCENE_MANAGER.updateStartScreenPlayers(this.playersToArray().map((e) => {
            return {
                name: e.name,
                ready: e.ready,
                gloopColor: e.gloopColor,
                number: e.number
            }
          }));
        }
        this.handleData = (playerName, data) => {
          // console.log(playerName, data);
        switch(data.type){
            // case 'ready':
            // this.handleReady(playerName, data.ready);
            // break;
            case 'colorChange':
            this.handleColorChange(playerName, data.gloopColor, data.ready);
            break;
            case 'gameUpdate':
            this.handleGameUpdate(playerName, data);
            break;
            case 'connected':
            this.handleConnected(playerName);
            break;
            case 'stillHere':
            this.state.players[playerName].lastCheckIn = Date.now();
            break;
            default:
            throw Error('Unkown input ', data.type);
        }
        return;
        }

        // // Input from players
        // this.handleInput = (playerName, input) => {
        // const playersCopy = this.copyPlayers();
        // for (const key in input) {
        //     playersCopy[playerName].input[key] = input[key];
        // }
        // this.state.players = playersCopy;
        // }

        // // Input from host
        // OnInputChange((input) => {
        //   this.handleInput(this.hostName, input);
        // });

        this.handleConnected = (playerName) => {
          let playerListDisplay = document.getElementById('playerList');
          playerListDisplay.innerHTML = "Player list: ";
          let playerNames = Object.keys(this.state.players);
          for (const playerName of playerNames) {
              playerListDisplay.innerHTML += playerName + ', ';
          }
          playerListDisplay.innerHTML = playerListDisplay.innerHTML.slice(0, -2);
          let that = this;
          this.state.players[playerName].lastCheckIn = Date.now();
          this.state.players[playerName].intervalID = setInterval(() => {
              let currentTime = Date.now();
              if(currentTime - that.state.players[playerName].lastCheckIn > 3000) {
                if (playerName !== that.hostName)
                  that.removePlayer(playerName, signalDataRef, playerRef, peer);
              }
            }, 5000);
        // Workaround for https://github.com/feross/simple-peer/issues/178
        this.broadcastPlayers();
        }


        this.tryToStartGame = () => {
          console.log(this.state.players);
          let playerCount = 0;
            const playersReady = [];
            for(const playerName in this.state.players){
                playerCount++;
                playersReady.push(this.state.players[playerName].ready);
            }
            if(playerCount > 1 && playersReady.every(e => e === true)){
              // We have enough players and they are all ready
              this.state.gameStarted = true;
              for(const playerName in this.state.players){
                this.state.players[playerName].ready = false;
              }
              let thisGloopDetails = {name:this.hostName, gloopColor:this.state.players[this.hostName].gloopColor,
                 number:this.state.players[this.hostName].number};
              let otherGloopDetails = this.playersToArray().filter((e) => e.name !== this.hostName).map((e) => {
                return {
                    name: e.name,
                    gloopColor: e.gloopColor,
                    number: e.number
                }
              });
              console.log(thisGloopDetails, otherGloopDetails)
              this.game.startMP(thisGloopDetails, otherGloopDetails);
              // Send start game to all peers
              this.broadcast({type: 'startGame'});

              // Delete the room
              DATABASE.ref('/rooms/'+this.state.code).remove();
          } else if (SCENE_MANAGER.game.scene === 'start') {
            if (playerCount === 1) {
              console.log('need more players');
              SCENE_MANAGER.startScreen.hostWaitForPlayers();
            } else {
              console.log('someone needs to choose a color');
              SCENE_MANAGER.startScreen.hostWaitForPlayerColors();
            }
          }
        }
      }        
    runHost() {
        getOpenRoom().then((code) => {
            // Display room code
            this.state.code = code;
            console.log(this);
            console.log(code);
            DATABASE.ref('/rooms/'+code+'/players'+this.hostName).set({occupied:true});
            // Players signaling
            DATABASE.ref('/rooms/'+code+'/players').on('child_added', ({key: playerName}) => {
                // Create Peer channel
                const peer = new SimplePeer({config: PEER_CONFIG});
                console.log(peer);
                console.log('new peer connected');
                // Upload Host signals
                const signalDataRef = DATABASE.ref('/rooms/'+code+'/host/'+playerName);
                peer.on('signal', (signalData) => {
                  console.log('sending host signal');
                    const newSignalDataRef = signalDataRef.push();
                    newSignalDataRef.set({
                    data: JSON.stringify(signalData)
                    });
                });
            

            
            // Add player to player list
            // Use fake peer so broadcasts don't fail
            const playersCopy = this.copyPlayers();
            playersCopy[playerName] = {
                peer: peer,
                //_peer: peer,
                ready: false,
                input: false,
                errors:0,
                lastCheckIn:Date.now()
            }
            this.state.players = playersCopy;
            
            // this.broadcastPlayers();

            // Listen for player singnaling data
            const playerRef = DATABASE.ref('/rooms/'+code+'/players/'+playerName);
            playerRef.on('child_added', (res) => {
            console.log('signal received');
            peer.signal(JSON.parse(res.val().data));
            });

            // Listen to messages from player
            peer.on('data', (data) => {
                this.handleData(playerName, JSON.parse(data));
            });

            peer.on('error', () => {
              let errorCount = ++this.state.players[playerName].errors
              console.log(errorCount);
              if (errorCount > 3) {
                this.removePlayer (playerName, signalDataRef, playerRef, peer)
              }
            });

            // Player disconnect
            peer.on('close', () => {
              this.removePlayer (playerName, signalDataRef, playerRef);
            });
            });

        });
        }

        removePlayer (playerName, signalDataRef, playerRef, peer){
            clearInterval(this.state.players[playerName].intervalID);
            // Player disconnect
              // Delete local ref to player
              if(this.game.gloops[playerName])
                this.game.gloops[playerName].removeFromWorld = true;
              const playersCopy = Object.assign({}, this.state.players);
              this.playerNumbers[this.state.players[playerName].number] = false;
              delete playersCopy[playerName];
              this.state.players = playersCopy;
              console.log('should delete player', this.state.players);
              // Delete remote ref to player
              playerRef.remove();

              // Remove callbacks
              playerRef.off('child_added');

              // Delete remote signaling to player
              signalDataRef.remove();

              // Delete peer reference
              peer.destroy();
          }

}
