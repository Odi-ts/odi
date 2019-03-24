import { CoreAuth } from "../../auth/local/auth.interface";
import { RequestMiddleware } from "../../aliases";

export function bindAuthMiddleware(options: unknown, auth: CoreAuth<object, object>): RequestMiddleware {
    return async (request, response) => {   
        const context = { request, response }; 
        const user = auth['extractUser'](request);
        
        const [ err ] = user.verify();
        
        /** Refresh hook */
        const refresh = await auth.refresh(context, user, options);

        if(err && !refresh) {
            response.status(401).send();
            return;
        }

        const result = await auth.authenticate(context, user, options);
        
        if(result !== true) {
            response.status(403).send(); 
            return;
        }

        request.locals =  { user };
    };
}