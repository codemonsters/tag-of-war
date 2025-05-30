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
    // TODO: Actualizar la base de datos para que el peer salga de la habitación (y la destruya si él es el propietario)
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
    return username && (username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9ñÑ]+$/).test(username);
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

// devuelve el nombre de la habitación en la que se encuentra actualmente un jugador
server.get_name_of_room_player_is_in = function(username) {
    let row = this.db.sqlite.prepare("SELECT name FROM rooms LEFT JOIN rooms_players ON rooms.room_id=rooms_players.room_id LEFT JOIN profiles ON rooms_players.player_id=profiles.player_id WHERE username=(?)").get(username);
    if (row == undefined) {
        return undefined;
    }
    return row['name'];
}

server.get_name_of_room_owned_by = function(username) {
    const row = this.db.sqlite.prepare("SELECT name FROM rooms LEFT JOIN profiles on rooms.owner_player_id=profiles.player_id WHERE profiles.username=(?)").get(username);
    if (row == undefined) {
        return undefined;
    }
    return row['name'];
}

server.get_room_names = function() {
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
    rows = this.db.sqlite.prepare("SELECT name FROM rooms WHERE owner_player_id=(SELECT player_id FROM profiles WHERE username=(?))").all(peer.username);
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

    // Creamos la habitación y añadimos al propietario a la lista de jugadores
    this.db.sqlite.prepare("INSERT INTO rooms (name, owner_player_id) VALUES (?, (SELECT player_id FROM profiles WHERE username=?));").run(roomName, peer.username);
    this.join_room(peer, roomName);
}

server.join_room = function(peer, roomName) {
    if (roomName == '') {
        throw ProtocolException("Missing room name", "join_room");
    }
    if (!peer.username) {
        throw ProtocolException("Please login before joining a room", "join_room");
    }
    if (this.get_name_of_room_player_is_in(peer.username) != undefined) {
        throw ProtocolException("You are already in a room", "join_room");
    }
    if (!this._room_exists(roomName)) {
        throw ProtocolException("That room does not exist", "join_room");
    }
    if (this._get_num_players_in_room(roomName) >= this.MAX_PLAYERS_PER_ROOM) {
        throw ProtocolException("The room is full", "join_room");
    }
    let roomId = this.db.sqlite.prepare("SELECT room_id FROM rooms WHERE name=(?)").get(roomName)['room_id'];
    this.db.sqlite.prepare("INSERT INTO rooms_players (room_id, player_id) VALUES (?, (SELECT player_id FROM profiles WHERE username=?))").run(roomId, peer.username);
}

// 'peer' abandola la habitación (y si es el propietario, la habitación es eliminada)
// Devuelve la lista de usuarios que han salido de la habitación
// (pueden ser varios porque la habitación será destruida en caso de que quien salga sea el propietario)
server.leave_current_room = function(peer) {
    if (roomName == '') {
        throw ProtocolException("Missing room name", "leave_current_room");
    }
    if (!peer.username) {
        throw ProtocolError("Please login before leaving a room", "leave_current_room");
    }
    let room_name = this.get_name_of_room_player_is_in(peer.username);
    if (!room_name) {
        throw ProtocolException("You are not in a room (nothing to leave)", "leave_current_room");
    }
    let room_owner_username = this._get_room_owner_username(room_name);

    let affected_usernames = [];
    let destroy_room = false;
    if (peer.username != room_owner_username) {
        affected_usernames = [room_owner_username];
    } else {
        destroy_room = true;
        affected_usernames = this._get_usernames_in_room(room_name);
    }
    for (username in affected_usernames) {
        this._remove_username_from_room(username, room_name);
    }
    this.destroy_room(room_name);
    return affected_usernames;
}

server._remove_username_from_room = function(username, roomName) {
    this.db.sqlite.prepare("DELETE FROM room_players WHERE room_id=(SELECT room_id FROM rooms WHERE name=?) AND player_id=(SELECT player_id FROM profiles WHERE username=?)").run(roomName, username);
}

server.kick_username_from_current_room = function(peer, username) {
    if (!peer.username) {
        throw ProtocolExcception("Please login before kicking from current root");
    }
    let current_room_name = this.get_name_of_room_player_is_in(peer.username);
    if (!current_room_name) {
        throw ProtocolException("You are not in a room", "kick_from_current_room");
    }
    let room_owner_username = this._get_room_owner_username(current_room_name);
    if (peer.username != room_owner_username) {
        throw ProtocolException("You are not the room owner", "kick_from_current_room");
    }
    if (!this._username_in_room(username, current_room_name)) {
        throw ProtocolException(`Username ${username} is not in room ${current_room_name}`, "kick_from_current_room");
    }
    this._remove_username_from_room(username, current_room_name);
}

server.get_room_details = function(peer, roomName) {
    if (!this._room_name_format_valid(roomName)) {
        throw ProtocolException("Room name format not allowed", "get_room_details");
    }
    if (!peer.username) {
        throw ProtocolException("Please login before getting room details", "get_room_details");
    }
    if (!this._room_exists(roomName)) {
        throw ProtocolException("Room not found", "get_room_details")
    }

    let room_details = this.db.sqlite.prepare("SELECT rooms.name AS room_name, profiles.username AS owner FROM rooms LEFT JOIN profiles ON rooms.owner_player_id=profiles.player_id WHERE rooms.name=(?)").get(roomName);
    let player_list = this.get_usernames_in_room(roomName);
    response = {
        room_name: room_details['room_name'],
        owner: room_details['owner'],
        players: Array.from(player_list)
    }

    console.debug(response);
    return response;
}

server.get_usernames_in_room = function(roomName) {
    let rows = this.db.sqlite.prepare("SELECT username FROM profiles LEFT JOIN rooms_players ON profiles.player_id=rooms_players.player_id LEFT JOIN rooms ON rooms_players.room_id=rooms.room_id WHERE rooms.name=(?)").all(roomName);
    const usernames = new Set();
    for (const row of rows) {
        usernames.add(row.username);
    }
    return usernames;
}

// comprueba si sería válido que el peer pueda enviar el mensaje a su habitación actual
// devuelve la lista de peers que deberían recibir el mensaje
server.send_message_to_current_room = function(peer, message) {
    if (!peer.username) {
        throw ProtocolException("Please login before sending a message", "send_message_to_current_room");
    }
    if (!peer.message) {
        throw ProtocolException("Missing message", "send_message_to_current_room");
    }
    let current_room = this.get_name_of_room_player_is_in(peer.username);
    if (!current_room) {
        throw ProtocolException("You are not in a room", "send_message_to_current_room");
    }

    let peer_recipients = this.get_room_peers(current_room);
    peer_recipients.delete(peer);
    return peer_recipients;
}

server.start_match = function(room_name) {

}

server.start();

module.exports = { server };
