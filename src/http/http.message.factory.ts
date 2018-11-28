import { HttpMessage } from "./http.message";
import { HttpStatus } from "./http.statuses";

interface ICode{
    status: HttpStatus,
    message: string
}

const forbiddenMessage = 'You don`t have permissions to access / on this server';
const empty = '';

const statusCodes: { [id: number]: ICode} = {
    200: {status : HttpStatus.Ok, message: empty},
    400: {status: HttpStatus.BadRequest, message: empty},
    403: {status: HttpStatus.Forbidden, message: forbiddenMessage},
    404: {status: HttpStatus.NotFound, message: empty}
};

export function createMessage(code: number, body: any) {
    return new HttpMessage(code, statusCodes[code].status, body || statusCodes[code].message)
}