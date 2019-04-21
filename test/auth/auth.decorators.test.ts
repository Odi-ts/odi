import { expect } from 'chai';
import { Auth, Authentication } from '../../src/auth/auth.decorator';
import { AUTH, AUTH_MIDDLEWARE } from '../../src/definitions';
import { IController } from '../../src/index';

class AuthMock {}

class ControllerMock extends IController {

    getSomething() {}

    postSomething() {}

}


const defOptions = {
    expiration: '15 min',
    secret: 'Kittens'
};


describe('Auth Decorators', () => {

    describe('#Authentication(...)', () => {
        Authentication(defOptions)(AuthMock);
        
        it('sholud emit metadata on class', () => expect(Reflect.hasMetadata(AUTH, AuthMock)).to.be.eq(true));

        it('should emit options on class', () => expect(Reflect.getMetadata(AUTH, AuthMock)).to.be.deep.eq(defOptions));
    });

    describe('#Auth(...)', () => {
        Auth(1)(ControllerMock, 'postSomething');
        Auth([2, true, false, { hello: 'world' }])(ControllerMock, 'getSomething');
        
        it('sholud emit metadata on controller route', () => {
            expect(Reflect.hasMetadata(AUTH_MIDDLEWARE, ControllerMock, 'postSomething')).to.be.eq(true);
            expect(Reflect.hasMetadata(AUTH_MIDDLEWARE, ControllerMock, 'getSomething')).to.be.eq(true);
        });

        it('should emit auth middleware options', () => {
            expect(Reflect.getMetadata(AUTH_MIDDLEWARE, ControllerMock, 'postSomething')).to.be.deep.eq(1);
            expect(Reflect.getMetadata(AUTH_MIDDLEWARE, ControllerMock, 'getSomething')).to.be.deep.eq([2, true, false, { hello: 'world' }]);
        });
    });

});