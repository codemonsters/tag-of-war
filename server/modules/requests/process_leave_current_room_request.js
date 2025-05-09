const {ProtocolException} = require("../exceptions.js");

function processLeaveCurrentRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in leave current room request", "leave_current_room");
    }
    console.log("Leave current room request received");

    if (!peer.usermame) {
        throw new ProtocolException("Please login before leaving a room", "leave_current_room");
    }

    let current_room_name = server.get_name_of_room_player_is_in(peer.username);

    let destroy_room = false;
    if (peer.username == server._get_room_owner_username(current_room_name)) {
        destroy_room = true;
    }
    
    let affected_users = server.leave_current_room(peer);
    
    if (!destroy_room) {
        peer.ws.send(JSON.stringify({
            'cmd': 'leave_current_room',
            'success': true,
            'data': { 'name': current_room_name}
        }));
        console.debug(`"${username}" leaved the room "${current_room_name}"`);
    } else {
        for (username in affected_users) {
            peer.ws.send(JSON.stringify({
                'cmd': 'room_destroyed',
                'data' : { 'name': current_room_name }
            }));
        }
        console.debug(`"${current_room_name}" destroyed because "${username}" was the owner and left`);
    }
}

module.exports = { processLeaveCurrentRoomRequest };
