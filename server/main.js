const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const MAX_PEERS = 100;
//const MAX_LOBBIES = 5;
const PORT = 9090;

const wss = new WebSocket.Server({ port: PORT });
const peers = new Map();

class ProtocolError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

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

function parseJsonMsg(peer, msg) {
    let json = null;
    try {
        json = JSON.parse(msg);
    } catch (e) {
        if (e instanceof SyntaxError) {
            throw new ProtocolError(4000, "Message not in JSON format");
        }
    }

    const cmd = typeof(json['cmd']) === 'string' ? json['cmd'] : '';
    switch (cmd) {
        case 'login':
            console.log('Peer wants to log in');
            const data = typeof(json['data']) === 'object' ? json['data'] : null;
            if (data == null) {
                throw new ProtocolError(4000, `Missing data object while parsing a login request`);
            }
            console.log(`data = ${data}`);

            const username = typeof(data['username']) === 'string' ? data['username'] : '';
            const password = typeof(data['password']) === 'string' ? data['password'] : '';
            console.log(`Username = ${username}`);
            if (username == '') {
                throw new ProtocolError(4000, `Missing username while parsing a login request`);
            }

            if (password == '') {
                console.log("TODO: Login como guest");
            } else {
                throw new NotImplemented("Currently only supporting guest log in");
            }
            console.log(data.username);
            break;
        default:
            console.log(`Unknown command: ${cmd}`);
    }

    /*
    const 
    const type = typeof (json['type']) === 'number' ? Math.floor(json['type']) : -1;
    const id = typeof (json['id']) === 'number' ? Math.floor(json['id']) : -1;
    const data = typeof (json['data']) === 'string' ? json['data'] : '';
*/
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
    
    ws.on('message', function message(data, isBinary) {
        //console.log('received: %s', data);
        const message = isBinary ? data : data.toString();
        try {
            parseJsonMsg(peer, message);
        } catch (ex) {
            if (ex instanceof ProtocolError) {
                const code = ex.code || 4000;
                console.log(`Error parsing message from peer id ${id}: ${message}\n`);
                ws.close(code, ex.message);
            } else {
                throw ex;
            }
        }
    });
    ws.send("Pong! (test answer)");

    ws.on("close", function close(code, data) {
        console.log(`Peer disconnected (id: ${peer.id}, code: ${code}, reason: ${data.toString()})`);
        peers.delete(peer);
    });

    //ws.send('something');
});
