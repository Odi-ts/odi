import { sign, verify, decode, SignOptions } from 'jsonwebtoken'
import { Context } from '../../aliases';
import { UserData } from './auth.container';
//import { Strategy } from 'passport';
//import * as passport from 'passport';
    
interface BaseData<Decoding,User>{
    decoding: Decoding,
    user: User
}

export interface BaseExtraction<T>{
    token: any, 
    decoded: T | null
}



export abstract class CoreAuth<T extends object,U>{  
    protected secret: string;
    protected container: string;
    protected expiration: string | number;    

    constructor(){
        this.configure();

        this.decodeToken.bind(this);
    }
   
    private extractUser(ctx: Context): UserData<T, U>{
        const container = new UserData<T, U>(ctx, this);
        container.token = this.extractToken(ctx);

        return container;
    }

    private extractToken(ctx: Context, container: string = this.container){  
        const header = ctx.get('authorization');
        let def;

        if(header){
            const parts = header.split(' ');
            if(parts.length == 2){
                def = parts[1];
            }
        }

        return def || ctx.cookies.get(container);
    }


    protected configure(){};

    
    /*
    protected applyStrategy(key: string, srategy: Strategy){
        passport.use(key, srategy);
    }*/

    public createToken(data: T, options?: SignOptions): string{
        return sign(data, this.secret, options);
    }

    public verifyToken(token: string): T {
        return (verify(token, this.secret) as T);
    }

    public decodeToken(token: string): T | null {
        return (decode(token) as T);
    };
}