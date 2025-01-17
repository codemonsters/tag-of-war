const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const MAX_PEERS = 100;
//const MAX_LOBBIES = 5;
const PORT = 9090;

const wss = new WebSocket.Server({ port: PORT });
const peers = new Map();

class Peer {
    constructor(id, ws) {
        this.id = id;
        this.ws = ws;
        /*
        this.lobby = '';
        // Close connection after 1 second if client has not joined a lobby
        this.timeout = setTimeout(() => {
            if (!this.lobby) {
                ws.close(4000, "Have not joined lobby yet");
            }
        }, NO_LOBBY_TIMEOUT);
        */
    }
}

wss.on('connection', function connection(ws) {
    if (peers.size >= MAX_PEERS) {
        ws.close(4000, "Too many peers connected");
        console.log('Connection refused (too many peeers connected)');
        return;
    }
    const id = uuidv4();
    const peer = new Peer(id, ws);
    peers.set(peer);
    console.log('Peer connected (id: %s)', peer.id);
    ws.on('message', function message(data) {
        console.log('received: %s', data);
        ws.send("Pong! (test answer)");
    });

    ws.on("close", function close(code, data) {
        console.log(`Peer disconnected (id: ${peer.id}, code: ${code}, reason: ${data.toString()})`);
        peers.delete(peer);
    });

    //ws.send('something');
});
