const {ProtocolException} = require("../exceptions.js");

function processKickFromCurrentRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in leave current room request", "leave_current_room");
    }
    const username = typeof(data['username']) === 'string' ? data['username'] : '';

    console.log("Kick from current room request received");
    server.kick_from_current_room(username);
    peer.ws.send(JSON.stringify({
        'cmd': 'kick_from_current_room',
        'success': true,
        'data': { 'details': 'Anonymous login sucessful'}
    }));
    console.debug(`Player "${username}" was kicked from room  by "${peer.username}" from room "${server._current_room_name_of(peer.username)}"`);
}

module.exports = { processKickFromCurrentRoomRequest };
