import * as keys from '../../definitions'

import * as Koa from 'koa';
import * as Router from 'koa-router';

import DependencyComposer from '../../dependency/dependency.composer';

import { IRouterContext } from 'koa-router'
import { RouteMetadata, isRouteHandler, ControllerMeta, ControllerType, Returning} from './controller.decorators'
import { RFunction, ILoader, reflectOwnProperties } from '../../utils/directory.loader';
import { CoreAuth } from '../../auth/local/auth.interface';
import { extractAuth, extractUser } from './controller.middleware';
import { getFunctionArgs, FunctionParam } from '../../utils/function.reflection';
import { MiddlewareFunction } from '../middleware/middleware.decorators';
import { metadata } from '../../utils/metadata.utils';
import { IController } from './controller.interface';
import { IHttpError } from '../../errors/http.error';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export type AuthMetadata = any;
export interface LoaderOptions {
    app: Koa
    dependencyComposer: DependencyComposer
}

const AsyncFunction: Function = (async () => {}).constructor;

export class ControllersLoader implements ILoader {
    private auth: CoreAuth < any, any >;

    constructor(readonly options: LoaderOptions) {
        this.bindHandler.bind(this);
    }


    public processBase(): RFunction {
        this.auth = this.options.dependencyComposer.getById('auth');

        return async (classType: any) => {
            const base: ControllerMeta = Reflect.getMetadata(keys.CONTROLLER, classType);
            const target = await this.options.dependencyComposer.instanciateClassType(classType);

            const router = new Router({ prefix: base.path });

            for (let propertyKey of [...reflectOwnProperties(target)]) {               
                if (isRouteHandler(target, propertyKey)) {       
                    const meta = metadata(target, propertyKey);
                    
                    const { path, method }: RouteMetadata = meta.getMetadata( meta.hasMetadata(keys.RAW_ROUTE) ? keys.RAW_ROUTE : keys.ROUTE);
                    const params = getFunctionArgs(target, propertyKey);

                    const auMeta: AuthMetadata =  meta.getMetadata(keys.AUTH_MIDDLEWARE);                   
                    const mdMeta: MiddlewareFunction[] = meta.getMetadata(keys.ROUTE_MIDDLEWARE);
                    
                    const isProtected = meta.hasMetadata(keys.AUTH_MIDDLEWARE);

                    router[method](path, this.bindHandler(target, propertyKey, params));                    
                }
            }

          
            this.options.app
                .use(router.routes())
                .use(router.allowedMethods());
        }
    }

    public bindHandler(target: IController, property: string, rawParams: FunctionParam[]) {
        return async (ctx: IRouterContext, next: () => Promise<any>) => {
            const ctrl = this.bindController(target)['applyContext'](ctx);
            const { params, dto } = await this.bindParams(ctx, rawParams);

            if(dto) {
                const validation = await validate(dto);

                if(validation.length > 0) {
                    ctx.body = validation;
                    return;
                }
            } 

            try {                
                ctx.body = await ctrl[property].call(ctrl, ...params);
            } catch (error) {
                
                if(error instanceof IHttpError){
                    ctx.throw(error.getHttpCode(), error.message)
                } else {
                    throw error;
                }
                
            }
        }
    }

    public async bindParams(ctx: IRouterContext, rawParams: FunctionParam[]) {
        const params = [];
        let dto = null;

        for(const param of rawParams) {
            if(param.type.name === 'String') {
                params.push(ctx.params[param.name]);

            /* Treat like constructor */
            } else if(typeof param.type === 'function' && Reflect.hasMetadata(keys.DATA_CLASS, param.type)) { 
                dto = await plainToClass(param.type, ctx.request.body);

                params.push(dto);  
            } else {
                params.push(undefined);
            }
        }

        return { params, dto };
    }

    public bindController(target: IController){
        return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    }
}