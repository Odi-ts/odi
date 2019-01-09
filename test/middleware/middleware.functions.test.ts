import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { createRequest, createResponse } from 'node-mocks-http';
import { bindAuthMiddleware } from "../../src/routing/middleware/middleware.functions";
import { CoreAuth } from '../../src/index';

export class AuthService extends CoreAuth<any, any> {

    serialize(data: any) {
        return data;
    }

    deserialize(data: any) {
        return data;
    }
}

describe('#bindAuthMiddleware(...)', () => {
    let authMiddleware: Function;

    let request = createRequest();
    let response = createResponse();

    const auth = new AuthService();
    auth['secret'] = randomBytes(12).toString('hex');

    const jwt = auth.createToken({ 
        id: '91f06105-2bb4-40ef-8527-8177ca3663bd',
        username: randomBytes(12).toString('hex') 
    }, { expiresIn: '150s' });


    it('should create auth middleware function', () => {
        authMiddleware = bindAuthMiddleware({}, auth);

        expect(authMiddleware).to.be.instanceOf(Function);
    });

    it('should return 401 for unauthorized', async () => {
        request = createRequest();
        response = createResponse();

        await authMiddleware(request, response);
        expect(response._getStatusCode()).to.be.eq(401);
    });

    it('should write user to request', async () => {
        request = createRequest({ headers: { authorization: `Bearer ${jwt}`}});
        response = createResponse();

        await authMiddleware(request, response);
        expect(request['locals']).to.be.an('object');
        expect(response._getStatusCode()).to.be.eq(200);
    });

});