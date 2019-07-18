import { Function as ASTFunction } from "estree";
import { Constructor, Instance } from "../../types";
import { reflectParameters } from "../directory.loader";

export interface FunctionParam {
  name: string;
  type: any;
}

const parser = require("espree");

export function fnArgsList(fn: Function): string[] {
    const script = fn.toString();

    const parsed = script.replace(/(\".*\"\(|\'.*\'\()/g, "anonym(");
    const normalized = parsed.startsWith("async") ? `async function ${parsed.replace(/^async/, "")}` : parsed;

    const ast = parser.parse((normalized.startsWith("function") || normalized.startsWith("async function ")) ? normalized : `function ${normalized}`, {
		ecmaVersion: process.env.ECMA_VERSION || 10,
    });

    const params = (ast.body[0] as ASTFunction).params;

    let patterCounter = 0;

    return params.map((param, i) => param.type === "Identifier" ? param.name : `objectPattern${++patterCounter}`);
}

export function getFunctionArgs(target: Instance, propertyKey: string | symbol): FunctionParam[] {
    const argsNames = fnArgsList((target as any)[propertyKey]);
    const argsTypes = reflectParameters(target, propertyKey);

    return argsNames.map((name, i) => ({ name, type: argsTypes[i] }));
}
