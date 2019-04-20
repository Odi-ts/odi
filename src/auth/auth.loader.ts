import { AUTH, INJECT_ID } from "../definitions";
import { ILoader } from "../utils/directory.loader";

import { AuthDefaults } from "./auth.decorator";

import DependencyComposer from "../dependency/dependency.composer";
import { IAuth } from "./auth.interface";
import { Constructor } from "../types";
import { metadata } from "../utils/metadata.utils";
import { DependencyManager } from "../dependency/dependency.manager";
import DependencyContainer from "../dependency/dependency.container";
import { JWTAuth } from "./strategies/index";


export interface Options{
    dependencyComposer : DependencyComposer;
}

export class AuthLoader implements ILoader{

    constructor(readonly options: Options){}

    public async processBase() {
        return  async (classType: Constructor<IAuth<object, object>>) => {
            const md = metadata(classType);

            const defaults: AuthDefaults = md.getMetadata(AUTH);
            const typeId: string = md.getMetadata(INJECT_ID) || 'default';

            const authInstance = await this.options.dependencyComposer.instanciateClassType(classType);
            
            if(authInstance instanceof JWTAuth) {
                authInstance['secret'] = defaults.secret || 'secret';
                authInstance['container'] = defaults.header || '"authorization"';
                authInstance['expiration'] = defaults.expiration || '1 hour';
            }

            DependencyContainer.getContainer().putById('auth', authInstance);  
            DependencyContainer.getContainer().put(classType, authInstance, typeId);

            return authInstance;
        };
    }

}