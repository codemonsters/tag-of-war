const database = new Object();

database.SQLITE_FILENAME = "database.sqlite";
database.fsModule = require('fs');
database.BetterSqlite3Module = require('better-sqlite3');
database.init = function() {
    // initialize database
    let create_db_schema;
    if (this.fsModule.existsSync(this.SQLITE_FILENAME)) {
        create_db_schema = false;
    } else {
        create_db_schema = true;
    }

    this.sqlite = new this.BetterSqlite3Module(this.SQLITE_FILENAME);
    if (create_db_schema) {
        console.debug("Creando base de datos...")
        // creamos las tablas de la base de datos
        this.sqlite.prepare("CREATE TABLE active_players (player_id INTEGER PRIMARY KEY)").run();
        this.sqlite.prepare("CREATE TABLE profiles (player_id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20) NOT NULL UNIQUE, email VARCHAR(30) UNIQUE, password VARCHAR(32), last_connection_timestamp DATETIME NOT NULL, account_creation_timestamp DATETIME, account_verified BOOLEAN)").run();
        this.sqlite.prepare("CREATE TABLE rooms (room_id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(32) NOT NULL UNIQUE, admin_player_id INTEGER NOT NULL UNIQUE)").run();
    }
    this.sqlite.prepare("DELETE FROM active_players").run();
    this.sqlite.prepare("DELETE FROM profiles WHERE email IS NULL").run();
    this.sqlite.prepare("DELETE FROM rooms").run();
}

module.exports = { database }
