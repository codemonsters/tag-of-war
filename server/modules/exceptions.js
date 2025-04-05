class ServerBaseException extends Error {
    constructor(message) {
        super(message);
    }
}

class NotImplementedException extends ServerBaseException {
    constructor(message) {
        super(message);
    }
}

class ProtocolException extends ServerBaseException {
    constructor(message, cmd, code) {
        super(message);
        this.cmd = cmd || '';
        this.code = code || 4000;
    }
}

module.exports = { NotImplementedException, ProtocolException, ServerException: ServerBaseException };
