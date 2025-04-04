const {NotImplemented, ProtocolError} = require("../errors.js");

// procesa mensajes json con el campo cmd = 'login'
function processLoginRequest(json, peer, server) {
    const data = typeof(json['data']) === 'object' ? json['data'] : null;
    if (data == null) {
        //throw new ProtocolError(4000, `Missing data object while parsing a login request`);
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': {'details': 'Missing data object in login request'}
        }));
        logging.debug("Login failed: Missing data object in login request")
        return;
    }

    const username = typeof(data['username']) === 'string' ? data['username'] : '';
    const password = typeof(data['password']) === 'string' ? data['password'] : ''; 

    if (password == '') {
        // Login como invitado
        console.log("Guest login request received. Username = " + data.username);
        try {
            server.guest_login(peer, username);
            peer.ws.send(JSON.stringify({
                'cmd': 'logged_in',
                'success': true,
                'data': { 'details': 'Anonymous login sucessful'}
            }));
            console.debug("Anonymous login successful for username '" + username + "'");
        } catch(err) {
            if (err instanceof ProtocolError) {
                peer.ws.send(JSON.stringify({
                    'cmd': 'logged_in',
                    'success': false,
                    'data': { 'details': err.message}
                }));
                console.debug(`Anonymous login failed: ${err.message}`);
            } else {
                throw err;
            }
        }
    } else {
        // Login como usuario registrado
        throw new NotImplemented("Currently only supporting guest log in"); // TODO: Implementar
    }
}

module.exports = { processLoginRequest };
