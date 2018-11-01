import { AUTH, INJECT_ID } from "../../definitions";
import { ILoader } from "../../utils/directory.loader";

import { AuthDefaults } from "./auth.decorator";

import DependencyComposer from "../../dependency/dependency.composer";
import { CoreAuth } from "./auth.interface";


export interface Options{
    dependencyComposer : DependencyComposer
}

export class AuthLoader implements ILoader{

    constructor(readonly options: Options){}


    public processBase(){
        return  async (classType : any) => {
            let defaults: AuthDefaults<any> = Reflect.getMetadata(AUTH, classType);
            let typeId: string = Reflect.getMetadata(INJECT_ID, classType) || 'default';

            let authInstance: CoreAuth<any,any> = await this.options.dependencyComposer.instanciateClassType(classType);
            
            authInstance['secret'] = defaults.secret;
            authInstance['expiration'] = defaults.expiration;
            authInstance['container'] = defaults.header;

            this.options.dependencyComposer.putById('auth', authInstance);           
            this.options.dependencyComposer.put(classType, authInstance, typeId);
        }
    }

}