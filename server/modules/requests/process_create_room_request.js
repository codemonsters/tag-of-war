// procesa mensajes json con el campo cmd = 'create_room'
function processCreateRoomRequest(json, peer, server) {
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

    const roomName = typeof(data['name']) === 'string' ? data['name'] : '';
    if (roomName == '') {
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': {'details': 'Missing room_name'}
        }));
        console.debug("Create room failed: Missing room name");
        return;
    }
    console.log("Create room request received. Room name = " + roomName);
    try {
        server.create_room(peer, roomName);
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': true,
            'data': { 'details': 'Room created successfully', 'room_name': roomName}
        }));
        console.debug("Room '" + roomName + "' created successfully");
    
    } catch (err) {
        peer.ws.send(JSON.stringify({
            'cmd': 'create_room',
            'success': false,
            'data': { 'details': err.message}
        }));
        console.debug(`Create room failed: ${err.message}`);
        return;
    }
}

module.exports = { processCreateRoomRequest };
