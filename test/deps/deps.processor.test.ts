import * as fastify from 'fastify';

import { expect } from 'chai';
import { DependencyManager, DepType  } from '../../src/dependency/dependency.manager';
import { getDependencyComposer } from '../utils/di.utils';
import { REPOSITORY, CONTROLLER } from '../../src/definitions';

/* Deps */
import { RepositoryMock } from './classes/repo';
import { AuthMock } from './classes/auth';
import { ControllerMock } from './classes/controller';
import { ServiceMock } from './classes/service';
import { Custom } from './classes/custom';
import { SocketMock } from './classes/socket';
import { resolve } from 'path';

describe('Dependency Classifier', () => {
    const dependencyComposer = getDependencyComposer();
    const app = fastify();
    const rootPath = resolve(__dirname, './classes');
    const types = Object.values(DepType).filter(elem => typeof elem !== 'string');

    let dep: DependencyManager;

    describe('#constructor', () => {
        dep = new DependencyManager({ dependencyComposer, app, rootPath });

        it('should init queues for main components', () => {
            expect(dep['queues']).to.be.a('object');
                       
            expect(dep['queues'][DepType.Controller]).to.deep.eq([]);
            expect(dep['queues'][DepType.Service]).to.deep.eq([]);
            expect(dep['queues'][DepType.Auth]).to.deep.eq([]);
            expect(dep['queues'][DepType.Socket]).to.deep.eq([]);
        });

        it('should init loaders', () => {
            expect(dep['loaders']).to.be.a('object');
           
            for(const key of types) {
                if(!dep['loaders'][key])
                    continue;

                expect(dep['loaders'][key]).to.be.a('object');
            }
        });
    });

    describe('#getRefer(...)', () => {
        const refer = dep['getRefer'](RepositoryMock);

        it('should return function', () => expect(refer).to.be.instanceOf(Function));

        it('should classify target types', () => {
            expect(refer(REPOSITORY)).to.be.eq(true);
            expect(refer(CONTROLLER)).to.be.eq(false);
        });
    });

    describe('#getType(...)', () => {
        it('should classify target types', () => {
            expect(dep['getType'](RepositoryMock)).to.be.eq(DepType.Repository);
            expect(dep['getType'](ControllerMock)).to.be.eq(DepType.Controller);    
            expect(dep['getType'](ServiceMock)).to.be.eq(DepType.Service);    
            expect(dep['getType'](SocketMock)).to.be.eq(DepType.Socket);               
            expect(dep['getType'](Custom)).to.be.eq(DepType.Custom);   
            expect(dep['getType'](AuthMock)).to.be.eq(DepType.Auth);
        });
    });

    describe('#classify()', () => {
        it('should load deps from folder into queues', () => {
            dep.classify();

            for(const queue of Object.values(dep['queues']))
                expect(queue).to.have.length(1);
        });      
    });

    describe('#compose()', () => {
        it('should instantiate deps from folder into deps storage', async () => {
            await dep.compose();

            expect(dependencyComposer.contain(RepositoryMock)).to.be.eq(true);
            expect(dependencyComposer.contain(ControllerMock)).to.be.eq(true);
            expect(dependencyComposer.contain(AuthMock)).to.be.eq(true);
            expect(dependencyComposer.contain(ServiceMock)).to.be.eq(true);
        });      
    });
});