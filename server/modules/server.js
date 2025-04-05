const server = new Object();

server.MAX_PEERS = 100;
server.MAX_ROOMS = 25;
server.MAX_PLAYERS_PER_ROOM = 20;

server.peerModule = require("./peer.js").Peer;
const { v4: uuidv4 } = require('uuid');
server.uuidv4Module = uuidv4;
server.peers = new Map();
const {ServerBaseException, ProtocolException} = require("./exceptions.js");

server.start = function() {
    console.log("Arrancando servidor...");
    this.db = require("./database.js").database;
    this.db.init();
}

server.connect_peer_by_websocket = function(ws) {
    if (this.peers.size >= this.MAX_PEERS) {
        throw new ServerBaseException("Too many peers connected");
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
        throw new ProtocolException("Missing username", "login");
    }
    if (!this._username_format_valid(username)) {
        throw new ProtocolException("Username format not valid", "login");
    }
    if (['admin', 'administrator', 'administrador', 'codemonsters', 'guest', 'root'].includes(username)) {
        throw new ProtocolException("Username not allowed", "login");
    }
    if (peer.username) {
        throw new ProtocolException("You are already logged in", "login");
    }
    if (this._username_exists(username)) {
        throw new ProtocolException("Username already taken", "login");
    }
    // Añadimos el nombre de usuario a la tabla profiles
    this.db.sqlite.prepare("INSERT INTO profiles (username, last_connection_timestamp) VALUES (?, ?)").run(username, Date.now());
    peer.username = username;
}

server._current_room_name_of = function(username) {
    const row = this.db.sqlite.prepare("SELECT name FROM rooms LEFT JOIN rooms_players ON rooms.room_id=rooms_players.room_id LEFT JOIN profiles ON rooms_players.player_id=profiles.player_id WHERE username=(?)").get(username);
    return row['name'];
}

server._get_room_names = function() {
    const rows = this.db.sqlite.prepare("SELECT name FROM rooms").all();
    return rows.map(row => row['name']);
}

server._num_rooms = function() {
    const row = this.db.sqlite.prepare("SELECT COUNT(*) FROM rooms").get();
    return row['COUNT(*)'];
}

server._room_exists = function(roomName) {
    rows = this.db.sqlite.prepare("SELECT name FROM rooms WHERE name=(?)").all(roomName);
    return rows.length > 0;
}

server._room_name_format_valid = function(roomName) {
    return this._username_format_valid(roomName);   // mismas reglas para validar format de nombre de habitación y nombre de usuario
}

server._get_num_players_in_room = function(roomName) {
    rows = this.db.sqlite.prepare("SELECT COUNT(*) FROM rooms_players WHERE room_id=(SELECT room_id FROM rooms WHERE name=?)").all(roomName);
    return rows[0]['COUNT(*)'];
}

server.create_and_join_room = function(peer, roomName) {
    // comprobamos el formato del nombre de la habitación indicado
    if (roomName == '') {
        throw new ProtocolException("Missing room_name", "create_and_join_room");
    }
    if (!this._room_name_format_valid(roomName)) {
        throw new ProtocolException("Room name format not allowed", "create_and_join_room");
    }
    // comprobamos si el usuario actual está logeado
    if (!peer.username) {
        throw new ProtocolException("Please login before creating a room", "create_and_join_room");
    }
    // comprobamos si el usuario actual no tiene ya creada una habitación
    rows = this.db.sqlite.prepare("SELECT name FROM rooms WHERE admin_player_id=(SELECT player_id FROM profiles WHERE username=(?))").all(peer.username);
    if (rows.length > 0) {
        throw new ProtocolException("You already have a room! (max 1 room per player)", "create_and_join_room");
    }
    // Comprobamos si el nombre de habitación está disponible
    if (this._room_exists(roomName)) {
        throw new ProtocolException("Room name already taken", "create_and_join_room");
    }
    if (this._num_rooms() >= this.MAX_ROOMS) {
        throw new ProtocolException("Maximum number of rooms reached", "create_and_join_room");
    }

    // Creamos la habitación
    this.db.sqlite.prepare("INSERT INTO rooms (name, admin_player_id) VALUES (?, (SELECT player_id FROM profiles WHERE username=?));").run(roomName, peer.username);
    //db.prepare("INSERT INTO rooms (name, admin_player_id) VALUES (?, ?)").run(roomName, peer.username);
}

server.join_room = function(peer, roomName) {
    if (roomName == '') {
        throw ProtocolException("Missing room name", "join_room");
    }
    if (!peer.username) {
        throw ProtocolError("lease login before joining a room", "join_room");
    }
    if (this._current_room_name_of(peer.username) != "") {
        throw ProtocolException("You are already in a room", "join_room");
    }
    if (!this._room_exists(roomName)) {
        throw ProtocolException("That room does not exist", "join_room");
    }
    if (this._get_num_players_in_room(roomName) >= this.MAX_PLAYERS_PER_ROOM) {
        throw ProtocolException("The room is full", "join_room");
    }
    this.db.sqlite.prepare("INSERT INTO rooms_players (room_id, player_id) VALUES (?, SELECT player_id FROM profiles WHERE username=?)").run(roomName, peer.username);
}

server.start();

module.exports = { server };
