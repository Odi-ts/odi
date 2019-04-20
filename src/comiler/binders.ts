import { FunctionParam } from "../utils/reflection/function.reflection";
import { metadata } from "../utils/metadata.utils";
import * as keys from "../definitions";
import { Request } from "../aliases";

export function buildParamsFunc(rawParams: FunctionParam[]): (req: Request) => any[] {
    const fncDef = `req => [${extractParamsAliases(rawParams).join(', ')}];`;
    
    return eval(fncDef);
}

function extractParamsAliases(rawParams: FunctionParam[]) {
    const params = [];
        
    for(const { name, type } of rawParams) {
        const md = metadata(type);
        
        if([ Number, String, Boolean ].includes(type))       
            params.push(`(req.params["${name}"] ? ${type.name}(req.params["${name}"]) : undefined)`);

        else if(typeof type === 'function' && md.hasMetadata(keys.DATA_CLASS))                 
            params.push(md.getMetadata(keys.DATA_CLASS) === keys.BODY_DTO ? 'req.body' : 'req.query');  

        else 
            params.push(undefined);
    }

    return params;
}