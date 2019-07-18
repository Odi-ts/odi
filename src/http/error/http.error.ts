export class IHttpError extends Error {
    private httpCode: number;

    constructor(message: string, httpCode: number) {
        super(message);

        this.httpCode = httpCode;
    }

    public getHttpCode() {
        return this.httpCode;
    }
}
