const PORT = 9090;
const MAX_PEERS = 100;
//const MAX_LOBBIES = 5;

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const server = new WebSocket.Server({port: PORT});
const { Peer } = require("./modules/peer.js");
const peers = new Map();
const { NotImplemented, ProtocolError } = require("./modules/errors.js");
const { getFirstNonLocalIPAddress } = require("./modules/aux.js");
const { db } = require("./modules/database.js");
const { processRequest } = require("./modules/requests/process_request.js");

server.on('connection', function connection(ws) {
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
        const message = isBinary ? data : data.toString();
        try {
            processRequest(message, peer, db);
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

    ws.on("close", function close(code, data) {
        console.log(`Peer disconnected (id: ${peer.id}, code: ${code}, reason: ${data.toString()})`);
        peers.delete(peer);
    });
});

console.log("Server listening on IP address %s and port %d (ws://%s:%d)", getFirstNonLocalIPAddress(), PORT, getFirstNonLocalIPAddress(), PORT);

// TODO: llamar a db.close() cuando se detiene el servidor
