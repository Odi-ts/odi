import "fastify-cookie";
import { Request, RoutingContext } from '../../aliases';
import { UserData } from './auth.container';
import { SignOptions, VerifyOptions, DecodeOptions, DefaultFields } from './auth.types';

export abstract class CoreAuth<T extends object, U>{  
    protected secret: string;
    protected container: string | undefined;
    protected expiration: string | number;    

    private jsonwebtoken = require("jsonwebtoken");

    constructor(){
        
        this.configure();
    }
   
    private extractUser(ctx: Request): UserData<T, U>{
        return new UserData<T, U>(this.extractToken(ctx), this);
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

    public verifyToken(token: string, options?: VerifyOptions): T & DefaultFields  {
        return (this.jsonwebtoken.verify(token, this.secret, options) as T & DefaultFields);
    }

    public decodeToken(token: string, options?: DecodeOptions): T & DefaultFields | null {
        return (this.jsonwebtoken.decode(token, options) as T & DefaultFields);
    }

    /* Hooks */
    public refresh(context: RoutingContext, data: UserData<T,U>, options: any): Promise<boolean> | boolean | void {
        return false;
    }

    public authenticate(context: RoutingContext, data: UserData<T,U>, options: any): Promise<boolean> | boolean | void {
        return true;
    }


    /* Abstract Methods */
    public abstract deserialize(decoding: T | null): Promise<U | null | undefined> |  U | null | undefined;

    public abstract serialize(user: U): T | Promise<T>;


    /* Hooks */    
    protected configure() {}

}