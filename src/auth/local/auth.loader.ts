import { AUTH, INJECT_ID } from "../../definitions";
import { ILoader } from "../../utils/directory.loader";

import { AuthDefaults } from "./auth.decorator";

import DependencyComposer from "../../dependency/dependency.composer";
import { CoreAuth } from "./auth.interface";
import { Constructor } from "../../types";
import { metadata } from "../../utils/metadata.utils";
import { DependencyManager } from "../../dependency/dependency.manager";
import DependencyContainer from "../../dependency/dependency.container";


export interface Options{
    dependencyComposer : DependencyComposer;
}

export class AuthLoader implements ILoader{

    constructor(readonly options: Options){}

    public processBase(){
        return  async (classType: Constructor<CoreAuth<object, object>>) => {
            const md = metadata(classType);

            const defaults: AuthDefaults = md.getMetadata(AUTH);
            const typeId: string = md.getMetadata(INJECT_ID) || 'default';

            let authInstance = await this.options.dependencyComposer.instanciateClassType(classType);
            
            authInstance['secret'] = defaults.secret || 'secret';
            authInstance['expiration'] = defaults.expiration || '1 hour';
            authInstance['container'] = defaults.header;

            DependencyContainer.getContainer().putById('auth', authInstance);  
            DependencyContainer.getContainer().put(classType, authInstance, typeId);
        };
    }

}