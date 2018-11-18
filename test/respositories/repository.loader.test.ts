import { expect } from 'chai';

import { RepositoryLoader } from "../../src/respositories/repository.loader";
import { getDependencyComposer } from "../utils/di.utils";
import { RepoMock } from './repository.decorator.test';
import { createConnection } from 'typeorm';
import { FooModel } from '../utils/db.utils';
import DependencyComposer from '../dependency/dependency.composer';

let dependencyComposer: DependencyComposer;

describe('Repository Loader', () => {    
    describe('#RepositoryLoader', async () => {      
        let loader; 
        let processor: Function;

        before(async () => {
            dependencyComposer = getDependencyComposer();
            loader = new RepositoryLoader({ dependencyComposer });
            processor = loader.processBase();

            await createConnection({
                type: "postgres",
                host: "localhost",
                port: 5432,
                username: "postgres",
                password: "",
                database: "test_db",
                entities: [ FooModel ],
                synchronize: true
            });
        });
       
        it('should return processing function', () => expect(processor).to.be.instanceOf(Function));
        it('should put instance in DI container', () => {                
            processor(RepoMock);
            expect(dependencyComposer.contain(RepoMock, 'default')).to.be.eq(true);
        });
        it('should not override existed repository in DI container', () => {            
            dependencyComposer.get(RepoMock)['flag'] = 'origin';
            processor(RepoMock);
            
            expect(dependencyComposer.get(RepoMock)['flag']).to.be.eq('origin');
        })
    });
});