import { expect } from 'chai';

import { RepositoryLoader } from "../../src/respositories/repository.loader";
import { getDependencyComposer } from "../utils/di.utils";
import { RepoMock } from './repository.decorator.test';
import DependencyComposer from '../dependency/dependency.composer';
import DependencyContainer from '../dependency/dependency.container';

let dependencyComposer: DependencyComposer;
let dependencyContainer: DependencyContainer;

describe('Repository Loader', () => {    
    describe('#RepositoryLoader', async () => {      
        let loader; 
        let processor: Function;

        before(() => {
            dependencyComposer = getDependencyComposer();
            dependencyContainer = dependencyComposer['container'];

            loader = new RepositoryLoader({ dependencyComposer });
            processor = loader.processBase();
        });
       
        it('should return processing function', () => expect(processor).to.be.instanceOf(Function));
        it('should put instance in DI container', async () => {                
            await processor(RepoMock);
            expect(dependencyContainer.contain(RepoMock, 'default')).to.be.eq(true);
        });
        it('should not override existed repository in DI container', () => {            
            (dependencyContainer.get(RepoMock) as any)['flag'] = 'origin';
            processor(RepoMock);
            
            expect((dependencyContainer.get(RepoMock) as any)['flag']).to.be.eq('origin');
        });
    });
});