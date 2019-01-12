import { createMessage } from "./http.message.factory";
import { HttpMessage } from "./http.message";


export function Ok<T>(body?: T): HttpMessage<T | undefined, 200>{
    return createMessage(200, body);
}

export function BadRequest<T>(body?: T): HttpMessage<T | undefined, 400>{
    return createMessage(400, body);
}

export function Forbidden<T>(subMessage?: T): HttpMessage<T | undefined, 403> {
    return createMessage(403, subMessage);
}

export function NotFound<T>(body?: T): HttpMessage<T | undefined, 404> {
    return createMessage(404, body);
}