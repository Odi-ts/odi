import { expect } from 'chai';
import { IHttpError } from '../../src/index';

describe('Http Message', () => {
    describe('#IHttpError(...)', () => {
        it('should return message and code', () => {
            const httpMessage= new IHttpError('Not Found', 404);

            expect(httpMessage.message).to.be.eq('Not Found');
            expect(httpMessage.getHttpCode()).to.be.eq(404);
        });
    });
});