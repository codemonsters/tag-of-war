const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// Database schema
const DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password BLOB
  );
`;

// SQLite database connection
const db = new sqlite3.Database('./users.db');
db.serialize(() => {
    db.run(DB_SCHEMA);
});

// User registration and login functions
function registerUser(username, password) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest();
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, username, hashedPassword, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

function loginUser(username, password) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, username, password, function (err, user) {
            if (err) {
                reject(err);
            } else if (!user) {
                resolve(null); // Invalid credentials
            } else {
                resolve(user.id); // Valid credentials
            }
        });
    });
}

const MAX_PEERS = 4096;
const MAX_LOBBIES = 1024;
const PORT = 9080;
const ALFNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const NO_LOBBY_TIMEOUT = 1000;
const SEAL_CLOSE_TIMEOUT = 10000;
// const PING_INTERVAL = 10000;

const CMD = {
    JOIN: 0,
    ID: 1,
    PEER_CONNECT: 2,
    PEER_DISCONNECT: 3,
    OFFER: 4,
    ANSWER: 5,
    CANDIDATE: 6,
    SEAL: 7,
};

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function randomId() {
    return Math.abs(new Int32Array(crypto.randomBytes(4).buffer)[0]);
}

function randomSecret() {
    let out = '';
    for (let i = 0; i < 16; i++) {
        out += ALFNUM[randomInt(0, ALFNUM.length - 1)];
    }
    return out;
}

function ProtoMessage(type, id, data) {
    return JSON.stringify({
        'type': type,
        'id': id,
        'data': data || '',
    });
}

const wss = new WebSocket.Server({ port: PORT });

class ProtoError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

class Peer {
    constructor(id, ws) {
        this.id = id;
        this.ws = ws;
        this.lobby = '';
        // Close connection after 1 sec if client has not joined a lobby
        this.timeout = setTimeout(() => {
            if (!this.lobby) {
                ws.close(4000, "Have not joined lobby yet");
            }
        }, NO_LOBBY_TIMEOUT);
    }
}

// class Peer {
//     constructor(id, ws, userId) {
//         this.id = id;
//         this.userId = userId;
//         this.ws = ws;
//         this.lobby = '';
//         // Close connection after 1 sec if client has not joined a lobby
//         this.timeout = setTimeout(() => {
//             if (!this.lobby) {
//                 ws.close(4000, "Have not joined lobby yet");
//             }
//         }, NO_LOBBY_TIMEOUT);
//     }
// }

class Lobby {
    constructor(name, host, mesh) {
        this.name = name;
        this.host = host;
        this.mesh = mesh;
        this.peers = [];
        this.sealed = false;
        this.closeTimer = -1;
    }

    getPeerId(peer) {
        if (this.host === peer.id) {
            return 1;
        }
        return peer.id;
    }

    join(peer) {
        const assigned = this.getPeerId(peer);
        peer.ws.send(ProtoMessage(CMD.ID, assigned, this.mesh ? 'true' : ''));
        this.peers.forEach((p) => {
            p.ws.send(ProtoMessage(CMD.PEER_CONNECT, assigned));
            peer.ws.send(ProtoMessage(CMD.PEER_CONNECT, this.getPeerId(p)));
        });
        this.peers.push(peer);
    }

    leave(peer) {
        const idx = this.peers.findIndex((p) => peer === p);
        if (idx === -1) {
            return false;
        }
        const assigned = this.getPeerId(peer);
        const close = assigned === 1;
        this.peers.forEach((p) => {
            if (close) { // Room host disconnected, must close.
                p.ws.close(4000, "Room host has disconnected");
            } else { // Notify peer disconnect.
                p.ws.send(ProtoMessage(CMD.PEER_DISCONNECT, assigned));
            }
        });
        this.peers.splice(idx, 1);
        if (close && this.closeTimer >= 0) {
            // We are closing already.
            clearTimeout(this.closeTimer);
            this.closeTimer = -1;
        }
        return close;
    }

    seal(peer) {
        // Only host can seal
        if (peer.id !== this.host) {
            throw new ProtoError(4000, "Only host can seal the lobby");
        }
        this.sealed = true;
        this.peers.forEach((p) => {
            p.ws.send(ProtoMessage(CMD.SEAL, 0));
        });
        console.log(`Peer ${peer.id} sealed lobby ${this.name} `
            + `with ${this.peers.length} peers`);
        this.closeTimer = setTimeout(() => {
            // Close peer connection to host (and thus the lobby)
            this.peers.forEach((p) => {
                p.ws.close(1000, "Seal complete");
            });
        }, SEAL_CLOSE_TIMEOUT);
    }
}

const lobbies = new Map();
let peersCount = 0;

function joinLobby(peer, pLobby, mesh) {
    let lobbyName = pLobby;
    if (lobbyName === '') {
        if (lobbies.size >= MAX_LOBBIES) {
            throw new ProtoError(4000, "Too many lobbies open, disconnecting");
        }
        // Peer must not already be in a lobby
        if (peer.lobby !== '') {
            throw new ProtoError(4000, "Already in a lobby");
        }
        lobbyName = randomSecret();
        lobbies.set(lobbyName, new Lobby(lobbyName, peer.id, mesh));
        console.log(`Peer ${peer.id} created lobby ${lobbyName}`);
        console.log(`Open lobbies: ${lobbies.size}`);
    }
    const lobby = lobbies.get(lobbyName);
    if (!lobby) {
        throw new ProtoError(4000, "Lobby does not exist");
    }
    if (lobby.sealed) {
        throw new ProtoError(4000, "Lobby is sealed");
    }
    peer.lobby = lobbyName;
    console.log(`Peer ${peer.id} joining lobby ${lobbyName} `
        + `with ${lobby.peers.length} peers`);
    lobby.join(peer);
    peer.ws.send(ProtoMessage(CMD.JOIN, 0, lobbyName));
}

function parseMsg(peer, msg) {
    let json = null;
    try {
        json = JSON.parse(msg);
    } catch (e) {
        throw new ProtoError(4000, "Invalid message format");
    }

    const type = typeof (json['type']) === 'number' ? Math.floor(json['type']) : -1;
    const id = typeof (json['id']) === 'number' ? Math.floor(json['id']) : -1;
    const data = typeof (json['data']) === 'string' ? json['data'] : '';

    if (type < 0 || id < 0) {
        throw new ProtoError(4000, "Invalid message format");
    }

    // Lobby joining.
    if (type === CMD.JOIN) {
        joinLobby(peer, data, id === 0);
        return;
    }

    if (!peer.lobby) {
        throw new ProtoError(4000, "Not in a lobby");
    }
    const lobby = lobbies.get(peer.lobby);
    if (!lobby) {
        throw new ProtoError(4000, "Server error, lobby not found");
    }

    // Lobby sealing.
    if (type === CMD.SEAL) {
        lobby.seal(peer);
        return;
    }

    // Message relaying format:
    //
    // {
    //   "type": CMD.[OFFER|ANSWER|CANDIDATE],
    //   "id": DEST_ID,
    //   "data": PAYLOAD
    // }
    if (type === CMD.OFFER || type === CMD.ANSWER || type === CMD.CANDIDATE) {
        let destId = id;
        if (id === 1) {
            destId = lobby.host;
        }
        const dest = lobby.peers.find((e) => e.id === destId);
        // Dest is not in this room.
        if (!dest) {
            throw new ProtoError(4000, "Invalid destination");
        }
        dest.ws.send(ProtoMessage(type, lobby.getPeerId(peer), data));
        return;
    }
    throw new ProtoError(4000, "Invalid command");
}

wss.on('connection', (ws) => {
    if (peersCount >= MAX_PEERS) {
        ws.close(4000, "Too many peers connected");
        return;
    }
    peersCount++;
    const id = randomId();
    const peer = new Peer(id, ws);
    ws.on('message', function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        try {
            parseMsg(peer, message);
        } catch (e) {
            const code = e.code || 4000;
            console.log(`Error parsing message from ${id}:\n${message}`);
            ws.close(code, e.message);
        }
    });
    ws.on('close', function close(code, data) {
        const reason = data.toString();
        peersCount--;
        console.log(`Connection with peer ${peer.id} closed `
            + `with reason ${code}: ${reason}`);
        if (peer.lobby && lobbies.has(peer.lobby)
            && lobbies.get(peer.lobby).leave(peer)) {
            lobbies.delete(peer.lobby);
            console.log(`Deleted lobby ${peer.lobby}`);
            console.log(`Open lobbies: ${lobbies.size}`);
            peer.lobby = '';
        }
        if (peer.timeout >= 0) {
            clearTimeout(peer.timeout);
            peer.timeout = -1;
        }
    });
    ws.on('error', (error) => {
        console.error(error);
    });
});
