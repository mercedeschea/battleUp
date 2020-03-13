
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
    constructor(name){
        const players = {};
        players[name] = {
            host: true,
            ready: false,
            input: null,
            gloopColor: null,
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

        this.playersToArray = () => {
            const playersArr = [];
            for (const playerName in this.state.players){
            playersArr.push({
                name: playerName,
                input: this.state.players[playerName].input,
                peer: this.state.players[playerName].peer,
                ready: this.state.players[playerName].ready,
                gloopColor: this.state.players[playerName].gloopColor
            });
            }
            return playersArr;
        }

        this.setColor = (color) => {
          this.state.players[this.hostName].gloopColor = color;
        }


        this.sendReady = (ready) => {
          this.handleReady(this.hostName, ready);
        }

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
            if(peer.connected) peer.send(JSON.stringify(obj));
            }
        }

        this.broadcastPlayers = () => {
        this.broadcast({
            type: 'players',
            players: this.playersToArray().map((e) => {
            return {
                name: e.name,
                ready: e.ready,
                gloopColor: e.gloopColor
            }
            })
        })
        }
        this.handleColorChange = (name, color) => {
          console.log('sending a color change', name, color);
          this.state.players[name].gloopColor = color;
          this.state.players[name].ready = true;
          this.broadcastPlayers();
          SCENE_MANAGER.updateStartScreenPlayers(this.playersToArray().map((e) => {
            return {
                name: e.name,
                ready: e.ready,
                gloopColor: e.gloopColor
            }
          }));
        }
        this.handleData = (playerName, data) => {
          // console.log(playerName, data);
        switch(data.type){
            case 'ready':
            this.handleReady(playerName, data.ready);
            break;
            case 'colorChange':
            console.log('got a color change', data.players);
            this.handleColorChange(playerName, data.gloopColor);
            break;
            case 'gameUpdate':
            // this.handleInput(playerName, data.input);
            this.game.updateOthers(playerName, data);
            break;
            case 'connected':
            this.handleConnected(playerName);
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
            playerListDisplay.innerHTML += player.name + '\n';
        // Workaround for https://github.com/feross/simple-peer/issues/178
        this.broadcastPlayers();
        }
        
        this.tryToStartGame = () => {
          let playerCount = 0;
            const playersReady = [];
            for(const playerName in this.state.players){
                playerCount++;
                playersReady.push(this.state.players[playerName].ready);
            }
            if(playerCount > 0 && playersReady.every(e => e === true)){
              // We have enough players and they are all ready
              this.state.gameStarted = true;
              let thisGloopDetails = {name:this.hostName, gloopColor:this.state.players[this.hostName].color};
              let otherGloopDetails = this.playersToArray().filter((e) => e.name !== this.hostName).map((e) => {
                return {
                    name: e.name,
                    gloopColor: e.gloopColor
                }
              });
              this.game.active = true;
              this.game.startMP(thisGloopDetails, otherGloopDetails);
              this.game.start();
              // Send start game to all peers
              this.broadcast({type: 'startGame'});

              // Delete the room
              DATABASE.ref('/rooms/'+this.state.code).remove();
          } else if (SCENE_MANAGER.scene === 'start'){
            SCENE_MANAGER.startScene.hostWaitForPlayerColors()
          }
        }

        this.handleReady = (name, ready) => {
            const p = this.copyPlayers();
            p[name].ready = ready;
            this.state.players = p;
            // Update players of everyone's status
            this.broadcastPlayers();

            // After updating the players ready status, check if the game should start
            let playerCount = 0;
            const playersReady = [];
            for(const playerName in this.state.players){
                playerCount++;
                playersReady.push(this.state.players[playerName].ready);
            }
            if(playerCount > 0 && playersReady.every(e => e === true)){
                // We have enough players and they are all ready
                this.state.gameStarted = true;
                this.game.startMP(GLOOP_SHEET_PATHS_PURPLE);
                // Send start game to all peers
                this.broadcast({type: 'startGame'});

                // Delete the room
                DATABASE.ref('/rooms/'+this.state.code).remove();
            }
        }
    }
    runHost() {
        getOpenRoom().then((code) => {
            // Display room code
            this.state.code = code;
            console.log(this);
            console.log(code);
            // Players signaling
            DATABASE.ref('/rooms/'+code+'/players').on('child_added', ({key: playerName}) => {
                // Create Peer channel
                const peer = new SimplePeer({config: PEER_CONFIG});
                console.log(peer);
                console.log('new peer connected');
                // Upload Host signals
                const signalDataRef = DATABASE.ref('/rooms/'+code+'/host/'+playerName);
                peer.on('signal', (signalData) => {
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
                input: false
            }
            this.state.players = playersCopy;
            
            this.broadcastPlayers();

            // Listen for player singnaling data
            const playerRef = DATABASE.ref('/rooms/'+code+'/players/'+playerName);
            playerRef.on('child_added', (res) => peer.signal(JSON.parse(res.val().data)));

            // Listen to messages from player
            peer.on('data', (data) => {
                this.handleData(playerName, JSON.parse(data));
            });

            // Player disconnect
            peer.on('close', () => {
                // Delete local ref to player
                const playersCopy = Object.assign({}, this.state.players);
                delete playersCopy[playerName];
                this.state.players = playersCopy;

                // Delete remote ref to player
                playerRef.remove();

                // Remove callbacks
                playerRef.off('child_added');

                // Delete remote signaling to player
                signalDataRef.remove();

                // Delete peer reference
                peer.destroy();
            });
            });
        });
        }


}
