//  procesa mensajes json con el campo cmd = 'get_room_details'

const {ProtocolException} = require("../exceptions.js");

function processStartMatchRequest(json, peer, server) {
    // TODO: comprobar si está logeado
    var room_name = server.get_name_of_room_owned_by(peer.username);
    if (room_name == undefined) {
        peer.ws.send(JSON.stringify({
            'cmd': 'start_match',
            'success': false,
            'data': {
                'details': "You don't own any room"
            }
        }));
    } else {
        //var peers = server.get_room_peers(room_name);
        var usernames = server.get_room_usernames(room_name);
        for (const username of usernames) {

            for (let [p, value] of server.peers) {
                if (p.username == username) {
                    p.ws.send(JSON.stringify({
                        'cmd': 'start_match',
                        'success': true,
                        'data': {
                            'host_ip': peer.ws.host_ip, // TODO: Corregir esto, aquí no está la IP origen del websocket
                            'host_port': 7000
                        }
                    }));
                    break;
                }
            }
        }
    }
}

module.exports = { processStartMatchRequest };
