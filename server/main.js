const PORT = 9090;

const WebSocket = require('ws');
const wss = new WebSocket.Server({port: PORT});
const { NotImplemented, ProtocolError } = require("./modules/errors.js");
const { getFirstNonLocalIPAddress } = require("./modules/aux.js");

const { server } = require("./modules/server.js");

wss.on('connection', function connection(ws) {
    try {
        peer = server.connect_peer_by_websocket(ws);
        console.log(`Peer connected (id: ${peer.id})`);
    } catch(err) {
        ws.close(4000, err.message);
        console.log(`Connection refused (${err.message})`);
        return;
    }
    
    ws.on('message', function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        try {
            server.processRequest(message, peer);
        } catch (ex) {
            if (ex instanceof ProtocolError) {
                const code = ex.code || 4000;
                console.log(`Error parsing message from peer id ${peer.id}: ${message}\n`);
                ws.close(code, ex.message);
            } else {
                throw ex;
            }
        }
    });

    ws.on("close", function close(code, data) {
        console.log(`Peer disconnected (id: ${peer.id}, code: ${code}, reason: ${data.toString()})`);
        server.disconnect_peer(peer);
    });
});

console.log("Server listening on IP address %s and port %d (ws://%s:%d)", getFirstNonLocalIPAddress(), PORT, getFirstNonLocalIPAddress(), PORT);

// TODO: llamar a db.close() cuando se detiene el servidor
