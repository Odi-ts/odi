import { IAuth } from "../auth.interface";
import { JWT } from "../auth.types";
import { IUser } from "../auth.container";
import { Request } from "../../aliases";


export class JWTUser<Decoding extends object, User> extends IUser<Decoding, User> {
    private decoding: Decoding & JWT.DefaultFields | null;
    public token: string;
    
    constructor(token: string, private readonly authService: JWTAuth<Decoding, User>) {
        super();
        this.token = token;
    }


    decode(options?: JWT.DecodeOptions): Decoding &  JWT.DefaultFields {
        if(!this.decoding) {
            this.decoding = (this.authService.decodeToken(this.token, options) as Decoding & JWT.DefaultFields);
        }

        return this.decoding;
    }

    verify(options?: JWT.VerifyOptions) {
        let result: [ Error | null, Decoding & JWT.DefaultFields | null];
        
        try {
            result = [ null, this.authService.verifyToken(this.token, options) ];
            
        } catch (err) {
            result = [ (err as Error), null];
        }

        this.decoding = result[1];

        return result;
    }
 
        
    async load(options?: JWT.DecodeOptions) {
        return this.authService.deserialize(this.decode(options) as any);
    }    
    
    async assign(user: User, options?: JWT.SignOptions): Promise<string> {
        return this.authService.createToken(await this.authService.serialize(user), options);
    }
}

export abstract class JWTAuth<T extends object, U> extends IAuth<T,U, JWTUser<T,U>> {
    private secret: string;
    private container: string;
    private expiration: string | number;

    private jsonwebtoken = require("jsonwebtoken");

    /** Extractions */
    protected extractUser(ctx: Request): JWTUser<T, U>{
        return new JWTUser<T, U>(this.extractToken(ctx, this.container), this);
    }

    private extractToken(ctx: Request, container: string) {  
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


    /** JWT Methods */
    public createToken(data: T, options?: JWT.SignOptions): string{
        return this.jsonwebtoken.sign(data, this.secret, { exp: this.expiration, ...options });
    }

    public verifyToken(token: string, options?: JWT.VerifyOptions): T & JWT.DefaultFields  {
        return (this.jsonwebtoken.verify(token, this.secret, options) as T & JWT.DefaultFields);
    }

    public decodeToken(token: string, options?: JWT.DecodeOptions): T & JWT.DefaultFields | null {
        return (this.jsonwebtoken.decode(token, options) as T & JWT.DefaultFields);
    }

    public abstract deserialize(decoding: T & JWT.DefaultFields | null): Promise<U | null | undefined> |  U | null | undefined;
}