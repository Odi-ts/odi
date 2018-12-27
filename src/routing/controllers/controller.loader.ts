import * as keys from '../../definitions'
import DependencyComposer from '../../dependency/dependency.composer';

import { FastifyInstance, RouteSchema } from 'fastify';

import { RouteMetadata, isRouteHandler, ControllerMeta } from './controller.decorators'
import { RFunction, ILoader, reflectOwnProperties } from '../../utils/directory.loader';
import { getFunctionArgs, FunctionParam } from '../../utils/reflection/function.reflection';

import { metadata } from '../../utils/metadata.utils';
import { IController } from './controller.interface';
import { IHttpError } from '../../http/http.error';
import { plainToClass } from '../../dto/dto.transformer';
import { DtoSchemaStorage } from '../../dto/dto.storage';
import { bindAuthMiddleware } from '../middleware/middleware.functions';
import { HttpMessage } from '../../http/http.message';
import { RequestMiddleware, RequestHandler, Request } from '../../aliases';
import { concatinateBase } from '../../utils/url.utils';

export type AuthMetadata = any;

export interface LoaderOptions {
    app: FastifyInstance;
    dependencyComposer: DependencyComposer;
}

export class ControllersLoader implements ILoader {

    constructor(readonly options: LoaderOptions) {
        this.bindHandler.bind(this);
    }


    public processBase(): RFunction {
        const auth = this.options.dependencyComposer.getById('auth');
        const { app } = this.options;

        return async (classType: any) => {
            const ctrlMeta = metadata(classType);            
            const target: IController = await this.options.dependencyComposer.instanciateClassType(classType);
            target['authService'] = auth;

            const base: ControllerMeta = ctrlMeta.getMetadata(keys.CONTROLLER);
            const ctrlMd: RequestMiddleware[] = ctrlMeta.getMetadata(keys.ROUTE_MIDDLEWARE) || [];

            for (let propertyKey of [...reflectOwnProperties(target)]) {               
                if (isRouteHandler(target, propertyKey)) {       
                    const meta = metadata(target, propertyKey);
                    
                    const { path, method }: RouteMetadata = meta.getMetadata( meta.hasMetadata(keys.RAW_ROUTE) ? keys.RAW_ROUTE : keys.ROUTE);
                    const params = getFunctionArgs(target, propertyKey);

                    const auMeta: AuthMetadata =  meta.getMetadata(keys.AUTH_MIDDLEWARE);                   
                    const routeMd: RequestMiddleware[] = meta.getMetadata(keys.ROUTE_MIDDLEWARE) || [];
                    
                    if(ctrlMeta.hasMetadata(keys.AUTH_MIDDLEWARE))
                        ctrlMd.push(bindAuthMiddleware(ctrlMeta.getMetadata(keys.AUTH_MIDDLEWARE), auth));

                    if(meta.hasMetadata(keys.AUTH_MIDDLEWARE))
                        routeMd.push(bindAuthMiddleware(auMeta, auth));

                    const route = concatinateBase(base.path, path);

                    app[method](route, { 
                        schema: {
                            ...this.getSchemaDescriptor(params)
                        },
                        beforeHandler: [...ctrlMd, ...routeMd] 
                    }, this.bindHandler(target, propertyKey, params));                    
                }
            }

        }
    }

    public bindHandler(target: IController, property: string, rawParams: FunctionParam[]): RequestHandler {        
        return async (req, res) => {
            const ctrl = this.bindController(target)['applyContext'](req, res);

            //@ts-ignore;          
            ctrl['userData'] = req.locals ? req.locals.user : null;

            try {    
                const params = await this.bindParams(req, rawParams);
                const result = await ctrl[property].call(ctrl, ...params);

                if(res.sent)
                    return;
                    
                if (result instanceof HttpMessage) {
                    res.status(result.code).send(result.body);

                    return;
                }

                res.send(result);   

            } catch (error) {
                
                if(error instanceof IHttpError)
                    return res.status(error.getHttpCode()).send(error.message);
                else 
                    throw error;
            }
        }
    }

    private async bindParams(req: Request, rawParams: FunctionParam[]) {
        const params = [];
        
        for(const param of rawParams) {
            if(param.type.name === 'String') {
                params.push(req.params[param.name]);

            /* Treat like constructor */
            } else if(typeof param.type === 'function' && Reflect.hasMetadata(keys.DATA_CLASS, param.type)) { 
                params.push(await plainToClass(param.type, req.body));  
            } else {
                params.push(undefined);
            }
        }

        return params;
    }

    private bindController(target: IController){
        return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    }

    private getSchemaDescriptor(rawParams: FunctionParam[]) {
        const schema: RouteSchema = {};

        for(const param of rawParams)
            if(typeof param.type === 'function' && Reflect.hasMetadata(keys.DATA_CLASS, param.type))
                schema.body = DtoSchemaStorage.get(param.type);

        return schema;
    }
}