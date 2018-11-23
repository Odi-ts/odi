import { Request, Context } from '../../aliases';
import { UserData } from './auth.container';
import { SignOptions, VerifyOptions, DecodeOptions } from './auth.types';

export abstract class CoreAuth<T extends object, U>{  
    protected secret: string;
    protected container: string | undefined;
    protected expiration: string | number;    

    private jsonwebtoken: any;

    constructor(){
        this.configure();
    }
   
    private extractUser(ctx: Request): UserData<T, U>{
        return new UserData<T, U>(this.extractToken(ctx), this);
    }

    private extractToken(ctx: Request, container: string = this.container = "authorization"){  
        const header = ctx.get(container);
        
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

    public verifyToken(token: string, options?: VerifyOptions): T {
        return (this.jsonwebtoken.verify(token, this.secret, options) as T);
    }

    public decodeToken(token: string, options?: DecodeOptions): T | null {
        return (this.jsonwebtoken.decode(token, options) as T);
    }


    /* Abstract Methods */
    public authenticate(context: Context, data: UserData<T,U>, options: any): Promise<boolean> | boolean | void {};
    
    public abstract deserialize(decoding: T | null): U;

    public abstract serialize(user: U): T;


    /* Hooks */    
    protected configure() {
        this.jsonwebtoken = require("jsonwebtoken");
    }

}