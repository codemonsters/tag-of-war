const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const MAX_PEERS = 100;
//const MAX_LOBBIES = 5;
const PORT = 9090;

const wss = new WebSocket.Server({ port: PORT });
const peers = new Map();

//import { NotImplemented } from './errors.js';
//import { ProtocolError } from './errors.js';

class ProtocolError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

class NotImplemented extends Error {
    constructor(message) {
        super(message);
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

function getFirstNonLocalIPAddress() {
    const interfaces = require('os').networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

function processLoginRequest(peer, json) {
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
        // Login como invitado
        console.log("Guest login request received. Username = " + data.username);
        peer.ws.send(JSON.stringify({
                        'cmd': 'logged_in',
                        'success': true,
                        'data': {}
                    }));
        console.log("Done");
    } else {
        // Login como usuario registrado
        throw new NotImplemented("Currently only supporting guest log in");
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
    switch(cmd) {
        case 'login':
            console.log('Peer wants to log in');
            processLoginRequest(peer, json);
            break;
        default:
            console.error(`Unknown command: ${cmd}`);
    }

    /*
    const type = typeof (json['type']) === 'number' ? Math.floor(json['type']) : -1;
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
    //ws.send("Pong! (test answer)");

    ws.on("close", function close(code, data) {
        console.log(`Peer disconnected (id: ${peer.id}, code: ${code}, reason: ${data.toString()})`);
        peers.delete(peer);
    });

    //ws.send('something');
});

console.log("Server listening on IP address %s and port %d (ws://%s:%d)", getFirstNonLocalIPAddress(), PORT, getFirstNonLocalIPAddress(), PORT);

// TODO: Echar un vistazo a Knex.js y a https://www.npmjs.com/package/waterline
