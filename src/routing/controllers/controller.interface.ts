import { Request, Response } from "../../aliases";
import { CoreAuth } from "../../auth/local/auth.interface";
import { UserData } from "../../auth/local/auth.container";

import { Decoding, User } from "./controller.types";
import { CookieSerializeOptions } from "fastify";

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
        return this.request.headers[key];
    }


   /* Single set */
    setCookie(key: string, value: string, options: CookieSerializeOptions = {}): void{
        this.response.setCookie(key, value, options);
    }

    setHeader(key: string, value: string){
        this.response.header(key, value);
    }


    /* Useful actions */
    redirect(url: string, code: number = 302){      
        return this.response.redirect(code, url)
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
