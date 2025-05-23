//  procesa mensajes json con el campo cmd = 'get_room_details'

const {ProtocolException} = require("../exceptions.js");

function processGetRoomNamesRequest(json, peer, server) {
    // TODO: Si el usuario no está logeado, enviar error pidiendo que lo haga

    room_names = server.get_room_names();
    peer.ws.send(JSON.stringify({
        'cmd': 'get_room_details',
        'success': true,
        'data': {
            'room_names': room_names
        }
    }));
}

module.exports = { processGetRoomNamesRequest };
