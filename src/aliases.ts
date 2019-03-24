import { Server, IncomingMessage, ServerResponse} from 'http';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fastify = require('fastify');

declare  module "fastify" {
    
   export interface FastifyRequest<
    HttpRequest,
    Query = fastify.DefaultQuery,
    Params = fastify.DefaultParams,
    Headers = fastify.DefaultHeaders,
    Body = any
  > {
    context: any;
    locals: { user? :any };
    cookies: {[cookieName: string]: string};
  }
}

/** Global types */
export type Request = FastifyRequest<IncomingMessage>;

export type Response = FastifyReply<ServerResponse>;

export type RequestHandler = (request: Request, reply: Response) => void | Promise<any>;

export type RequestMiddleware = (this: FastifyInstance<Server, IncomingMessage, ServerResponse>, req: Request, reply: Response, done: (err?: Error) => void) => void;

/** Req/res context */
export interface RoutingContext {
    request: Request;
    response: Response;
}