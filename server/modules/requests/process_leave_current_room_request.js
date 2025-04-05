const {ProtocolException} = require("../exceptions.js");

function processLeaveCurrentRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in leave current room request", "leave_current_room");
    }
    console.log("Leave current room request received");
    server.leave_current_room(peer);
    peer.ws.send(JSON.stringify({
        'cmd': 'leave_current_room',
        'success': true,
        'data': { 'details': 'Anonymous login sucessful'}
    }));
    console.debug("Anonymous login successful for username '" + username + "'");
}

module.exports = { processLeaveCurrentRoomRequest };
