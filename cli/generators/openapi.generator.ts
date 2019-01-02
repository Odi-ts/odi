import { OpenAPIV3 } from 'openapi-types';

import { DependencyManager, DepType } from "../../src/dependency/dependency.manager"
import { join } from 'path';
import { IController, isRouteHandler } from "../../src";

import { metadata } from "../../src/utils/metadata.utils";
import { reflectClassMethods } from "../../src/utils/directory.loader";
import { CONTROLLER, RAW_ROUTE, ROUTE, DATA_CLASS, BODY_DTO } from "../../src/definitions";

import { getFunctionArgs } from "../../src/utils/reflection/function.reflection";
import { concatinateBase } from "../../src/utils/url.utils";
import { parseScript } from "esprima";
import { remapPath, writeFile } from '../utils';

type HandlerDescriptor =  OpenAPIV3.OperationObject & { path: string, method: string };


function readControllers(sources: string | string[]) {
    const manager = new DependencyManager({ sources });
    manager.classify();
    
    return manager.getDeps(DepType.Controller);
}

function processMethod(controller: typeof IController, handler: string) {
    const meta = metadata(controller.prototype, handler);
    const args = getFunctionArgs(controller.prototype, handler);

    const { path, method } = meta.getMetadata(RAW_ROUTE) || meta.getMetadata(ROUTE);
    
    const descriptor: HandlerDescriptor = { 
        path, 
        method, 
        parameters: [] 
    };
    
    for(const { name, type } of args) {
        const md = metadata(type);
   
        if([String, Number, Boolean].includes(type))
            descriptor.parameters!.push({
                name,
                in: 'path',
                required: true,
                schema: { 
                    type: type.name.toLowerCase()
                }
            })
         
        else if(md.hasMetadata(DATA_CLASS)) {             
                descriptor.requestBody = {
                    content: { 
                        'application/json': {
                            //@ts-ignore
                            schema: global['DtoSchemaStorage'].get(type)
                        }
                    }
                }
            }
               

       
    }

    return descriptor;
}

function processController(controller: typeof IController): HandlerDescriptor[] {
    const routePrefix = metadata(controller).getMetadata(CONTROLLER);   
    const routeMethods = reflectClassMethods(controller).filter(method => isRouteHandler(controller.prototype, method));

    return routeMethods.map(method => {
        const descriptor = processMethod(controller, method);
        descriptor.path = concatinateBase(routePrefix.path, descriptor.path);      

        return descriptor;
    });
}

export function generateOpenAPI() {
    const controllers = readControllers(['C:/Projects/VSCode/Addax/DMT/front-service/build', '!C:/Projects/VSCode/Addax/DMT/front-service/build/index.js']);
    
    const document: OpenAPIV3.Document = {
        openapi:  "3.0.0",
        info: {
            title: "Test",
            version: "0.1"
        },
        paths: {}
    };
    
    for(const controller of controllers) {
        const handlers =  processController(controller); 
        
        handlers.forEach(({ path, method, ...descriptor }) => {
            const route = remapPath(path);
            //@ts-ignore        
            document.paths[route] = {
                ...(document.paths[route] || {}),
                [method]: descriptor
            };
        });
    }

    writeFile('swagger.json', process.cwd(), JSON.stringify(document, null, 4));
}