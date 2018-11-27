import { HttpStatus } from "./http.statuses";

const forbiddenMessage = 'You don`t have permissions to access / on this server';

const empty = '';

export function defaults(httpStatus: HttpStatus): string {
    switch (httpStatus) {
        case HttpStatus.Forbidden: return forbiddenMessage;
        default: return empty;
    }
}