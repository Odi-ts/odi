import * as keys from '../../definitions'

import { Application, Router, RequestHandler, NextFunction, Request as ERequest, Response as EResponse } from 'express';

import * as Ajv from 'ajv';

import DependencyComposer from '../../dependency/dependency.composer';

import { RouteMetadata, isRouteHandler, ControllerMeta } from './controller.decorators'
import { RFunction, ILoader, reflectOwnProperties } from '../../utils/directory.loader';
import { getFunctionArgs, FunctionParam } from '../../utils/function.reflection';
import { MiddlewareFunction } from '../middleware/middleware.decorators';
import { metadata } from '../../utils/metadata.utils';
import { IController } from './controller.interface';
import { IHttpError } from '../../errors/http.error';
import { plainToClass } from '../../dto/dto.transformer';
import { DtoSchemaStorage } from '../../dto/dto.storage';


export type AuthMetadata = any;
export interface LoaderOptions {
    app: Application
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
            const middlware: RequestHandler[] = ctrlMeta.getMetadata(keys.ROUTE_MIDDLEWARE) || [];

            const router = Router();

            if(middlware.length > 0)
                router.use(...middlware);

            for (let propertyKey of [...reflectOwnProperties(target)]) {               
                if (isRouteHandler(target, propertyKey)) {       
                    const meta = metadata(target, propertyKey);
                    
                    const { path, method }: RouteMetadata = meta.getMetadata( meta.hasMetadata(keys.RAW_ROUTE) ? keys.RAW_ROUTE : keys.ROUTE);
                    const params = getFunctionArgs(target, propertyKey);

                    const auMeta: AuthMetadata =  meta.getMetadata(keys.AUTH_MIDDLEWARE);                   
                    const mdMeta: RequestHandler[] = meta.getMetadata(keys.ROUTE_MIDDLEWARE) || [];
                    
                    const isProtected = meta.hasMetadata(keys.AUTH_MIDDLEWARE);

                    router[method](path, ...mdMeta, this.bindHandler(target, propertyKey, params));                    
                }
            }

          
            this.options.app
                .use(base.path, router);
        }
    }

    public bindHandler(target: IController, property: string, rawParams: FunctionParam[]) {        
        const validate = DtoSchemaStorage.get(this.getDto(rawParams))!;

        return async (req: ERequest, res: EResponse, next: NextFunction) => {
            const ctrl = this.bindController(target)['applyContext'](req, res);
            
            try {    
                if(validate)  
                    await validate(req.body);

                const params = await this.bindParams(req, rawParams);
                const result = await ctrl[property].call(ctrl, ...params);

                if(!res.headersSent)
                    return res.send(result);

            } catch (error) {
                
                if(error instanceof IHttpError){
                    return res.status(error.getHttpCode()).send(error.message);

                //@ts-ignore
                } else if(error instanceof Ajv.ValidationError) {
                    return res.send(error.errors);
                } else {
                    throw error;
                }
                
            }
        }
    }

    private async bindParams(req: ERequest, rawParams: FunctionParam[]) {
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

    private getDto(rawParams: FunctionParam[]) {
        for(const param of rawParams)
            if(typeof param.type === 'function' && Reflect.hasMetadata(keys.DATA_CLASS, param.type))
                return param.type    
    }
}