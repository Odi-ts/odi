import { expect } from 'chai';
import { createRequest, createResponse } from 'node-mocks-http';
import { IController, UserData } from '../../src/index';
import { AuthService } from '../auth/auth.interface.test';

class SampleController extends IController {}

const query = {
    field: 'Hello'
};

const headers = {
    auth: `Authorized 693d6d77-941d-4167-8976-fddb22f180fc`
};

const params = {
    id: '8085b2c3-3d12-47db-adc4-ad30fbf28f2b'
};

const cookies = {
    session: '4dc0e3ac-b55c-4829-bfa9-834d6db859d4'
};

const request = createRequest({ headers, query, params, cookies });
const response = createResponse();

describe('Controller Interface Test', () => {
    let controller: SampleController;
    
    it('#applyContext(...)', () => {
        controller = new SampleController();
        controller['applyContext'](request, response);

        expect(controller['request']).to.be.eq(request);
        expect(controller['response']).to.be.eq(response);
    });

    
    it('#getQuery(...)', () => expect(controller.getQuery()).to.deep.eq(query));

    it('#getHeaders(...)', () => expect(controller.getHeaders()).to.deep.eq(headers));
    
    it('#getParam(...)', () => expect(controller.getParam('id')).to.deep.eq(params.id));

    it('#getQueryParam(...)', () => expect(controller.getQueryParam('field')).to.deep.eq(query.field));

    it('#getCookie(...)', () => expect(controller.getCookie('session')).to.deep.eq(cookies.session));

    it('#getHeader(...)', () => expect(controller.getHeader('auth')).to.deep.eq(headers.auth));

    it('#setHeader(...)', () => {
        const field = 'Extended';
        controller.setHeader(field,'deposit indigo');
        
        expect('deposit indigo').to.deep.eq(response.getHeader(field));
    });

    it('#setCookie(...)', () => {
        const field = 'Extended';
        controller.setCookie(field,'deposit indigo');
        
        expect('deposit indigo').to.deep.eq(response.cookies[field].value);
    });

    it('#setStatus(...)', () => {
        controller.setStatus(404);        
        expect(response._getStatusCode()).to.deep.eq(404);
    });

    it('#redirect(...)', () => {
        controller.redirect('http://bryana.org');        
        expect(response._getRedirectUrl()).to.deep.eq('http://bryana.org');
    });

    it('#render(...)', () => {
        controller.render('index', { data: 'hello' });        

        expect(response._getRenderData()).to.deep.eq({ data: 'hello' });
        expect(response._getRenderView()).to.deep.eq('index');

        controller.render('index');        

        expect(response._getRenderData()).to.deep.eq({});
        expect(response._getRenderView()).to.deep.eq('index');
    });

    it('#user(...)', () => {
        expect(() => controller['user']).to.throw();

        controller['authService'] = new AuthService();

        expect(controller['user']).to.be.instanceOf(UserData);

        const userData = new UserData(request, controller['authService']);        
        controller['userData'] = userData;

        expect(controller['user']).to.be.deep.eq(userData);
    });
});