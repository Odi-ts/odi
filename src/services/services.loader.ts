import { ILoader } from '../utils/directory.loader';
import { Constructor } from '../types';

import DependencyComposer from '../dependency/dependency.composer';
import DependencyContainer from '../dependency/dependency.container';


export interface LoaderOptions{
    dependencyComposer: DependencyComposer;
}

export class ServicesLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions){}
    
    public processBase() {
        return async (classType: Constructor) => {
            /* Because singleton */
            const id = 'default';

            if(DependencyContainer.getContainer().contain(classType, id)){
                return;
            }
            
            const target = await this.options.dependencyComposer.instanciateClassType(classType);
            
            DependencyContainer.getContainer().put(classType, target, id);
        }; 
    }
    
}