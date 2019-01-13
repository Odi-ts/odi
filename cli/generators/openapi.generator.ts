import "reflect-metadata";
const Gauge = require("gauge");

import { OpenAPIV3 } from 'openapi-types';

import { IController, isRouteHandler } from "../../src";

import { metadata } from "../../src/utils/metadata.utils";
import { reflectClassMethods } from "../../src/utils/directory.loader";
import { CONTROLLER, RAW_ROUTE, ROUTE, DATA_CLASS, QUERY_DTO, BODY_DTO } from "../../src/definitions";

import { getFunctionArgs } from "../../src/utils/reflection/function.reflection";
import { concatinateBase } from "../../src/utils/url.utils";
import { remapPath, injectTsFiles } from '../utils';
import { Constructor } from '../types';
import { resolve } from 'path';
import { getProgram, extractReturnType } from '../ast/parser';
import { ClassDeclaration, MethodDeclaration, JSDoc, ts } from 'ts-simple-ast';
import chalk from "chalk";

type HandlerDescriptor = OpenAPIV3.OperationObject & { path: string, method: string };


function readControllers(base: string, sources: string | string[]) {
    const files = injectTsFiles(sources, base);

    return files.filter(injection => Reflect.hasMetadata(CONTROLLER, injection.classType));
}

function processJSDoc([node]: JSDoc[]) {
    if(!node) 
        return {};

    return node.getTags().reduce((p, tag) => {
        const name = tag.getTagName();
        const value = tag.getComment();
        const preVel = p[name];

        return ({
            ...p,
            [name]: name === 'send' ?
                preVel ? [...preVel, value] : [value] :
                tag.getComment()
        });
    }, {} as any);
}

function processSends(sends?: string[]) {
    if (!sends)
        return [];

    return sends.map(send => send.replace(/[\[\]\s]/g, '').split('=>'));
}

function processTags(tags: string) {
    return tags ? tags.replace(/[\[\]\s]/g, '').split(',') : [];
}



function processMethod(controller: typeof IController, handler: string, methodAST: MethodDeclaration) {
    const meta = metadata(controller.prototype, handler);
    const args = getFunctionArgs(controller.prototype, handler);
    const docs = processJSDoc(methodAST.getJsDocs()) as any;

    const { path, method } = meta.getMetadata(RAW_ROUTE) || meta.getMetadata(ROUTE);

    const descriptor: HandlerDescriptor = {
        path,
        method,
        responses: {},
        summary: docs.summary,
        description: docs.description,
        tags: processTags(docs.tags)
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

        } else if (md.getMetadata(DATA_CLASS) === BODY_DTO) {
            descriptor.requestBody = {
                content: {
                    'application/json': {
                        //@ts-ignore
                        schema: global['DtoSchemaStorage'].get(type)
                    }
                }
            };
        } else if (md.hasMetadata(DATA_CLASS) === QUERY_DTO) {
            if (!descriptor.parameters)
                descriptor.parameters = [];

            const { properties, required } = (global as any)['DtoSchemaStorage'].get(type);    
            
            for(const prop of Object.keys(properties))
                descriptor.parameters.push({
                    name: prop,
                    in: 'query',
                    required: (required as string[]).includes(prop),
                    schema: properties[prop]
                });
        }
    }

    const sends = processSends(docs.send);
    const reservedCodes: ([string, string] | undefined)[] = [];
    const returnings = extractReturnType(methodAST, reservedCodes);

    for (const [i, returning] of (returnings as OpenAPIV3.SchemaObject[]).entries()) {
        const doc = sends[i];
        const reserved = reservedCodes[i];
        
        const code = doc ? doc[0] : reserved ? reserved[0] : '200';
        const type = doc ? doc[1] : reserved ? reserved[1] : 'application/json';

        if (!descriptor.responses) {
            descriptor.responses = {};
        }

        if (!descriptor.responses[code]) {
            //@ts-ignore
            descriptor.responses = {
                ...descriptor.responses,
                [code]: {
                    content: {}
                }
            };
        }

        if (!(descriptor.responses![code] as OpenAPIV3.ResponseObject).content![type]) {
            //@ts-ignore
            descriptor.responses[code].content = {
                ...(descriptor.responses![code] as OpenAPIV3.ResponseObject).content,
                [type]: {}
            };
        }

        //@ts-ignore
        (descriptor.responses![code] as OpenAPIV3.ResponseObject).content![type].schema = returning;
    }

    return descriptor;
}

async function processController(controller: Constructor<IController>, classAST: ClassDeclaration): Promise<HandlerDescriptor[]> {
    return new Promise<any>(res =>  setTimeout(async () => {
        const routePrefix = metadata(controller).getMetadata(CONTROLLER);
        const routeMethods = reflectClassMethods(controller).filter(method => isRouteHandler(controller.prototype, method));

        const result = routeMethods.map(method => {
            const methodAST = classAST.getMethodOrThrow(method);

            const descriptor = processMethod(controller, method, methodAST);
            descriptor.path = concatinateBase(routePrefix.path, descriptor.path);

            return descriptor;
        });

        res(result);
    }, 200));
}

export async function generateOpenAPI(base: string, sources: string, rootFile: string, ) {
    const controllers = readControllers(base, [resolve(base, sources), `!${resolve(base, rootFile)}`]);
    const { version } = require(resolve(process.cwd(), './package.json'));

    const document: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: {
            title: "Test",
            version
        },
        paths: {}
    };

    
    let gt = new Gauge(process.stdout, {
        updateInterval: 50,
        theme: 'colorASCII'
    });

    let progress = 0;
    gt.show('Start processing...', progress);

    for (const [i, { classType, jsPath, tsPath }] of controllers.entries()) {

        const file = getProgram().addExistingSourceFile(tsPath);
        const classAST = file.getClass(classType.name);
        
        gt.show(chalk.yellow('Processing: ') + classType.name, (100 / controllers.length * (i + 1))/ 100);

        if (!classAST)
            throw new Error(`Can't find class - ${classType.name} in ts file - ${tsPath}`);

        const handlers = await processController(classType, classAST);

        handlers.forEach(({ path, method, ...descriptor }) => {
            const route = remapPath(path);
            //@ts-ignore        
            document.paths[route] = {
                ...(document.paths[route] || {}),
                [method]: descriptor
            };
        });
    }  
    gt.hide();

    console.log(chalk`{green ✔ Done!}`);
    return document;
}

