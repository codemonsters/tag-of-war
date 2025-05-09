//  procesa mensajes json con el campo cmd = 'get_room_details'

const {ProtocolException} = require("../exceptions.js");

function processStartMatchRequest(json, peer, server) {
    var room_name = server.get_name_of_room_owned_by(peer.name);
    if (room_name == undefined) {
        peer.ws.send(JSON.stringify({
            'cmd': 'start_match',
            'success': false,
            'data': {
                'details': "You don't own any room"
            }
        }));
    } else {
        var peers = server.get_room_peers(room_name);
        for (peer in peers) {
            if (peer.username != peer.name) {    
                // TODO: SEGUIR AQUÍ. Enviar un mensaje a cada peer indicando que empieza la partida y cuál es la ip y el puerto del servidor
                peer.ws.send(JSON.stringify({
                    'cmd': 'match_starting',
                    'data': ''
                }));
            }
        }
    }
    
}

module.exports = { processStartMatchRequest };
