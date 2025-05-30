const {ProtocolException} = require("../exceptions.js");

function processKickFromCurrentRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in leave current room request", "leave_current_room");
    }
    const username = typeof(data['username']) === 'string' ? data['username'] : '';

    console.log("Kick from current room request received");
    server.kick_username_from_current_room(peer, username);
    peer.ws.send(JSON.stringify({
        'cmd': 'kick_from_current_room',
        'success': true,
        'data': { 'details': `Username "${username}" was kicked from room "${server.get_name_of_room_player_is_in(peer.username)}"`}
    }));
    console.debug(`Username "${username}" was kicked from room "${server.get_name_of_room_player_is_in(peer.username)}"`);
}

module.exports = { processKickFromCurrentRoomRequest };
