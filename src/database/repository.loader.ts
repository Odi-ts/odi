import DependencyComposer from '../dependency/dependency.composer';

import { ILoader } from '../utils/directory.loader';
import { Constructor } from '../types';
import { metadata } from '../utils/metadata.utils';
import DependencyContainer from '../dependency/dependency.container';



export interface LoaderOptions{
    dependencyComposer: DependencyComposer;
}

export class RepositoryLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions){}
    
    public async processBase() {
        return async (classType: Constructor) => {
            const { getConnection } = await import('typeorm');

            const id = metadata(classType).getMetadata('INJECT_ID');
            const predefine = DependencyContainer.getContainer().get(classType, id);

            if(predefine)
                return predefine;
    
            const target = getConnection().getCustomRepository(classType);
            DependencyContainer.getContainer().put(classType, target, id);

            return target;
        }; 
    }
    
}