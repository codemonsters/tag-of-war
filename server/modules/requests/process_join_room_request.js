//  procesa mensajes json con el campo cmd = 'join_room'

function processJoinRoomRequest(json, peer, db) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        peer.ws.send(JSON.stringify({
            'cmd': 'join_room',
            'success': false,
            'data': {'details': 'Missing data object in join room request'}
        }));
        console.debug("Join room failed: Missing data object")
        return;
    }

    const roomName = typeof(data['room_name']) === 'string' ? data['room_name'] : '';
    if (roomName == '') {
        peer.ws.send(JSON.stringify({
            'cmd': 'join_room',
            'success': false,
            'data': {'details': 'Missing room_name'}
        }));
        console.debug("Join room failed: Missing room name");
        return;
    }

    console.log("Join room request received. Room name = " + roomName);

    if (!peer.username) {
        peer.ws.send(JSON.stringify({
            'cmd': 'join_room',
            'success': false,
            'data': { 'details': 'Please login before joining a room'}
        }));
        console.debug("Join room failed: User did not login before joining a room");
        return;
    }

    // Comprobamos si el nombre de habitación existe
    //TODO: Alex, revisar a partir de aquí!!!
    const rows = db.prepare("SELECT name FROM rooms WHERE name=(?)").all(roomName);
    if (rows.length == 0) {
        // El nombre de habitación no existe
        peer.ws.send(JSON.stringify({
            'cmd': 'join_room',
            'success': false,
            'data': { 'details': 'Room name does not exist'}
        }));
        console.debug("Join room failed: Room name '" + roomName + "' does not exist");
        return;
    }

    // El nombre de habitación existe
    peer.ws.send(JSON.stringify({
        'cmd': 'join_room',
        'success': true,
        'data': { 'details