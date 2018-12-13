import 'reflect-metadata';

import { expect } from 'chai';
import { Get, Post, Patch, Del, Put, All, RouteGet, RouteAll, RoutePut, RouteDel, RoutePatch, RoutePost, Controller, ControllerType } from '../../src/routing/controllers/controller.decorators';
import { ROUTE, RAW_ROUTE, CONTROLLER } from '../../src/definitions';
import { IController } from '../../src/index';


class SampleController extends IController{

    patch() {}
    post() {}    
    del() {}
    get() {}
    put() {}
    all() {}

}

describe('Controller Decorators', () => {
    describe('#Controller, RenderController, ...', () => {
        Controller()(SampleController);
        
        expect(Reflect.getMetadata(CONTROLLER, SampleController)).to.be.deep.eq({ path: '', type: ControllerType.Rest});
    });

    describe('#Get, Post, ...', () => {
        it('should emmit correct metadata', () => {
            Get(SampleController, 'get');
            Post(SampleController, 'post');
            Patch(SampleController, 'patch');
            Del(SampleController, 'del');
            Put(SampleController, 'put');
            All(SampleController, 'all');

            expect(Reflect.getMetadata(ROUTE, SampleController, 'get')).to.be.deep.eq({ method: 'get', path: '/get' })
            expect(Reflect.getMetadata(ROUTE, SampleController, 'post')).to.be.deep.eq({ method: 'post', path: '/post' })
            expect(Reflect.getMetadata(ROUTE, SampleController, 'patch')).to.be.deep.eq({ method: 'patch', path: '/patch' })
            expect(Reflect.getMetadata(ROUTE, SampleController, 'del')).to.be.deep.eq({ method: 'delete', path: '/del' })
            expect(Reflect.getMetadata(ROUTE, SampleController, 'put')).to.be.deep.eq({ method: 'put', path: '/put' })
            expect(Reflect.getMetadata(ROUTE, SampleController, 'all')).to.be.deep.eq({ method: 'all', path: '/all' })
        });
    });

    describe('#RouteGet, RoutePost, ...', () => {
        it('should emmit correct metadata', () => {
            RouteGet('raw/get')(SampleController, 'get');
            RoutePost('/raw/{post}')(SampleController, 'post');
            RoutePatch('/raw/patch')(SampleController, 'patch');
            RouteDel('/raw/del')(SampleController, 'del');
            RoutePut('/raw/put')(SampleController, 'put');
            RouteAll('{smth}')(SampleController, 'all');

            expect(Reflect.getMetadata(RAW_ROUTE, SampleController, 'get')).to.be.deep.eq({ method: 'get', path: '/raw/get' })
            expect(Reflect.getMetadata(RAW_ROUTE, SampleController, 'post')).to.be.deep.eq({ method: 'post', path: '/raw/:post' })
            expect(Reflect.getMetadata(RAW_ROUTE, SampleController, 'patch')).to.be.deep.eq({ method: 'patch', path: '/raw/patch' })
            expect(Reflect.getMetadata(RAW_ROUTE, SampleController, 'del')).to.be.deep.eq({ method: 'delete', path: '/raw/del' })
            expect(Reflect.getMetadata(RAW_ROUTE, SampleController, 'put')).to.be.deep.eq({ method: 'put', path: '/raw/put' })
            expect(Reflect.getMetadata(RAW_ROUTE, SampleController, 'all')).to.be.deep.eq({ method: 'all', path: '/:smth' })
        });
    });
});