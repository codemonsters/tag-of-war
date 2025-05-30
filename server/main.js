const PORT = 9090;

const WebSocket = require('ws');
const wss = new WebSocket.Server({port: PORT});
const {ServerBaseException, ProtocolException} = require("./modules/exceptions.js");
const {getFirstNonLocalIPAddress} = require("./modules/aux.js");
const {server} = require("./modules/server.js");

wss.on('connection', function connection(ws, req) {
    try {
        peer = server.connect_peer_by_websocket(ws);
        peer.ip_address = req.socket.remoteAddress.replace('::ffff:', '');
        console.log(`Peer connected (id: ${peer.id}, ip addres: ${peer.ip_address})`);
    } catch(ex) {
        if (ex instanceof ProtocolException) {
            peer.ws.send(JSON.stringify({
                'cmd': ex.cmd,
                'success': false,
                'data': {'details': ex.message}
            }));
        } else if (ex instanceof ServerBaseException) {
            ws.close(4000, ex.message);
            console.log(`Connection refused: ${ex.message}`);
            return;
        } else {
            throw ex;
        }
    }
    
    ws.on('message', function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        try {
            server.processRequest(message, peer);
        } catch (ex) {
            if (ex instanceof ProtocolException) {
                peer.ws.send(JSON.stringify({
                    'cmd': ex.cmd,
                    'success': false,
                    'data': {'details': ex.message}
                }));
                console.log(`Error processing "${ex.cmd}" request from ${peer.id}. Reason: ${ex.message}\n`)
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
