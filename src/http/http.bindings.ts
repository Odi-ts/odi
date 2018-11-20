import { IHttpError } from "./http.error";

export function ThrowHttp(message: string, code: number) {
    return new IHttpError(message, code);
}

