import * as keys from '../../definitions'

import * as Koa from 'koa';
import * as Router from 'koa-router';

import * as Ajv from 'ajv';

import DependencyComposer from '../../dependency/dependency.composer';

import { IRouterContext } from 'koa-router'
import { RouteMetadata, isRouteHandler, ControllerMeta } from './controller.decorators'
import { RFunction, ILoader, reflectOwnProperties } from '../../utils/directory.loader';
import { CoreAuth } from '../../auth/local/auth.interface';
import { getFunctionArgs, FunctionParam } from '../../utils/function.reflection';
import { MiddlewareFunction } from '../middleware/middleware.decorators';
import { metadata } from '../../utils/metadata.utils';
import { IController } from './controller.interface';
import { IHttpError } from '../../errors/http.error';
import { plainToClass } from '../../dto/dto.transformer';
import { DtoSchemaStorage } from '../../dto/dto.storage';


export type AuthMetadata = any;
export interface LoaderOptions {
    app: Koa
    dependencyComposer: DependencyComposer
}

export class ControllersLoader implements ILoader {

    constructor(readonly options: LoaderOptions) {
        this.bindHandler.bind(this);
    }


    public processBase(): RFunction {
        const auth = this.options.dependencyComposer.getById('auth');

        return async (classType: any) => {
            const ctrlMeta = metadata(classType);            
            const target: IController = await this.options.dependencyComposer.instanciateClassType(classType);
            target['authService'] = auth;

            const base: ControllerMeta = ctrlMeta.getMetadata(keys.CONTROLLER);
            const middlware: MiddlewareFunction[] = ctrlMeta.getMetadata(keys.ROUTE_MIDDLEWARE) || [];

            const router = new Router({ prefix: base.path });
            router.use(...middlware);

            for (let propertyKey of [...reflectOwnProperties(target)]) {               
                if (isRouteHandler(target, propertyKey)) {       
                    const meta = metadata(target, propertyKey);
                    
                    const { path, method }: RouteMetadata = meta.getMetadata( meta.hasMetadata(keys.RAW_ROUTE) ? keys.RAW_ROUTE : keys.ROUTE);
                    const params = getFunctionArgs(target, propertyKey);

                    const auMeta: AuthMetadata =  meta.getMetadata(keys.AUTH_MIDDLEWARE);                   
                    const mdMeta: MiddlewareFunction[] = meta.getMetadata(keys.ROUTE_MIDDLEWARE) || [];
                    
                    const isProtected = meta.hasMetadata(keys.AUTH_MIDDLEWARE);

                    router[method](path, ...mdMeta, this.bindHandler(target, propertyKey, params));                    
                }
            }

          
            this.options.app
                .use(router.routes())
                .use(router.allowedMethods());
        }
    }

    public bindHandler(target: IController, property: string, rawParams: FunctionParam[]) {        
        const validate = DtoSchemaStorage.get(this.getDto(rawParams))!;

        return async (ctx: IRouterContext, next: () => Promise<any>) => {
            const ctrl = this.bindController(target)['applyContext'](ctx);
            
            try {    
                if(validate)  
                    await validate(ctx.request.body);

                const params = await this.bindParams(ctx, rawParams);

                ctx.body = await ctrl[property].call(ctrl, ...params);
            } catch (error) {
                
                if(error instanceof IHttpError){
                    ctx.throw(error.getHttpCode(), error.message);

                //@ts-ignore
                } else if(error instanceof Ajv.ValidationError) {
                    ctx.body = error.errors;
                } else {
                    throw error;
                }
                
            }
        }
    }

    private async bindParams(ctx: IRouterContext, rawParams: FunctionParam[]) {
        const params = [];
        
        for(const param of rawParams) {
            if(param.type.name === 'String') {
                params.push(ctx.params[param.name]);

            /* Treat like constructor */
            } else if(typeof param.type === 'function' && Reflect.hasMetadata(keys.DATA_CLASS, param.type)) { 
                params.push(await plainToClass(param.type, ctx.request.body));  
            } else {
                params.push(undefined);
            }
        }

        return params;
    }

    private bindController(target: IController){
        return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    }

    private getDto(rawParams: FunctionParam[]) {
        for(const param of rawParams)
            if(typeof param.type === 'function' && Reflect.hasMetadata(keys.DATA_CLASS, param.type))
                return param.type    
    }
}