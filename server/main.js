const PORT = 9090;
const SQLITE_FILENAME = "database.sqlite"
const MAX_PEERS = 100;
//const MAX_LOBBIES = 5;

const BetterSqlite3 = require('better-sqlite3');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const wss = new WebSocket.Server({port: PORT});
const peers = new Map();
const fs = require('fs');

// initialize database
if (fs.existsSync(SQLITE_FILENAME)) {
    create_db_schema = false;
} else {
    create_db_schema = true;
}

const db = new BetterSqlite3(SQLITE_FILENAME);
if (create_db_schema) {
    // creamos las tablas de la base de datos
    db.prepare("CREATE TABLE active_players (id_player INTEGER PRIMARY KEY)").run();
    db.prepare("CREATE TABLE profiles (id_player INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(8) NOT NULL UNIQUE, email VARCHAR(30) UNIQUE, password VARCHAR(32), last_connection_timestamp DATETIME NOT NULL, account_creation_timestamp DATETIME, account_verified BOOLEAN)").run();
}
db.prepare("DELETE FROM active_players").run();
db.prepare("DELETE FROM profiles WHERE email=''").run();

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

// procesa mensajes json que tienen el campo cmd = 'login'
function processLoginRequest(peer, json) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        //throw new ProtocolError(4000, `Missing data object while parsing a login request`);
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': {'details': 'Missing data object in login request'}
        }));
        return;
    }

    const username = typeof(data['username']) === 'string' ? data['username'] : '';
    const password = typeof(data['password']) === 'string' ? data['password'] : '';
    if (username == '') {
        //throw new ProtocolError(4000, `Missing username while parsing a login request`);
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': {'details': 'Missing username'}
        }));
        return;
    } else if (['admin', 'administrator', 'administrador', 'codemonsters', 'guest', 'root'].includes(username)) {
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': { 'details': 'Username not allowed'}
        }));
        console.debug("Login failed: Username '" + username + "' not allowed");
        return;    
    } else if (username.length > 8 || !/^[a-zA-Z0-9ñÑ]+$/.test(username)) {
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': { 'details': 'Username format not allowed'}
        }));
        console.debug("Login failed: Username '" + username + "' format not allowed");
        return;
    }

    if (password == '') {
        // Login como invitado
        console.log("Guest login request received. Username = " + data.username);
        // Comprobamos si el nombre de usuario que desea está disponible
        const rows = db.prepare("SELECT username FROM profiles WHERE username=(?)").all(username);
        console.log("Número de usuarios con ese nombre: " + rows.length);
        if (rows.length > 0) {
            // El nombre de usuario estaba ocupado
            peer.ws.send(JSON.stringify({
                'cmd': 'logged_in',
                'success': false,
                'data': { 'details': 'Username already taken'}
            }));
            console.debug("Anonymous login failed: Username '" + username + "' already taken");
        } else {
            // El nombre de usuario estaba disponible
            db.prepare("INSERT INTO profiles (username, last_connection_timestamp) VALUES (?, ?)").run(username, Date.now());
            peer.ws.send(JSON.stringify({
                'cmd': 'logged_in',
                'success': true,
                'data': { 'details': 'Anonymous login sucessful'}
            }));
            console.debug("Anonymous login successful for username '" + username + "'");
        }
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

// TODO: llamar a db.close() cuando se detiene el servidor
