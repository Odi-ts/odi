import { Request, Response } from "../../aliases";
import { CoreAuth } from "../../auth/local/auth.interface";



export function extractAuth(auth : CoreAuth<any,any>){    
    return (req: Request, res: Response, next: any) => {
        if(auth === null || auth === undefined){
            (<any>req)['tokenData'] = null;
            (<any>req)['tokenUser'] = null;
            return next();
        }

        (<any>req)['tokenData'] = auth['extractData'](auth['extractToken'](req));
        (<any>req)['tokenBase'] = auth['extractUser'](
            req,
            res,
            next,
            (<any>req)['tokenData']
        );
        
        return next();
    }
}


export function extractUser(auth: CoreAuth<any,any>, options?: any){
    return async (req: Request, res: Response, next: any) => await auth['extractProtected'](req, res, next, options);
}
