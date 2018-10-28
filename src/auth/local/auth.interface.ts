import { sign, verify, decode } from 'jsonwebtoken'
import { Request, Response } from '../../aliases';
//import { Strategy } from 'passport';
//import * as passport from 'passport';


export abstract class UserData<Decoding, User>{      
    abstract load(options?: any) : Promise<User | null>;    
    abstract assign(data: User, options?: any) : Promise<any> | void;
    abstract destroy(options?: any) : void;
    //abstract requestStrategy(name: string, options? :any): void;
    //abstract acceptStrategy(name: string, options?: any): Promise<any>;
}
    
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
    }
   
    private extractUser(req: Request, res: Response, next: () => Promise<any>, { token, decoded }: BaseExtraction<T>): UserData<T, U>{
        return ({
            load:  (options?: any) => this.load(decoded, options),
            assign: (user: U, options?: any) =>  this.assign(req, res, user, options),
            destroy: (options?: any) => this.destroy(req, res, options),
            
            /*
            requestStrategy: (name: string, options?: any) => passport.authenticate(name, options)(req,res,next),
            acceptStrategy: (name: string, options: any = {}) => new Promise((resolve, reject) => {
                passport.authenticate(name, options, (err, profile, info) => err ? reject(err) : resolve({ profile, info }) )(req,res,next);
            })*/
        });
    }

    private extractData(token: string): BaseExtraction<T>{
        let decoded = null;
        
        try{
            decoded = token ? this.decodeToken(token) : null;
        }catch{
            decoded = null;
        }

        return {
            token,
            decoded
        }
    }

    private extractToken(req: Request, container: string = this.container){  
        const header = req.header('authorization') ;
        let def = undefined;

        if(header){
            const parts = header.split(' ');
            if(parts.length == 2){
                def = parts[1];
            }
        }

        return def //|| req[container] || req.headers[container] || req.body[container];
    }

    private async extractProtected(req: Request, res: Response, next: () => Promise<any>, options?: any){
        let tokenBase = <UserData<T,U>>(<any>req)['tokenBase'];
        let user = await tokenBase.load();

        (<any>req).tokenUser = user;
                
        await this.authenticated(req, res, next, user, options);
    }


    protected configure(){};

    
    /*
    protected applyStrategy(key: string, srategy: Strategy){
        passport.use(key, srategy);
    }*/

    public createToken(data: T, secret?: string): string{
        return sign(data, secret || this.secret);
    }

    public verifyToken(token: string, secret?: string): string | T{
        let vr: object | string = verify(token, secret || this.secret);

        if(typeof vr === 'string'){
            return vr;
        }

        return <T>vr;
    }

    public decodeToken(token: string): T | null {
        return (decode(token) as T);
    }


    abstract load(decoding: T | string | object | null, options?: any): Promise<U | null>;
    
    abstract assign(req: Request, res: Response, payload: U, options?: any): Promise<any>;

    abstract destroy(req: Request, res: Response, options?: any): any;

    abstract authenticated(req: Request, res: Response, next: () => Promise<any>, user: U | null | undefined, options?: any): Promise<void | any>;
}