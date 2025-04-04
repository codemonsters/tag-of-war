const {NotImplemented, ProtocolError} = require("../errors.js");

// procesa mensajes json con el campo cmd = 'login'
function processLoginRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        server._throw_protocol_error(peer, 'logged_in', 'Missing data object in login request');
    }

    const username = typeof(data['username']) === 'string' ? data['username'] : '';
    const password = typeof(data['password']) === 'string' ? data['password'] : ''; 

    if (password == '') {
        // Login como invitado
        console.log("Guest login request received. Username = " + data.username);
        server.guest_login(peer, username);
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': true,
            'data': { 'details': 'Anonymous login sucessful'}
        }));
        console.debug("Anonymous login successful for username '" + username + "'");
    } else {
        // Login como usuario registrado
        throw new NotImplemented("Currently only supporting guest log in"); // TODO: Implementar
    }
}

module.exports = { processLoginRequest };
