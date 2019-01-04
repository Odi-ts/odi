import { Server, IncomingMessage, ServerResponse} from 'http';

import { 
    FastifyRequest,
    FastifyReply, 
    RequestHandler as FastifyRequestHandler, 
    FastifyMiddleware
} from 'fastify';

export type RequestHandler = FastifyRequestHandler<IncomingMessage, ServerResponse>;

export type RequestMiddleware = FastifyMiddleware<Server, IncomingMessage, ServerResponse>;

export type Request = FastifyRequest<IncomingMessage>;

export type Response = FastifyReply<ServerResponse>;

export interface Context {
    request: Request;
    response: Response;
}