import { Context } from "koa";
import { SetOption } from "cookies";
import { IRouterContext } from "koa-router";

import { Request, Response } from "../../aliases";
import { CoreAuth } from "../../auth/local/auth.interface";
import { UserData } from "../../auth/local/auth.container";

import { Decoding, User } from "./controller.types";

export class IController<T = any>{ 
    private authService: CoreAuth<Decoding<T>, User<T>>;    
    private userData: UserData<Decoding<T>, User<T>>;

    protected context: Context;

    /* Koa request and response */
    get request(): Request{
        return this.context.request;
    }

    get response(): Response{
        return this.context.response;
    }

    /* Raw Http request and response */
    get httpRequest(){
        return this.context.req;
    }

    get httpResponse(){
        return this.context.res;
    }


    /* Complex objects */
    getHeaders(){
        return this.request.headers;
    }

    getQuery(){
        return this.request.query;
    }


    /* Single get */
    getQueryParam(key: string) {
        return this.context.query[key];
    }

    getCookie(key: string) {
        return this.context.cookies.get(key);
    }

    getParam(key: string) {
        return this.context.params[key];
    }

    getHeader(key: string) {
        return this.context.get(key);
    }


   /* Single set */
    setCookie(key: string, value: string, options?: SetOption): void{
        this.context.cookies.set(key, value, options);
    }

    setHeader(key: string, value: string){
        this.context.set(key, value);
    }


    /* Useful actions */
    redirect(url: string){      
        return this.context.redirect(url)
    }

    render(template: string, params = {}){
        return (this.context as any).render(template, params);
    }





    protected get user(){
        if(!this.authService){
            throw new Error('No auth service.');
        }

        if(this.userData){
            return this.userData;
        }

        this.userData = this.authService['extractUser'](this.context);
        
        return this.userData;      
    }

    private applyContext(context: IRouterContext){
        this.context = context;
        return this;
    }

}
