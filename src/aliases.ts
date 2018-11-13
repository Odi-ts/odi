import { Response as ERes, Request as EReq } from 'express';

export { Request, Response, RequestHandler } from 'express';
export type Context =  { 
    request: EReq,
    response: ERes 
};