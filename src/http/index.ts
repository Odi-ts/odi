import { HttpMessage } from "./http.message";

export function Ok(message: string = 'Ok') {
    return new HttpMessage(200, message);
}

export function NotFound(message: string = 'Not Found') {
    return new HttpMessage(404, message);
}

export function BadRequest(message: string = 'Bad Request') {
    return new HttpMessage(400, message);
}