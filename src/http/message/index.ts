import { createMessage } from "./http.message.factory";

export function Ok<T>(body?: T) {
    return createMessage(200, body);
}

export function BadRequest<T>(body?: T) {
    return createMessage(400, body);
}

export function Forbidden<T>(subMessage?: T) {
    return createMessage(403, subMessage);
}

export function NotFound<T>(body?: T) {
    return createMessage(404, body);
}