//  procesa mensajes json con el campo cmd = 'join_room'

function send_error_response(peer, cmd, details) {
    peer.ws.send(JSON.stringify({
        'cmd': cmd,
        'success': false,
        'data': {'details': details}
    }));
    console.debug(cmd + ": " + details);
}

function processJoinRoomRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        send_error(peer, 'join_room', 'Missing data object in join room request');
        return;
    }

    const roomName = typeof(data['name']) === 'string' ? data['name'] : '';
    if (roomName == '') {
        send_error_response(peer, 'join_room', 'Missing room_name');
        return;
    }

    console.log("Join room request received. Room name = " + roomName);

    try {
        server.join_room(peer, roomName);
        peer.ws.send(JSON.stringify({
            'cmd': 'join_room',
            'success': true,
            'data': { 'details': 'Room joined successfully', 'room_name': roomName}
        }));
    } catch (err) {
        send_error_response(peer, 'join_room', err.message);
        return;
    }
};

module.exports = { processJoinRoomRequest };
