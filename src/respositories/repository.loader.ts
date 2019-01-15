import DependencyComposer from '../dependency/dependency.composer';

import { RFunction, ILoader } from '../utils/directory.loader';
import { Constructor } from '../types';
import { metadata } from '../utils/metadata.utils';
import DependencyContainer from '../dependency/dependency.container';



export interface LoaderOptions{
    dependencyComposer: DependencyComposer;
}

export class RepositoryLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions){}
    
    public processBase(): RFunction{
        return async (classType: Constructor) => {
            const { getConnection } = await import('typeorm');
            const id = metadata(classType).getMetadata('INJECT_ID');

            if(DependencyContainer.getContainer().contain(classType, id))
                return;
    

            const target = getConnection().getCustomRepository(classType);
            DependencyContainer.getContainer().put(classType, target, id);
        }; 
    }
    
}