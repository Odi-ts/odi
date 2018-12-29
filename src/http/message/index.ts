import { createMessage } from "./http.message.factory";

export function Ok(body?: any) {
    return createMessage(200, body);
}

export function BadRequest(body?: any) {
    return createMessage(400, body);
}

export function Forbidden(subMessage?: string) {
    return createMessage(403, subMessage);
}

export function NotFound(body?: any) {
    return createMessage(404, body);
}