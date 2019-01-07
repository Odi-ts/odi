import 'reflect-metadata';

import * as path from 'path';
import * as glob from 'globby';

import { MAIN_COMPONENTS } from '../definitions';
import { isPrimitive } from 'util';
import { Instance, Constructor } from '../types';


export type RFunction = (target: Constructor) => void;


export interface ILoader{   
    processBase(...args: any[]): void | any; 
}

export function inject(pattern: string | string[], reworker: RFunction) {
    glob.sync(pattern).forEach(drpath => {
        let imp: any = require(path.relative(__dirname, drpath));       
        let typeClass: any = findExport(imp);
         
        if(typeClass)
            reworker(typeClass);
        else{}
            //console.warn('No matching classes in files autoloading files')
    });  
}

export function reflectProperties(obj: Instance): string[]{  
    return (Object.keys(obj));
}

export function reflectOwnProperties(obj: Instance): string[]{
    let proto = Object.getPrototypeOf(obj);
    return Object.getOwnPropertyNames(proto);
}

export function reflectClassMethods(cls: Function): string[]{
    return Object.getOwnPropertyNames(cls.prototype);
}

export function reflectParameters(target: Instance, key?: string | symbol): unknown[]{
    if(key){
        return Reflect.getMetadata("design:paramtypes", target, key);
    }

    return Reflect.getMetadata("design:paramtypes", target);
}

export function reflectType(target: Function | Instance, key?: string | symbol) {
    if(key){
        return Reflect.getMetadata("design:type", target, key);
    }

    return Reflect.getMetadata("design:type", target);
}

export const isFunction = (target: Instance, propertyKey: string | symbol) => (propertyKey && typeof (target as any)[propertyKey] == "function" && propertyKey != 'constructor');


export function findExport(imp: any): any{
    if(imp.default && isMainComponent(imp.default)) 
        return imp.default;

    for (const key in imp) {    
  
        if(isPrimitive(imp[key])) 
            continue;            

        if(isMainComponent(imp[key]))
            return imp[key];
    }

    return null;
}

function isMainComponent(target: Instance | Function) {
    for(const componentKey of MAIN_COMPONENTS)
        if(Reflect.hasMetadata(componentKey, target))
            return true;

    return false;
}