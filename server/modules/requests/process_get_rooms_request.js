const {ProtocolException} = require("../exceptions.js");

function processGetRoomsRequest(json, peer, server) {
    // TODO: Si el usuario no está logeado, enviar error pidiendo que lo haga

    let room_names = server.get_room_names();
    let rooms = []
    for (let room_name of room_names) {
        let room_details = server.get_room_details(peer, room_name);
        rooms.push(room_details);
    }

    peer.ws.send(JSON.stringify({
        'cmd': 'get_rooms',
        'success': true,
        'data': {
            'rooms': rooms
        }
    }));
}

module.exports = { processGetRoomsRequest };
