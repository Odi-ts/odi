import { CoreAuth } from "../../auth/local/auth.interface";
import { RequestMiddleware } from "../../aliases";

export function bindAuthMiddleware(options: unknown, auth: CoreAuth<object, object>): RequestMiddleware {
    return async (request, response, next) => {   
        const user = auth['extractUser'](request);
        const [ err, decoding ] = user.verify();

        if(err)
            return response.status(401).send();

        user['decoding'] = decoding;
        const result = await auth.authenticate({ request, response }, user, options);

        //@ts-ignore
        request['locals'] =  { user };

        if(result === true)
            return next();
        else   
            return response.status(403).send(); 
    };
}