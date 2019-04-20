import * as keys from '../../definitions';
import DependencyComposer from '../../dependency/dependency.composer';

import { FastifyInstance, RouteSchema } from 'fastify';

import { RouteMetadata, isRouteHandler, ControllerMeta } from './controller.decorators';
import { ILoader, reflectOwnProperties } from '../../utils/directory.loader';
import { getFunctionArgs, FunctionParam } from '../../utils/reflection/function.reflection';

import { metadata } from '../../utils/metadata.utils';
import { IController } from './controller.interface';
import { IHttpError } from '../../http/error/http.error';
import { DtoSchemaStorage } from '../../dto/dto.storage';
import { bindAuthMiddleware } from '../middleware/middleware.functions';
import { HttpMessage } from '../../http/message/http.message';
import { RequestMiddleware, RequestHandler, Request } from '../../aliases';
import { concatinateBase } from '../../utils/url.utils';
import { getModule } from '../../utils/env.tools';
import { IAuth } from '../../auth/auth.interface';
import { Constructor } from '../../types';
import DependencyContainer from '../../dependency/dependency.container';
import { buildParamsFunc } from '../../comiler/binders';
import { IUser } from '../../auth/auth.container';

export type AuthMetadata = any;

export interface LoaderOptions {
    app: FastifyInstance;
    dependencyComposer: DependencyComposer;
}

export class ControllersLoader implements ILoader {

    constructor(readonly options: LoaderOptions) {
        this.bindHandler.bind(this);
    }


    public async processBase() {
        const auth = DependencyContainer.getContainer().getById('auth') as IAuth<object, object, IUser<object, object>>;
        const { app } = this.options;

        return async (classType: Constructor<IController>) => {
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
                        preHandler: [...ctrlMd, ...routeMd] 
                    }, this.bindHandler(target, classType, propertyKey, params));                    
                }
            }

            return target;
        };
    }

    public bindHandler(target: IController, classType: Constructor, property: string, rawParams: FunctionParam[]): RequestHandler {       
        const paramsGetter = buildParamsFunc(rawParams);

        return async (req, res) => {           
            const ctrl = Object.assign(new classType, target);
            //@ts-ignore;          
            ctrl['userData'] = req.locals ? req.locals.user : null;

            try {    
                const result = await ctrl[property].apply(ctrl, paramsGetter(req));

                if(res.sent)
                    return;

                if(result === null || result === undefined) {
                    res.send();

                    return;
                }
                    
                if (result instanceof HttpMessage) {
                    res.status(result.code).send(result.body);

                    return;
                }

                if (result['$$typeof'] === Symbol.for('react.element')) {      
                    const ssr = getModule('react-dom/server');

                    res.type('text/html').send(ssr.renderToString(result));
                }       

                res.send(result);  

            } catch (error) {
                
                if(error instanceof IHttpError)
                    return res.status(error.getHttpCode()).send(error.message);
                else { 
                    console.log(error);
                    throw error;
                }
            }
        };
    }

 
    private getSchemaDescriptor(rawParams: FunctionParam[]) {
        const schema: RouteSchema = {};

        for(const { type } of rawParams) {
            const md = metadata(type);

            if(typeof type === 'function' &&  md.hasMetadata(keys.DATA_CLASS)) {
                const fieldName = md.getMetadata(keys.DATA_CLASS) === keys.BODY_DTO ? 'body' : 'querystring';
                
                schema[fieldName] = DtoSchemaStorage.get(type);
            }
        }

        return schema;
    }
}