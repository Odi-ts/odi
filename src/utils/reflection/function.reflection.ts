import { reflectParameters } from "../directory.loader";
import { parseScript } from 'esprima';
import { Function as ASTFunction } from "estree";

export interface FunctionParam {
  name: string;
  type: any;
}

export function fnArgsList(fn: Function): any[] {
    const ast = parseScript(`function ${fn.toString()}`);
    const params = (ast.body[0] as ASTFunction).params;

    let patterCounter = 0;

    return params.map((param,i) => param.type === 'Identifier' ? param.name : `objectPattern${++patterCounter}`);
}

export function getFunctionArgs(target: any, propertyKey: string | symbol): FunctionParam[] {
    const argsNames = fnArgsList(target[propertyKey]);
    const argsTypes = reflectParameters(target, propertyKey);

    return argsNames.map((name, i) => ({ name, type: argsTypes[i] }));
}