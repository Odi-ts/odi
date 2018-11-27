import { HttpMessage } from "./http.message";
import { HttpStatus } from "./http.statuses";
import { defaults } from "./http.defaults";

export function Ok(body: string) {
    return new HttpMessage(200, HttpStatus.Ok, body);
}

export function BadRequest(body: string) {
    return new HttpMessage(400, HttpStatus.BadRequest, body);
}

export function Forbidden(subMessage: string) {
    return new HttpMessage(403, HttpStatus.Forbidden, subMessage ? subMessage : defaults(HttpStatus.Forbidden));
}

export function NotFound(body: string) {
    return new HttpMessage(404, HttpStatus.NotFound, body);
}