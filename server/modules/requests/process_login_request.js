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
    if (username == '') {
        //throw new ProtocolError(4000, `Missing username while parsing a login request`);
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': {'details': 'Missing username'}
        }));
        logging.debug("Login failed: Missing username");
        return;
    } else if (['admin', 'administrator', 'administrador', 'codemonsters', 'guest', 'root'].includes(username)) {
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': { 'details': 'Username not allowed'}
        }));
        console.debug("Login failed: Username '" + username + "' not allowed");
        return;    
    } else if (username.length > 20 || !/^[a-zA-Z0-9ñÑ]+$/.test(username)) {
        peer.ws.send(JSON.stringify({
            'cmd': 'logged_in',
            'success': false,
            'data': { 'details': 'Username format not allowed'}
        }));
        console.debug("Login failed: Username '" + username + "' format not allowed");
        return;
    }

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
            peer.ws.send(JSON.stringify({
                'cmd': 'logged_in',
                'success': false,
                'data': { 'details': err.message}
            }));
            console.debug(`Anonymous login failed: ${err.message}`);
        }
    } else {
        // Login como usuario registrado
        throw new NotImplemented("Currently only supporting guest log in"); // TODO: Implementar
    }
}

module.exports = { processLoginRequest };
