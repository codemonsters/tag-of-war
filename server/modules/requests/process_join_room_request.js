//  procesa mensajes json con el campo cmd = 'join_room'
const {ProtocolException} = require("../exceptions.js");

function processJoinRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in join room request", "join_room");
    }

    const roomName = typeof(data['name']) === 'string' ? data['name'] : '';
    console.log("Join room request received. Room name = " + roomName);
    server.join_room(peer, roomName);
    peer.ws.send(JSON.stringify({
        'cmd': 'join_room',
        'success': true,
        'data': { 'details': 'Room joined successfully', 'room_name': roomName}
    }));
    // Enviamos un mensaje a los otros jugadores de la habitación informando sobre la entrada del jugador actual
    room_peers = server.get_room_peers(roomName);
    for (p in room_peers) {
        if (p.username && p.username != peer.username) {
            p.ws.send(JSON.stringify({
                'cmd': 'player_joined_current_room',
                'data' : {
                    'username': peer.username
                }
            }));
        }
    }
};

module.exports = { processJoinRoomRequest };
