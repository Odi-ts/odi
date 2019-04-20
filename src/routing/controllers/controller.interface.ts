import { Request, Response } from "../../aliases";
import { IAuth } from "../../auth/auth.interface";

import { Decoding, User, UserContainer } from "./controller.types";
import { DefaultHeaders, DefaultQuery, FastifyReply } from "fastify";
import { FastifyCookieOptions } from 'fastify-cookie';

export class IController<T = any>{ 
    private authService: IAuth<Decoding<T>, User<T>, UserContainer<T>>;    
    private userData: UserContainer<T>;

    /* Express request and response */
    protected request: Request;
    protected response: Response;

    
    /* Complex objects */
    getHeaders(): DefaultHeaders{
        return this.request.headers;
    }

    getQuery(): DefaultQuery{
        return this.request.query;
    }


    /* Single get */
    getQueryParam(key: string) {
        return this.request.query[key];
    }

    getCookie(key: string) {
        return this.request.cookies[key];
    }

    getParam(key: string) {
        return this.request.params[key];
    }

    getHeader(key: string) {
        return this.request.headers[key];
    }


   /* Single set */
    setCookie(key: string, value: string, options: FastifyCookieOptions = {}): void{
        this.response.setCookie(key, value, options);
    }

    setHeader(key: string, value: string){
        this.response.header(key, value);
    }

    setType(type: string) {
        this.response.type(type);
    }


    /* Useful actions */
    redirect(url: string, code: number = 302): FastifyReply<import('http').ServerResponse>{      
        return this.response.redirect(code, url);
    }

    /* Set status */
    setStatus(status: number) {
        return this.response.code(status);
    }




    protected get user(){
        if(!this.authService){
            throw new Error('No auth service.');
        }

        if(this.userData){
            return this.userData;
        }

        this.userData = this.authService['extractUser'](this.request);
        
        return this.userData;      
    }

    private applyContext(req: Request, res: Response){
        this.request = req;
        this.response = res;

        return this;
    }

}
