class NotImplemented extends Error {
    constructor(message) {
        super(message);
    }
}

class ProtocolError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

module.exports = { NotImplemented, ProtocolError };
