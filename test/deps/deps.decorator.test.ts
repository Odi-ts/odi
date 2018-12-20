import { expect } from 'chai';
import {AUTOWIRED, INJECT } from '../../src/definitions';

/* Deps */
import { ControllerMock } from './classes/controller';
import { Autowired, Inject } from '../../src/index';
import { autowiredPropsStore } from '../../src/dependency/dependency.utils';


describe('Dependency Decorators', () => {
    
    describe('#Autowired(...)', () => {

        it('should emit correct metadata without id', () => {
            Autowired()(ControllerMock, 'repo');
            Autowired()(ControllerMock, 'service');

            expect(Reflect.getMetadata(AUTOWIRED, ControllerMock, 'repo')).to.be.eq('default');
            expect(Reflect.getMetadata(AUTOWIRED, ControllerMock, 'service')).to.be.eq('default');
        });

        it('should emit correct metadata with id', () => {
            Autowired('custom')(ControllerMock, 'custom');

            expect(Reflect.getMetadata(AUTOWIRED, ControllerMock, 'custom')).to.be.eq('custom');
        });

        it('should write props names to storage', () =>  expect(autowiredPropsStore.get(ControllerMock)).to.be.deep.eq([ 'repo', 'service', 'custom' ]));


    });

    describe('#Inject(...)', () => {
        
        it('should emit correct metadata with id', () => {
            Inject()(ControllerMock, 'custom', 0);

            expect(Reflect.getMetadata(INJECT, ControllerMock, 'custom')).to.be.deep.eq({ 0: 'default' });
        });

    });
});