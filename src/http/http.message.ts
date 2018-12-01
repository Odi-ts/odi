
export class HttpMessage {

    constructor(
        readonly code: number,
        readonly message: string,
        readonly body: string
    ) {}
}