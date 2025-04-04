const server = new Object();

server.MAX_PEERS = 100;
server.MAX_LOBBIES = 5;
server.peerModule = require("./peer.js").Peer;
const { v4: uuidv4 } = require('uuid');
server.uuidv4Module = uuidv4;
server.peers = new Map();
const NotImplemented = require("./errors.js").NotImplemented;
const ProtocolError = require("./errors.js").ProtocolError;

server._throw_protocol_error = function(peer, cmd, details) {
    peer.ws.send(JSON.stringify({
        'cmd': cmd,
        'success': false,
        'data': {'details': details}
    }));
    console.debug(`Protocol error: ${cmd}: ${details}`);
    throw new ProtocolError(4000, cmd, details);
}

server.start = function() {
    console.log("Arrancando servidor...");
    this.db = require("./database.js").database;
    this.db.init();
}

server.connect_peer_by_websocket = function(ws) {
    if (this.peers.size >= this.MAX_PEERS) {
        throw new Error("Too many peers connected");
    }
    const id = this.uuidv4Module();
    const peer = new this.peerModule(id, ws);
    this.peers.set(peer);
    return peer;
}

server.disconnect_peer = function(peer) {
    // TODO: Actualizar la base de datos para que el peer salga de la habitación (y la destruya si él es el admin)
    this.peers.delete(peer);
}

server._processRequestModule = require("./requests/process_request.js").processRequest;

server.processRequest = function(msg, peer) {
    this._processRequestModule(msg, peer, this);
}

server._username_exists = function(username) {
    const rows = server.db.sqlite.prepare("SELECT username FROM profiles WHERE username=(?)").all(username);
    return rows.length > 0;
}

server._username_format_valid = function(username) {
    return (username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9ñÑ]+$/).test(username);
}

server.guest_login = function(peer, username) {
    if (username == '') {
        this._throw_protocol_error(peer, 'login', 'Missing username');
    }
    if (!this._username_format_valid(username)) {
        this._throw_protocol_error(peer, 'login', 'Username format not valid');
    }
    if (['admin', 'administrator', 'administrador', 'codemonsters', 'guest', 'root'].includes(username)) {
        this._throw_protocol_error(peer, 'login', 'Username not allowed');
    }
    if (peer.username) {
        this._throw_protocol_error(peer, 'login', 'You are already logged in. Please, logout first');
    }
    if (this._username_exists(username)) {
        this._throw_protocol_error(peer, 'login', 'Username already taken');
    }
    // Añadimos el nombre de usuario a la tabla profiles
    this.db.sqlite.prepare("INSERT INTO profiles (username, last_connection_timestamp) VALUES (?, ?)").run(username, Date.now());
    peer.username = username;
}

server._room_exists = function(roomName) {
    rows = this.db.sqlite.prepare("SELECT name FROM rooms WHERE name=(?)").all(roomName);
    return rows.length > 0;
}

server._room_name_format_valid = function(roomName) {
    return this._username_format_valid(roomName);   // mismas reglas para validar format de nombre de habitación y nombre de usuario
}

server.create_room = function(peer, roomName) {
    // comprobamos el formato del nombre de la habitación indicado
    if (roomName == '') {
        throw new ProtocolError(4000, "Missing room_name");
    }
    if (!this._roomname_format_valid(roomName)) {
        throw new ProtocolError(4000, "Room name format not allowed");
    }
    // comprobamos si el usuario actual está logeado
    if (!peer.username) {
        throw new Error( "Please login before creating a room")
    }
    // comprobamos si el usuario actual no tiene ya creada una habitación
    rows = this.db.sqlite.prepare("SELECT name FROM rooms WHERE admin_player_id=(SELECT player_id FROM profiles WHERE username=(?))").all(peer.username);
    if (rows.length > 0) {
        throw new Error("You already have a room! (max 1 room per player)");
    }
    // Comprobamos si el nombre de habitación está disponible
    if (this._room_exists(roomName)) {
        throw new Error("Room name already taken");
    }

    // Creamos la habitación
    this.db.sqlite.prepare("INSERT INTO rooms (name, admin_player_id) VALUES (?, (SELECT player_id FROM profiles WHERE username=?));").run(roomName, peer.username);
    //db.prepare("INSERT INTO rooms (name, admin_player_id) VALUES (?, ?)").run(roomName, peer.username);
}

server.join_room = function(peer, roomName) {
    if (roomName == '') {
        this._send_error_response(peer, 'join_room', 'Missing room_name');
        return;
    }
    if (!peer.username) {
        this._send_error_response(peer, 'join_room', 'Please login before joining a room');
        return;
    }
    if (this._current_room_of(peer.username) != "") {
        this._send_error_response(peer, 'join_room', 'You are already in a room');
        return;
    }
    if (!this._room_exists(roomName)) {
        this._send_error_response(peer, 'join_room', 'That room does not exist');
        return;
    }
    // TODO: Añadir al usuario actual a la habitación seleccionada y enviar un mensaje a todos los otros jugadores de la habitación informando sobre esto
}

server.start();

module.exports = { server };
