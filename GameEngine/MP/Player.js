class Player {
    constructor(name, code) {
        this.state = {
        code: code,
        name: name,
        connected: false,
        connecting: false,
        gameStarted: false,
        error: '',
        database: DATABASE,
        host: null,
        players: [],
        gameState: {
            sprites: []
        }
    }

    this.peer = null;

    this.broadcast = (obj) => {
        this.peer.send(JSON.stringify(obj));
    }

    this.sendReady = (ready) => {
        this.broadcast({
            type: 'ready',
            ready: ready
        });
    }
  
    this.handleData = (data) => {
        switch(data.type){
        case 'startGame':
            this.state.gameStarted = true;
            break;
        case 'players':
            this.state.players = data.players;
            break;
        case 'gameUpdate':
            console.log(this.data);
            this.state.gameState = data.gameState;
            break;
        default:
            throw Error('Unknown input ', data.type);
        }
        return;
    }
  
    //   this.trackInputs = () => {
    //     OnInputChange((input) => {
    //       this.broadcast({
    //         type: 'input',
    //         input: input
    //       })
    //     });
    //   }
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
            return;
        } else {
        // Store reference to peer
        const peer = new SimplePeer({initiator: true});
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

        // Connecting
        peer.on('connect', () => {
            
            // The connection is established, so disconnect from firebase
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
            // TODO: Allow another host to join and continue game?
          });
        }
        })
    }
}