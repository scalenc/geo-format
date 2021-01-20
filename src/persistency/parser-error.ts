export class ParserError extends Error {
    constructor(message: string, public line: number) {
        super(message);
    }
}