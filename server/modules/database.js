const SQLITE_FILENAME = "database.sqlite"

const fs = require('fs');
const BetterSqlite3 = require('better-sqlite3');

// initialize database
if (fs.existsSync(SQLITE_FILENAME)) {
    create_db_schema = false;
} else {
    create_db_schema = true;
}

const db = new BetterSqlite3(SQLITE_FILENAME);
if (create_db_schema) {
    // creamos las tablas de la base de datos
    db.prepare("CREATE TABLE active_players (player_id INTEGER PRIMARY KEY)").run();
    db.prepare("CREATE TABLE profiles (player_id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20) NOT NULL UNIQUE, email VARCHAR(30) UNIQUE, password VARCHAR(32), last_connection_timestamp DATETIME NOT NULL, account_creation_timestamp DATETIME, account_verified BOOLEAN)").run();
    db.prepare("CREATE TABLE rooms (room_id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(32) NOT NULL UNIQUE, admin_player_id INTEGER NOT NULL UNIQUE)").run();
}
db.prepare("DELETE FROM active_players").run();
db.prepare("DELETE FROM profiles WHERE email IS NULL").run();
db.prepare("DELETE FROM rooms").run();

module.exports = { db }
