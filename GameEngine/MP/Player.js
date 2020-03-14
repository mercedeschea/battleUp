//based on this project https://dev.to/rynobax_7/creating-a-multiplayer-game-with-webrtc
let INTERVAL_ID;
class Player {
    constructor(name, code) {
        this.state = {
        code: code,
        name: name,
        connected: false,
        connecting: false,
        gameStarted: false,
        error: '',
        gloopColor: null,
        database: DATABASE,
        host: null,
        players: []
    }
    this.game = null;
    this.peer = null;

    this.broadcast = (obj) => {
        this.peer.send(JSON.stringify(obj));
    }

    this.sendReady = (ready) => {
        this.broadcast({
            type: 'ready',
            name:name,
            ready: ready
        });
    }
    
    this.handleColorChange = (name, color, ready) => {
        console.log('sending a color change');
        this.state.gloopColor = color;
        this.broadcast({type:'colorChange', gloopColor:color, name:name, ready:ready});
    }

    this.handleData = (data) => {
        switch(data.type){
        case 'startGame':
            console.log('got them readies');
            this.state.ready = false;
            this.state.gameStarted = true;
            let thisGloopDetails = {name:this.state.name, gloopColor:this.state.gloopColor, number:this.state.number};
            let otherGloopDetails = this.state.players.filter((e) => e.name !== this.state.name).map((e) => {
              return {
                  name: e.name,
                  gloopColor: e.gloopColor,
                  number: e.number
              }
            });
            console.log(thisGloopDetails);
            console.log(otherGloopDetails);
            this.game.startMP(thisGloopDetails, otherGloopDetails);
            break;
        case 'players':
            console.log('got a color change', data.players);
            let playerListDisplay = document.getElementById('playerList');
            playerListDisplay.innerHTML = "Player list: ";
            for (const player of data.players) {
                playerListDisplay.innerHTML += player.name + ', ';
                if (player.name === this.state.name) {
                    this.state.number = player.number;
                }
            }
            playerListDisplay.innerHTML = playerListDisplay.innerHTML.slice(0, -2);
            this.state.players = data.players;
            SCENE_MANAGER.updateStartScreenPlayers(data.players);
            break;
        case 'gameUpdate':
            // console.log(data);
            if (data.name !== this.state.name) {
                this.game.updateOtherGloop(data.name, data);
            }
              
            break;
        default:
            throw Error('Unknown input ', data.type);
        }
        return;
    }
    }
  
    joinGame = () => {
    this.state.error =  '';
    this.state.connecting = true;
    const {code, database, name} = this.state;
    console.log(code, database, name);
    const nameRef = database.ref('/rooms/'+code+'/players/'+name);
    nameRef.once('value').then((data) => {
        const val = data.val();
        if (val) {
        // Name is taken
            this.state.error = 'Name is taken'
            this.state.connecting = false;
            let playerListDisplay = document.getElementById('playerList');
            playerListDisplay.innerHTML = "Please choose a different name!";
            return;
        } else {
        // Store reference to peer
        const peer = new SimplePeer({initiator: true, config: PEER_CONFIG});
        this.peer = peer;
        
        // Sending signal
        peer.on('signal', (signalData) => {
            const newSignalDataRef = nameRef.push();
            newSignalDataRef.set({
            data: JSON.stringify(signalData)
            });
        });

        // Recieving signal
        const hostSignalRef = database.ref('/rooms/'+code+'/host/'+name);
        hostSignalRef.on('child_added', (res) => {
            peer.signal(JSON.parse(res.val().data));
        });

        peer.on('error', (error) =>{
            let playerListDisplay = document.getElementById('playerList');
            playerListDisplay.innerHTML = "An error occured, please refresh and try again."
            showMP();
        });

        // Connecting
        peer.on('connect', () => {
            
            // The connection is established, so disconnect from firebase
            let detailsSubmitButton = document.getElementById('detailsSubmitButton');
            detailsSubmitButton.style.display = 'none'
            if(SCENE_MANAGER.game.scene === 'start')
                SCENE_MANAGER.startScreen.playerWaitForHost();
            database.goOffline();
            console.log('connected');
            // connect event is broken in chrome tabs or something, so this works around it for host
            // https://github.com/feross/simple-peer/issues/178
            setTimeout(() => {
            this.broadcast({
                type: 'connected'
            });
            this.state.connected = true;
            this.state.connecting = false;
            }, 1000);
        });

        // Data
        peer.on('data', (data) => {
            // got a data channel message
            this.handleData(JSON.parse(data));
        });

        // Host disconnect
        peer.on('close', () => {
            // Update UI
            this.state.gameStarted({
                gameStarted: false,
                connected: false,
                error: 'Disconnected from host',
                code: ''
            });
  
            // Reconnect to firebase
            database.goOnline();
  
            // Remove room
            database.ref('/rooms/'+code).remove();
            showMP();
            // TODO: Allow another host to join and continue game?
          });
        let that = this;
        INTERVAL_ID = setInterval(() => {
            that.broadcast({type:'stillHere'});}, 1000);
        }
        })
    }
}