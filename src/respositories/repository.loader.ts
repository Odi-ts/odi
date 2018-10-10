import DependencyComposer from '../dependency/dependency.composer';

import { RFunction, ILoader } from '../utils/directory.loader';
import { INJECT_ID } from '../definitions';
import { getConnection, Repository } from 'typeorm';



export interface LoaderOptions{
    dependencyComposer: DependencyComposer
}

export class RepositoryLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions){}
    
    public processBase(): RFunction{
        return (classType: any) => {
            let id = Reflect.getMetadata(INJECT_ID, classType) || 'default';

            if(this.options.dependencyComposer.contain(id)){
                return;
            }

            let target = getConnection().getCustomRepository(classType);
            this.options.dependencyComposer.put(classType, target, id);
        }; 
    }
    
}