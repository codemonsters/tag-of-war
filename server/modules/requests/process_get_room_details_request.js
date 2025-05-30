const {ProtocolException} = require("../exceptions.js");

function processGetRoomDetailsRequest(json, peer, server) {
    // TODO: Si el usuario no está logeado, enviar error pidiendo que lo haga
    
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in get room details request", "get_room_details");
    }

    const roomName = typeof(data['room_name']) === 'string' ? data['room_name'] : '';
    console.log(`Get room details request received. Room name = "${roomName}"`);

    room_details = server.get_room_details(peer, roomName);
    peer.ws.send(JSON.stringify({
        'cmd': 'get_room_details',
        'success': true,
        'data': room_details
    }));
}

module.exports = { processGetRoomDetailsRequest };
