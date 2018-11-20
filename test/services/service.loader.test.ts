import { expect } from 'chai';

import { ServicesLoader } from "../../src/services/services.loader";
import { getDependencyComposer } from "../utils/di.utils";
import { ServiceMock } from './service.decorator.test';

import DependencyComposer from '../dependency/dependency.composer';

let dependencyComposer: DependencyComposer;

describe('Repository Loader', () => {    
    describe('#RepositoryLoader', async () => {      
        let loader; 
        let processor: Function;

        before(async () => {
            dependencyComposer = getDependencyComposer();
            loader = new ServicesLoader({ dependencyComposer });
            processor = loader.processBase();
        });
       
        it('should return processing function', () => expect(processor).to.be.instanceOf(Function));
        it('should put instance in DI container', async () => {                
            await processor(ServiceMock);
            expect(dependencyComposer.contain(ServiceMock, 'default')).to.be.eq(true);
        });
        it('should not override existed repository in DI container', async () => {            
            dependencyComposer.get(ServiceMock)['flag'] = 'origin';
            await processor(ServiceMock);
            
            expect(dependencyComposer.get(ServiceMock)['flag']).to.be.eq('origin');
        })
    });
});