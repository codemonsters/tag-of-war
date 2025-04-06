//  procesa mensajes json con el campo cmd = 'send_message_to_current_room'

const {ProtocolException} = require("../exceptions.js");

function processSendMessageToCurrentRoom(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        throw new ProtocolException("Missing data object in send message to current room request", "send_message_to_current_room");
    }
    
    const message = typeof(data['message']) === 'string' ? data['message'] : '';
    console.log(`Send message to current room request received. Message = "${message}"`);
    
    let peer_recipients = server.send_message_to_current_room(peer, message);
    for (peer in peer_recipients) {
        peer.ws.send(JSON.stringify({
            'cmd': 'room_message',
            'data': {
                'from': peer.username,
                'message': message
            }
        }));
    }
}

module.exports = { processSendMessageToCurrentRoom };
