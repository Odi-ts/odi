import { Request, Response } from "../../aliases";
import { IAuth } from "../../auth/auth.interface";

import { DefaultHeaders, DefaultQuery, FastifyReply } from "fastify";
import { FastifyCookieOptions } from "fastify-cookie";
import { Decoding, User, UserContainer } from "./controller.types";

export class IController<T = any> {

    protected get user() {
        if (!this.authService) {
            throw new Error("No auth service.");
        }

        if (this.userData) {
            return this.userData;
        }

        this.userData = this.authService.extractUser(this.request);

        return this.userData;
    }

    /* Express request and response */
    protected request: Request;
    protected response: Response;
    private authService: IAuth<Decoding<T>, User<T>, UserContainer<T>>;
    private userData: UserContainer<T>;

    /* Complex objects */
    public getHeaders(): DefaultHeaders {
        return this.request.headers;
    }

    public getQuery(): DefaultQuery {
        return this.request.query;
    }

    /* Single get */
    public getQueryParam(key: string) {
        return this.request.query[key];
    }

    public getCookie(key: string) {
        return this.request.cookies[key];
    }

    public getParam(key: string) {
        return this.request.params[key];
    }

    public getHeader(key: string) {
        return this.request.headers[key];
    }

   /* Single set */
    public setCookie(key: string, value: string, options: FastifyCookieOptions = {}): void {
        this.response.setCookie(key, value, options);
    }

    public setHeader(key: string, value: string) {
        this.response.header(key, value);
    }

    public setType(type: string) {
        this.response.type(type);
    }

    /* Useful actions */
    public redirect(url: string, code: number = 302): FastifyReply<import ("http").ServerResponse> {
        return this.response.redirect(code, url);
    }

    /* Set status */
    public setStatus(status: number) {
        return this.response.code(status);
    }

    private applyContext(req: Request, res: Response) {
        this.request = req;
        this.response = res;

        return this;
    }

}
