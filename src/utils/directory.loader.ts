import 'reflect-metadata';

import * as path from 'path'
import * as glob from 'glob'

import { MAIN_COMPONENTS } from '../definitions';
import { isPrimitive } from 'util';


export type RFunction = (instance: any) => void


export interface ILoader{   
    processBase(...args: any[]): void | any; 
}

export function inject(pattern: string, reworker: RFunction){
    glob.sync(pattern+'/**/*.{js,ts}').forEach(drpath => {           
        let imp: any = require(path.relative(__dirname, drpath));       
        let typeClass: any = findExport(imp);
         
        if(typeClass)
            reworker(typeClass);
        else{}
            //console.warn('No matching classes in files autoloading files')
    });  
}

export function reflectProperties(obj: any): string[]{  
    return (Object.keys(obj));
}

export function reflectOwnProperties(obj: any): string[]{
    let proto = Object.getPrototypeOf(obj)
    return Object.getOwnPropertyNames(proto);
}

export function reflectParameters(target: any, key?: string | symbol): any[]{
    if(key){
        return Reflect.getMetadata("design:paramtypes", target, key);
    }

    return Reflect.getMetadata("design:paramtypes", target);
}

export function reflectType(target: any, key?: string | symbol) {
    if(key){
        return Reflect.getMetadata("design:type", target, key);
    }

    return Reflect.getMetadata("design:type", target);
}

export const isFunction = (target: any, propertyKey: string | symbol) => (propertyKey && typeof target[propertyKey] == "function" && propertyKey != 'constructor');


function findExport(imp: any): any{
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

function isMainComponent(target: any) {
    for(const componentKey of MAIN_COMPONENTS)
        if(Reflect.hasMetadata(componentKey, target))
            return true;

    return false;
}