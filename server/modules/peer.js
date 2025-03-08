class Peer {
    constructor(id, ws) {
        this.id = id;
        this.ws = ws;
        this.username = null;
        /*
        this.lobby = '';
        // Close connection after 1 second if client has not joined a lobby
        this.timeout = setTimeout(() => {
            if (!this.lobby) {
                ws.close(4000, "Have not joined lobby yet");
            }
        }, NO_LOBBY_TIMEOUT);
        */
    }
}

module.exports = { Peer };
