const WebSocket = require('ws');

const MAX_PEERS = 100;
const MAX_LOBBIES = 5;
const PORT = 9090;

const wss = new WebSocket.Server({ port: PORT });
const clients = new Map();

class Client {
    constructor(id, ws) {
        this.id = id;
        this.ws = ws;
        /*
        this.lobby = '';
        // Close connection after 1 sec if client has not joined a lobby
        this.timeout = setTimeout(() => {
            if (!this.lobby) {
                ws.close(4000, "Have not joined lobby yet");
            }
        }, NO_LOBBY_TIMEOUT);
        */
    }
}

wss.on('connection', function connection(ws) {
    if (clients.size >= MAX_PEERS) {
        ws.close(4000, "Too many peers connected");
        return;
    }
    const id = uuidv4();
    const client = new Peer(id, ws);
    clients.set(client);
    
    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.on("close", function close(code, data) {
        const reason = data.toString();
        peersCount--;
        console.log(`Client ${client.id} closed `
            + `with reason ${code}: ${reason}`);
        clients.delete(client);
        console.log('client disconected');
    });

    //ws.send('something');
});
