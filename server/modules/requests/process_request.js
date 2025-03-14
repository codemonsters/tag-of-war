const { processLoginRequest } = require("./process_login_request.js");
const { processCreateRoomRequest } = require("./process_create_room_request.js");

function processRequest(msg, peer, db) {
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
            processLoginRequest(json, peer, db);
            break;
        case 'create_room':
            console.log('Peer wants to create a room');
            processCreateRoomRequest(json, peer, db);
            break;
        default:
            console.error(`Unknown command: ${cmd}`);
    }
    //const type = typeof (json['type']) === 'number' ? Math.floor(json['type']) : -1;
}

module.exports = { processRequest };
