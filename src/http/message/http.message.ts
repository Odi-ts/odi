
export class HttpMessage<T, C extends number, P = "application/json"> {

    constructor(
        readonly code: C,
        readonly message: string,
        readonly body: T
    ) {}
}