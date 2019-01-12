
export class HttpMessage<T, C = number, P = 'application/json'> {

    constructor(
        readonly code: number,
        readonly message: string,
        readonly body: T
    ) {}
}