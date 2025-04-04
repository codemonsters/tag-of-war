_processLoginRequest = require("./process_login_request.js").processLoginRequest;
_processCreateRoomRequest = require("./process_create_room_request.js").processCreateRoomRequest
_processJoinRoomRequest = require("./process_join_room_request.js").processJoinRoomRequest;

function processRequest(msg, peer, server) {
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
            _processLoginRequest(json, peer, server);
            break;
        case 'create_room':
            console.log('Peer wants to create a room');
            _processCreateRoomRequest(json, peer, server);
            break;
        case 'join_room':
            console.log('Peer wants to join a room');
            _processJoinRoomRequest(json, peer, server);
            break;
        default:
            console.error(`Unknown command: ${cmd}`);
    }
    //const type = typeof (json['type']) === 'number' ? Math.floor(json['type']) : -1;
}

module.exports = { processRequest };
