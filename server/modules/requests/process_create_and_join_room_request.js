const {ProtocolException} = require("../exceptions.js");

function processCreateAndJoinRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in create room request", "create_room");
    }
    
    const roomName = typeof(data['room_name']) === 'string' ? data['room_name'] : '';
    console.log("Create room request received. Room name = " + roomName);
    server.create_and_join_room(peer, roomName);
    peer.ws.send(JSON.stringify({
        'cmd': 'create_and_join_room',
        'success': true,
        'data': { 'details': 'Room created successfully', 'room_name': roomName}
    }));
    
    console.debug("Room '" + roomName + "' created successfully");
    // enviamos un mensaje a los clientes logeados informando sobre esto
    for (p in server.peers) {
        if (p.username && p.username != peer.username) {
            p.ws.send(JSON.stringify({
                'cmd': 'new_room_available',
                'data' : {
                    'name': roomName
                }
            }));
        }
    }
}

module.exports = { processCreateAndJoinRoomRequest };
