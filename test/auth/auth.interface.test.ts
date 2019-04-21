import { expect } from 'chai';
import { createRequest } from 'node-mocks-http';
import { JWTAuth, JWTUser } from '../../src';


export class AuthService extends JWTAuth<any, any> {

    serialize(data: any) {
        return data;
    }

    deserialize(data: any) {
        return data;
    }
}

const payload = {
    id: "9fd522ee-bf8c-4310-b398-d703c98d345d",
    email: "uriel69@hotmail.com",
    permission: "000101101"
};

describe('Core Auth Service', () => {
    const auth = new AuthService();
    auth['secret'] = 'fc7be42c-6fa7-4727-ac2c-eb40458cc07c';
    
    auth['jsonwebtoken'] = require('jsonwebtoken');

    let token: string;

    describe('#configure', () => {
        it('should not throw an error if package installed', () => auth['configure']());
    });

    describe('#jsonwebtoken(...)', () => {
        it('should create token', () => token = auth.createToken(payload, { expiresIn: '10 sec' }));
        
        it('should decode token', () => expect(auth.decodeToken(token)).to.be.include(payload));

        it('should verify token', () => expect(auth.verifyToken(token)).to.be.include(payload));

        it('should throw on error on wrong token', () => expect(() => auth.verifyToken('7113a98e-19a7-4828-a8b8-cce173351738')).to.throw());
    });

    describe('#extractToken', () => {
        it('should extarct token from header request', () => {
            const request = createRequest({ headers: { authorization: `Authorization: ${token}` }});

            expect(auth['extractToken'](request as any)).to.be.eq(token);
        });

        it('should return undefined if no token', () => {
            const request = createRequest();

            expect(auth['extractToken'](request as any)).to.be.eq(undefined);
        });

        it('should extarct token from cookies if no header', () => {
            const request = createRequest({ cookies: { authorization: token }});

            expect(auth['extractToken'](request as any)).to.be.eq(token);
        });

        it('should fallback if wrong header', () => {
            const request = createRequest({ headers: { authorization: token }});

            expect(auth['extractToken'](request as any)).to.be.eq(undefined);
        });

        it('should extarct token from custom cookie field if no header', () => {
            const request = createRequest({ cookies: { sample: token }});
            auth['container'] = 'sample';
            expect(auth['extractToken'](request as any)).to.be.eq(token);
        });
    });

    describe('#extractUser', () => {
        it('should return UserData instance with token', () => {
            const request = createRequest({ headers: { authorization: `Authorization: ${token}` }});
            const userData = auth['extractUser'](request as any);

            expect(userData).to.be.instanceOf(JWTUser);
            expect(userData.token).to.be.eq(token);
        });
    });
});