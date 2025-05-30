const {ProtocolException} = require("../exceptions.js");

function processGetRoomsRequest(json, peer, server) {
    // TODO: Si el usuario no está logeado, enviar error pidiendo que lo haga

    room_names = server.get_room_names();
    // iterate with every room name
    for (let room_name of room_names) {
        let room_details = server.get_room_details(room_name);
        // TODO: Seguir aquí para completar el request get_rooms e implementar también el request get_room_details
    }

    peer.ws.send(JSON.stringify({
        'cmd': 'get_room_details',
        'success': true,
        'data': {
            'room_names': room_names
        }
    }));
}

module.exports = { processGetRoomsRequest };
