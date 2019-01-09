
export class HttpMessage<T> {

    constructor(
        readonly code: number,
        readonly message: string,
        readonly body: T
    ) {}
}