import { expect } from 'chai';

import { RepositoryLoader } from "../../src/respositories/repository.loader";
import { getDependencyComposer } from "../utils/di.utils";
import { RepoMock } from './repository.decorator.test';
import DependencyComposer from '../dependency/dependency.composer';

let dependencyComposer: DependencyComposer;

describe('Repository Loader', () => {    
    describe('#RepositoryLoader', async () => {      
        let loader; 
        let processor: Function;

        before(() => {
            dependencyComposer = getDependencyComposer();
            loader = new RepositoryLoader({ dependencyComposer });
            processor = loader.processBase();
        });
       
        it('should return processing function', () => expect(processor).to.be.instanceOf(Function));
        it('should put instance in DI container', () => {                
            processor(RepoMock);
            expect(dependencyComposer.contain(RepoMock, 'default')).to.be.eq(true);
        });
        it('should not override existed repository in DI container', () => {            
            (dependencyComposer.get(RepoMock) as any)['flag'] = 'origin';
            processor(RepoMock);
            
            expect((dependencyComposer.get(RepoMock) as any)['flag']).to.be.eq('origin');
        });
    });
});