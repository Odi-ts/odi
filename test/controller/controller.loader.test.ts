import * as fastify from 'fastify';

import { expect } from 'chai';
import { createRequest, createResponse } from 'node-mocks-http';
import { IController, Controller, Post, Data, MinLength, IHttpError, Middleware } from "../../src";
import { ControllersLoader } from "../../src/routing/controllers/controller.loader";
import { getDependencyComposer } from "../utils/di.utils";
import { getFunctionArgs } from '../../src/utils/reflection/function.reflection';
import { plainToClass } from '../../src/dto/dto.transformer';
import { buildParamsFunc } from '../../src/comiler/binders';


@Data()
class SampleControllerDto {

    @MinLength(2)
    title: string;
}

@Middleware((req,res, next) => {
    (req.query as any) = 'hello';
    next();
})

@Controller('/custom')
class SampleController extends IController{

    // tslint:disable-next-line:function-name
    @Post '/smth/:id/:name' (id: string, name: string, anything: number, dto: SampleControllerDto) {
        console.log(id, name, anything, dto);

        if(name == id && name == dto.title)
            throw new Error();        

        if(name == id)
            throw new IHttpError('wrong payload', 400);

        return `${id}, ${name}, ${dto.title}`;
    }

}

const requestPayload = { 
    params: { id: '916a26a2-c5e7-4ac8-be62-da0aecb93dc0', name: 'Odi' },  
    body: { title: 'Odi-ts' }
};

describe('Controller Loader', async () => {
    const app = fastify();
    const dependencyComposer = getDependencyComposer();
    const dependencyContainer = dependencyComposer['container'];

    const loader = new ControllersLoader({ dependencyComposer, app });
    const processor = await loader.processBase();
    const controller = new SampleController();    
    const args = getFunctionArgs(controller, '/smth/:id/:name');
    const request = createRequest(requestPayload);   

    describe('#buildParamsFunc(...)', () => {
        
        it('should return correct array of params', async () => { 
            const binded = await buildParamsFunc(args)(request as any);

            expect(binded).to.be.instanceOf(Array);
            expect(binded).to.have.length(4);
            expect(binded).to.deep.eq([
                '916a26a2-c5e7-4ac8-be62-da0aecb93dc0',
                'Odi', 
                undefined, 
                await plainToClass(SampleControllerDto, request.body)
            ]);
        });
    });

    describe('#processBase(...)', async () => {      
            
        it('should return processing function', () => expect(processor).to.be.instanceOf(Function));

        it('should not put instance in DI container', () => {                
            processor(SampleController);
            expect(dependencyContainer.contain(SampleController, 'default')).to.be.eq(false);
        });
    });

    describe('#bindHandler(...)', async () => {
        const handler = loader.bindHandler(controller, SampleController, '/smth/:id/:name', args);

        it('should return function for router', () => expect(handler).to.be.instanceOf(Function));

        it('should process request (with middleware) and return result', async () => {
            const { params, body } = requestPayload; 
            const response = createResponse();

            // As using async in declaration, reference to actual result
            await handler(request as any, response as any);
    
            expect(response._getData()).to.be.eq(`${params.id}, ${params.name}, ${body.title}`);
        });

        it('should process request and return http status with message for throwing IHttpError', async () => { 
            const request = createRequest({ params: { id: '1', name: '1' }, body: requestPayload.body });
            const response = createResponse();

            await handler(request as any, response as any);
            
            expect(response._getStatusCode()).to.be.eq(400);
            expect(response._getData()).to.be.eq('wrong payload');
        });

        it('should throw error on unexpected throw', async () => {  
            const request = createRequest({ params: { id: 'qwerd', name: 'qwerd' }, body: { title: 'qwerd' } });
            const response = createResponse();
            
            try {
                await handler(request as any, response as any,);
            } catch (err) {
                expect(err).to.be.instanceOf(Error);
            }
        });

    });
});