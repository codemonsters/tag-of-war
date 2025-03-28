//  procesa mensajes json con el campo cmd = 'join_room'

function send_error_response(peer, cmd, detaiils) {
    peer.ws.send(JSON.stringify({
        'cmd': cmd,
        'success': false,
        'data': {'details': details}
    }));
    console.debug(cmd + ": " + details);
}

function processJoinRoomRequest(json, peer, db) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        send_error(peer, 'join_room', 'Missing data object in join room request');
        return;
    }

    const roomName = typeof(data['room_name']) === 'string' ? data['room_name'] : '';
    if (roomName == '') {
        send_error_response(peer, 'join_room', 'Missing room_name');
        return;
    }

    console.log("Join room request received. Room name = " + roomName);

    if (!peer.username) {
        send_error_response(peer, 'join_room', 'Please login before joining a room');
        return;
    }

    // Comprobamos si el nombre de habitación existe
    //TODO: Alex, revisar a partir de aquí!!!
    const rows = db.prepare("SELECT name FROM rooms WHERE name=(?)").all(roomName);
    if (rows.length == 0) {
        // El nombre de habitación no existe
        send_error_response(peer, 'join_room', 'Room name does not exist');
        return;
    }

    // El nombre de habitación existe
    peer.ws.send(JSON.stringify({
        'cmd': 'join_room',
        'success': true,
        'data': { 'details': 'Room joined successfully', 'room_name': roomName}
    }));
};

module.exports = { processJoinRoomRequest };
