import { expect } from 'chai';
import { createMessage } from '../../src/http/message/http.message.factory';
import { HttpMessage } from '../../src/http/message/http.message';
import { HttpStatus } from '../../src/http/message/http.statuses';
import { Ok, BadRequest, Forbidden, NotFound } from '../../src/http/message/index';

describe('Http Message', () => {
    describe('#HttpMessage(...)', () => {
        const forbiddenMessage = 'You don`t have permissions to access / on this server';
        const message = '';

        const statusCodes: any = {
            200: { status: HttpStatus.Ok, message },
            400: { status: HttpStatus.BadRequest, message },
            403: { status: HttpStatus.Forbidden, message: forbiddenMessage},
            404: { status: HttpStatus.NotFound, message }
        };

        for(const code of [200, 400, 403, 404]) {
            it(`should create ${code} http message with proper information`, () => {
                const httpMessage = createMessage(code, null);

                expect(httpMessage).to.be.instanceOf(HttpMessage);
                expect(httpMessage.message).to.be.eq(statusCodes[code].status);
                expect(httpMessage.body).to.be.eq(statusCodes[code].message);
                expect(httpMessage.code).to.be.eq(code);
            });
        }
    });

    describe('#factory(...)', () => {
        const sets = [
            { func: Ok, code: 200 },
            { func: BadRequest, code: 400 },
            { func: Forbidden, code: 403 },
            { func: NotFound, code: 404 },
        ];

        for(const { func, code } of sets) {
            it(`should create correct message using ${func.name} function`, () => {
                const message = func();

                expect(message).to.be.instanceOf(HttpMessage);
                expect(message.code).to.be.eq(code);
            });
        }
    });
});