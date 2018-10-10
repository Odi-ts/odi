import { CoreAuth, BaseExtraction, UserData } from "../../auth/local/auth.interface";
import { IRouterContext } from "koa-router";
import { Context } from "koa";
import { SetOption } from "cookies";
import { Request, Response } from "../../aliases";

export class IController<T extends object = any, U = any>{ 
    private authService: CoreAuth<T,U>;    
    private userData: UserData<T,U>;

    protected context: Context;
    protected tokenData: BaseExtraction<T>;


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
        return this.context.render(template, params);
    }





    protected get user(){
        if(!this.authService){
            throw new Error('No auth service.');
        }

        if(this.userData){
            return this.userData;
        }

        const token = this.authService['extractToken'](this.request);

        if(!token){
            return null;
        }
      
        this.tokenData = this.authService['extractData'](token);
        this.userData = this.authService['extractUser'](this.request, this.response, () => new Promise(() => console.log('path')), this.tokenData)
        
        return this.userData;      
    }

    private applyContext(context: IRouterContext){
        this.context = context;
        return this;
    }

}
