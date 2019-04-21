import * as fc from  'fastify-cookie';

import { expect } from 'chai';
import { createRequest } from 'node-mocks-http';
import { JWTAuth, JWTUser } from '../../src';

class AuthService extends JWTAuth<any, any> {

    serialize(data: any) {
        return data;
    }

    deserialize(data: any) {
        return { data };
    }
}

const payload = {
    id: "9fd522ee-bf8c-4310-b398-d703c98d345d",
    email: "uriel69@hotmail.com",
    permission: "000101101"
};

describe('User Data', () => {
    const auth = new AuthService();
    auth['secret'] = 'fc7be42c-6fa7-4727-ac2c-eb40458cc07c';
    auth['configure']();

    const token = auth.createToken(payload, { expiresIn: '10 sec' });
    const req = createRequest({ headers: { authorization: token }});

    const userData = new JWTUser(token, auth);

    describe('#decode(...)', () => {
        it('should decode token', () => expect(userData.decode()).to.be.include(payload));
    });

    describe('#verify(...)', () => {
        it('should successfully verify token', () => {
            const val = userData.verify();

            expect(val).to.have.length(2);
        });
    });

    describe('#load(...)', () => {
        it('should call deserialize and return result', async () => {
            userData.token = token;
            const { data } = await userData.load();

            expect(data).to.be.include(payload);
        });
    });

    describe('#assing(...)', () => {
        it('should call serialize and return new token', async () => {
            const token = await userData.assign({ user: payload });

            expect(token).to.be.a('string');
           
            userData.token = token;
            expect(userData.decode()).to.be.include(payload);
        });
    });
});