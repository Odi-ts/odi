import { ILoader } from '../utils/directory.loader';
import DependencyComposer from '../dependency/dependency.composer';
import { Constructor } from '../types';


export interface LoaderOptions{
    dependencyComposer: DependencyComposer;
}

export class ServicesLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions){}
    
    public processBase() {
        return async (classType: Constructor) => {
            /* Because singleton */
            const id = 'default';

            if(this.options.dependencyComposer.contain(classType, id)){
                return;
            }
            
            const target = await this.options.dependencyComposer.instanciateClassType(classType);
            
            this.options.dependencyComposer.put(classType, target, id);
        }; 
    }
    
}