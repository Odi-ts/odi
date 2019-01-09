import chalk from 'chalk';
import { OpenAPIV3 } from 'openapi-types';

import { IController, isRouteHandler } from "../../src";

import { metadata } from "../../src/utils/metadata.utils";
import { reflectClassMethods } from "../../src/utils/directory.loader";
import { CONTROLLER, RAW_ROUTE, ROUTE, DATA_CLASS } from "../../src/definitions";

import { getFunctionArgs } from "../../src/utils/reflection/function.reflection";
import { concatinateBase } from "../../src/utils/url.utils";
import { remapPath, writeFile, injectTsFiles } from '../utils';
import { Constructor } from '../types';
import { getProgram, extractReturnType } from '../ast/parser';
import { ClassDeclaration, MethodDeclaration } from 'ts-simple-ast';
import { relative, join, resolve } from 'path';

type HandlerDescriptor = OpenAPIV3.OperationObject & { path: string, method: string };



function readControllers(base: string, sources: string | string[]) {
    const files = injectTsFiles(sources, base);

    return files.filter(injection => Reflect.hasMetadata(CONTROLLER, injection.classType));
}

function processMethod(controller: typeof IController, handler: string, methodAST: MethodDeclaration) {
    const meta = metadata(controller.prototype, handler);
    const args = getFunctionArgs(controller.prototype, handler);

    const { path, method } = meta.getMetadata(RAW_ROUTE) || meta.getMetadata(ROUTE);

    const descriptor: HandlerDescriptor = {
        path,
        method
    };

    for (const { name, type } of args) {
        const md = metadata(type);

        if ([String, Number, Boolean].includes(type)) {
            if (!descriptor.parameters)
                descriptor.parameters = [];

            descriptor.parameters.push({
                name,
                in: 'path',
                required: true,
                schema: {
                    type: type.name.toLowerCase()
                }
            });

        } else if (md.hasMetadata(DATA_CLASS)) {
            descriptor.requestBody = {
                content: {
                    'application/json': {
                        //@ts-ignore
                        schema: global['DtoSchemaStorage'].get(type)
                    }
                }
            };
        }
    }

    //if(handler === 'getUser') {
        try {
            const returnings = extractReturnType(methodAST);
            descriptor.responses = {
                '200': {
                    content: {
                        'application/json': {
                            schema: returnings[0] as OpenAPIV3.SchemaObject
                        }
                    },
                    description: ''
                },
                '201': {
                    content: {
                        'application/json': {
                            schema: returnings[1] as OpenAPIV3.SchemaObject
                        }
                    },
                    description: ''
                },
                '202': {
                    content: {
                        'application/json': {
                            schema: returnings[2] as OpenAPIV3.SchemaObject
                        }
                    },
                    description: ''
                }

            };
        } catch (err) {
            console.log(handler);
        }
   // }
    return descriptor;
}

function processController(controller: Constructor<IController>, classAST: ClassDeclaration): HandlerDescriptor[] {
    const routePrefix = metadata(controller).getMetadata(CONTROLLER);
    const routeMethods = reflectClassMethods(controller).filter(method => isRouteHandler(controller.prototype, method));

    return routeMethods.map(method => {
        const methodAST = classAST.getMethodOrThrow(method);

        const descriptor = processMethod(controller, method, methodAST);
        descriptor.path = concatinateBase(routePrefix.path, descriptor.path);

        return descriptor;
    });
}

export function generateOpenAPI(base: string, sources: string, rootFile: string, ) {
    console.log(base);
    console.log(resolve(base, sources));
    console.log(`!${resolve(base,rootFile)}`);

    const controllers = readControllers(base, [ resolve(base, sources), `!${resolve(base,rootFile)}` ]);
    const document: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: {
            title: "Test",
            version: "0.1"
        },
        paths: {}
    };

    for (const { classType, jsPath, tsPath } of controllers) {
        const file = getProgram().addExistingSourceFile(tsPath);
        const classAST = file.getClass(classType.name);

        if (!classAST)
            throw new Error(`Can't find class - ${classType.name} in ts file - ${tsPath}`);

        const handlers = processController(classType, classAST);

        handlers.forEach(({ path, method, ...descriptor }) => {
            const route = remapPath(path);
            //@ts-ignore        
            document.paths[route] = {
                ...(document.paths[route] || {}),
                [method]: descriptor
            };
        });
    }

    return document;
}