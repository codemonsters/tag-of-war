// procesa mensajes json con el campo cmd = 'create_room'
function processCreateRoomRequest(json, peer, db) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        //throw new ProtocolError(4000, `Missing data object while parsing a login request`);
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': {'details': 'Missing data object in create room request'}
        }));
        console.debug("Create room failed: Missing data object")
        return;
    }

    const roomName = typeof(data['room_name']) === 'string' ? data['room_name'] : '';
    if (roomName == '') {
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': {'details': 'Missing room_name'}
        }));
        console.debug("Create room failed: Missing room name");
        return;
    } else if (roomName.length > 32 || !/^[a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ\s]+$/.test(roomName)) {
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': { 'details': 'Room name format not allowed'}
        }));
        console.debug("Create room failed: Room name '" + roomName + "' format not allowed");
        return;
    }

    console.log("Create room request received. Room name = " + data.roomName);

    if (!peer.username) {
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': { 'details': 'Please login before creating a room'}
        }));
        console.debug("Create room failed: User did not login before creating a room");
        return;
    }

    // Comprobamos si el usuario actual no tiene ya creada una habitación
    const rows = db.prepare("SELECT name FROM rooms WHERE admin_player_id=(SELECT player_id FROM profiles WHERE username=(?)").all(peer.username);
    if (rows.length > 0) {
        // El usuario actual ya tiene una habitación
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': { 'details': 'Room name already taken'}
        }));
        console.debug("Create room failed: Room name '" + roomName + "' already taken");
        return;
    }

    // Comprobamos si el nombre de habitación está disponible
    rows = db.prepare("SELECT name FROM rooms WHERE name=(?)").all(roomName);
    if (rows.length > 0) {
        // El nombre de habitación está ocupado
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': { 'details': 'Room name already taken'}
        }));
        console.debug("Create room failed: Room name '" + roomName + "' already taken");
        return;
    }

    // El nombre de habitación está disponible y el usuario actual no tiene ninguna habitación creada previamente
    //const rows = db.prepare("SELECT player_id FROM usernames WHERE username=(?)").all(roomName);
    db.prepare("INSERT INTO rooms (name, admin_player_id) VALUES (?, (SELECT player_id FROM profiles WHERE username=?));").run(roomName, peer.username);
    //db.prepare("INSERT INTO rooms (name, admin_player_id) VALUES (?, ?)").run(roomName, peer.username);
    peer.ws.send(JSON.stringify({
        'cmd': 'create_room',
        'success': true,
        'data': { 'details': 'Room created successfully', 'room_name': roomName}
    }));
    console.debug("Room '" + roomName + "' created successfully");
}

module.exports = { processCreateRoomRequest };
