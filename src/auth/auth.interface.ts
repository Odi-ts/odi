import "fastify-cookie";
import { Request, RequestMiddleware, RoutingContext } from "../aliases";
import { IUser } from "./auth.container";

export abstract class IAuth<T extends object, U, Container extends IUser<T, U> = IUser<T, U>> {

    constructor() {
        this.configure();
    }

    public authenticate(context: RoutingContext, data: Container, options: any): Promise<boolean> | boolean | void {
        return true;
    }

    /* Abstract Methods */
    public abstract deserialize(decoding: T | null): Promise<U | null | undefined> |  U | null | undefined;

    public abstract serialize(user: U): T | Promise<T>;

    /** Private abstactions for strategy definition */
    public extractUser(ctx: Request): Container {
        throw Error("extractUser(ctx: Request) must implemented on Strategy");
    }

    public abstract getMiddleware(options?: any): RequestMiddleware;

    /* Hooks */
    protected configure() {}

}
