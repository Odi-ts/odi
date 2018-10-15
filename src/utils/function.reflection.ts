import { reflectParameters } from "./directory.loader";

const COMMENTS_REG = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENTS_REG = /([^\s,]+)/g;

export interface FunctionParam {
  name: string;
  type: any;
}

export function fnArgsList(fn: Function): any[]{
  let cleared = fn.toString().replace(COMMENTS_REG, '');

  return  cleared.substring(cleared.indexOf('(')+1, cleared.indexOf(')')).match(ARGUMENTS_REG) || [];
}

export function getFunctionArgs(target: any, propertyKey: string | symbol): FunctionParam[] {
    const argsNames = fnArgsList(target[propertyKey]);
    const argsTypes = reflectParameters(target, propertyKey);

    return argsNames.map((name, i) => ({ name, type: argsTypes[i] }));
}