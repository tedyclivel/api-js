export class MetierException extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'MetierException';
        this.statusCode = statusCode;
    }
}
