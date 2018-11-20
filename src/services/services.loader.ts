import { RFunction, ILoader } from '../utils/directory.loader';
import { INJECT_ID } from '../definitions';
import DependencyComposer from '../dependency/dependency.composer';


export interface LoaderOptions{
    dependencyComposer: DependencyComposer
}

export class ServicesLoader implements ILoader{
   
    constructor(readonly options: LoaderOptions){}
    
    public processBase(): RFunction{
        return async (classType: any) => {
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