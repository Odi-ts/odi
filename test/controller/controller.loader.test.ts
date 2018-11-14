import * as express from 'express';
import { expect } from 'chai';
import { createRequest, createResponse } from 'node-mocks-http';
import { IController, Controller, Post, Data, MinLength, IHttpError, Middleware } from "../../src";
import { ControllersLoader } from "../../src/routing/controllers/controller.loader"
import { getDependencyComposer } from "../utils/di.utils";
import { getFunctionArgs } from '../utils/reflection/function.reflection';
import { plainToClass } from '../../src/dto/dto.transformer';

@Data()
class SampleControllerDto {

    @MinLength(2)
    title: string;
}

@Middleware((req,res, next) => {
    req.query = 'hello';
    next();
})

@Controller('/custom')
class SampleController extends IController{

    @Post '/smth/:id/:name' (id: string, name: string, anything: number, dto: SampleControllerDto) {
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
    const app = express();
    const dependencyComposer = getDependencyComposer();
    const loader = new ControllersLoader({ dependencyComposer, app });
    const processor = loader.processBase();
    const controller = new SampleController();    
    const args = getFunctionArgs(controller, '/smth/:id/:name');
    const request = createRequest(requestPayload);   

    describe('#bindParams(...)', () => {
        
        it('should return correct array of params', async () => { 
            const binded = await loader['bindParams'](request, args);

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
            expect(dependencyComposer.contain(SampleController, 'default')).to.be.eq(false);
        });
    });

    describe('#bindController(...)', () => {   

        it('should create copy of controller', () => expect(loader['bindController'](controller)).to.deep.eq(controller));

    }); 

    describe('#bindHandler(...)', async () => {
        const handler = loader.bindHandler(controller, '/smth/:id/:name', args);

        it('should return function for router', () => expect(handler).to.be.instanceOf(Function));

        it('should process request (with middleware) and return result', async () => {
            const { params, body } = requestPayload; 
            const response = createResponse();

            await handler(request, response, () => {});
    
            expect(response._getData()).to.be.eq(`${params.id}, ${params.name}, ${body.title}`);
        });

        it('should process request and return http status with message for throwing IHttpError', async () => { 
            const request = createRequest({ params: { id: '1', name: '1' }, body: requestPayload.body });
            const response = createResponse();

            await handler(request, response, () => {});
            
            expect(response._getStatusCode()).to.be.eq(400);
            expect(response._getData()).to.be.eq('wrong payload');
        });

        it('should process request and return ajv errors with 400 status for validation', async () => {  
            const request = createRequest({ params: requestPayload.params, body: { title: '1' } })
            const response = createResponse();
            
            await handler(request, response, () => {});
            
            expect(response._getStatusCode()).to.be.eq(400);
        });

        it('should throw error on unexpected throw', async () => {  
            const request = createRequest({ params: { id: 'qwerd', name: 'qwerd' }, body: { title: 'qwerd' } })
            const response = createResponse();
            
            try {
                await handler(request, response, () => {})
            } catch (err) {
                expect(err).to.be.instanceOf(Error);
            }
        })

    });
});