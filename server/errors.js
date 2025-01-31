export class ProtocolError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

export class NotImplemented extends Error {
    constructor(message) {
        super(message);
    }
}
