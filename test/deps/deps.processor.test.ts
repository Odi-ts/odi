import * as express from 'express';

import { expect } from 'chai';
import { DependencyClassifier, DepType  } from '../../src/dependency/dependency.processor';
import { getDependencyComposer } from '../utils/di.utils';
import { RepoMock } from '../respositories/repository.decorator.test';
import { REPOSITORY, CONTROLLER } from '../../src/definitions';

describe('Dependency Classifier', () => {
    const dependencyComposer = getDependencyComposer();
    const app = express();
    const rootPath = './classes';
    const types = Object.values(DepType).filter(elem => typeof elem !== 'string');

    let dep: DependencyClassifier;
    describe('#constructor', () => {
        dep = new DependencyClassifier({ dependencyComposer, app, rootPath });

        it('should init queues', () => {
            expect(dep['queues']).to.be.a('object');
           
            for(const key of types)
                expect(dep['queues'][key]).to.deep.eq([]);
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
        const refer = dep['getRefer'](RepoMock);

        it('should return function', () => expect(refer).to.be.instanceOf(Function));

        it('should classify target types', () => {
            expect(refer(REPOSITORY)).to.be.eq(true);
            expect(refer(CONTROLLER)).to.be.eq(false);
        });
    });

    describe('#getType(...)', () => {
        it('should classify target types', () => {
            expect(dep['getType'](RepoMock)).to.be.eq(DepType.Repository);
            expect(dep['getType'](RepoMock)).to.be.not.eq(DepType.Controller);
        });
    });


});