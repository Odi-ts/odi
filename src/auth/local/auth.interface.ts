import "fastify-cookie";
import { Request, RoutingContext } from '../../aliases';
import { UserData } from './auth.container';
import { SignOptions, VerifyOptions, DecodeOptions, DefaultFields } from './auth.types';

export abstract class CoreAuth<T extends object, U, P extends object = T & DefaultFields>{  
    protected secret: string;
    protected container: string | undefined;
    protected expiration: string | number;    

    private jsonwebtoken = require("jsonwebtoken");

    constructor(){
        
        this.configure();
    }
   
    private extractUser(ctx: Request): UserData<P, U>{
        return new UserData<P, U>(this.extractToken(ctx), this);
    }

    private extractToken(ctx: Request, container: string = this.container = "authorization"){  
        const header = ctx.headers[container];
        
        let def;
        if(header){
            const parts = header.split(' ');
            if(parts.length == 2){
                def = parts[1];
            }
        }
        
        return def || ctx.cookies[container];
    }

    /*
        protected applyStrategy(key: string, srategy: Strategy){
            passport.use(key, srategy);
        }
    */
    public createToken(data: T, options?: SignOptions): string{
        return this.jsonwebtoken.sign(data, this.secret, options);
    }

    public verifyToken(token: string, options?: VerifyOptions): P  {
        return (this.jsonwebtoken.verify(token, this.secret, options) as P);
    }

    public decodeToken(token: string, options?: DecodeOptions): P | null {
        return (this.jsonwebtoken.decode(token, options) as P);
    }

    /* Hooks */
    public refresh(context: RoutingContext, data: UserData<P, U>, options: any): Promise<boolean> | boolean | void {
        return false;
    }

    public authenticate(context: RoutingContext, data: UserData<P, U>, options: any): Promise<boolean> | boolean | void {
        return true;
    }


    /* Abstract Methods */
    public abstract deserialize(decoding: P | null): Promise<U | null | undefined> |  U | null | undefined;

    public abstract serialize(user: U): T | Promise<T>;


    /* Hooks */    
    protected configure() {}

}