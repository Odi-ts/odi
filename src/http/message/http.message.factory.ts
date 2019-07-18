import { HttpMessage } from "./http.message";
import { HttpStatus } from "./http.statuses";

interface ICode {
    status: HttpStatus;
}

const statusCodes: { [id: number]: ICode} = {
    200: {status: HttpStatus.Ok },
    400: {status: HttpStatus.BadRequest },
    403: {status: HttpStatus.Forbidden },
    404: {status: HttpStatus.NotFound },
};

export function createMessage<T, P extends number>(code: P, body: T) {
    const message = statusCodes[code] ? statusCodes[code].status : "";

    return new HttpMessage<T, P>(code, message, body);
}
