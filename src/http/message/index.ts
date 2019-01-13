import { createMessage } from "./http.message.factory";
import { HttpMessage } from "./http.message";


export function Ok<T>(body?: T): HttpMessage<T | undefined, 200, "application/json">{
    return createMessage(200, body);
}

export function BadRequest<T = string>(body?: T): HttpMessage<T | undefined, 400, "text/plain">{
    return createMessage(400, body);
}

export function Forbidden<T = string>(subMessage?: T ): HttpMessage<T | undefined, 403, "text/plain"> {
    return createMessage(403, subMessage);
}

export function NotFound<T = string>(body?: T): HttpMessage<T | undefined, 404, "text/plain"> {
    return createMessage(404, body);
}