// procesa mensajes json con el campo cmd = 'login'
function processLoginRequest(json, peer, db) {
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
        // Comprobamos si el nombre de usuario está disponible
        const rows = db.prepare("SELECT username FROM profiles WHERE username=(?)").all(username);
        console.log("Número de usuarios con ese nombre: " + rows.length);
        if (rows.length > 0) {
            // El nombre de usuario está ocupado
            peer.ws.send(JSON.stringify({
                'cmd': 'logged_in',
                'success': false,
                'data': { 'details': 'Username already taken'}
            }));
            console.debug("Anonymous login failed: Username '" + username + "' already taken");
        } else {
            // El nombre de usuario está disponible
            db.prepare("INSERT INTO profiles (username, last_connection_timestamp) VALUES (?, ?)").run(username, Date.now());
            peer.username = username;
            peer.ws.send(JSON.stringify({
                'cmd': 'logged_in',
                'success': true,
                'data': { 'details': 'Anonymous login sucessful'}
            }));
            console.debug("Anonymous login successful for username '" + username + "'");
        }
    } else {
        // Login como usuario registrado
        throw new NotImplemented("Currently only supporting guest log in"); // TODO: Implementar
    }
}

module.exports = { processLoginRequest };
