// procesa mensajes json con el campo cmd = 'create_room'
const {ProtocolException} = require("../exceptions.js");

function processCreateRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in create room request", "create_room");
    }

    const roomName = typeof(data['name']) === 'string' ? data['name'] : '';
    console.log("Create room request received. Room name = " + roomName);
    server.create_room(peer, roomName);
    peer.ws.send(JSON.stringify({
        'cmd': 'create_room',
        'success': true,
        'data': { 'details': 'Room created successfully', 'room_name': roomName}
    }));
    console.debug("Room '" + roomName + "' created successfully");
}

module.exports = { processCreateRoomRequest };
