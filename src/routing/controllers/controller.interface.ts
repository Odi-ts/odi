import { Request, Response } from "../../aliases";
import { CoreAuth } from "../../auth/local/auth.interface";
import { UserData } from "../../auth/local/auth.container";

import { Decoding, User } from "./controller.types";
import { CookieOptions } from "express";

export class IController<T = any>{ 
    private authService: CoreAuth<Decoding<T>, User<T>>;    
    private userData: UserData<Decoding<T>, User<T>>;

    /* Express request and response */
    protected request: Request;
    protected response: Response;

    
    /* Complex objects */
    getHeaders(){
        return this.request.headers;
    }

    getQuery(){
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
        return this.request.get(key);
    }


   /* Single set */
    setCookie(key: string, value: string, options: CookieOptions = {}): void{
        this.response.cookie(key, value, options);
    }

    setHeader(key: string, value: string){
        this.response.set(key, value);
    }


    /* Useful actions */
    redirect(url: string){      
        return this.response.redirect(url)
    }

    render(template: string, params = {}){
        return this.response.render(template, params);
    }

    /* Set status */
    setStatus(status: number) {
        return this.response.status(status);
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
