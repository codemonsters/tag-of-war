//  procesa mensajes json con el campo cmd = 'get_room_details'

const {ProtocolException} = require("../exceptions.js");

function processGetRoomDetailsRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in get room details request", "get_room_details");
    }

    const roomName = typeof(data['name']) === 'string' ? data['name'] : '';
    console.log(`Get room details request received. Room name = "${roomName}"`);

    room_details = server.get_room_details(peer, roomName);
    peer.ws.send(JSON.stringify({
        'cmd': 'get_room_details',
        'success': true,
        'data': {
            'name': room_details.name,
            'owner': room_details.owner,
            'players': room_details.players
        }
    }));
}

module.exports = { processGetRoomDetailsRequest };
