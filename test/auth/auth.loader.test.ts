import { expect } from 'chai';

import { Authentication, JWTAuth } from '../../src/index';
import { AuthLoader } from './auth.loader';
import { getDependencyComposer } from '../utils/di.utils';

class AuthServiceMock extends JWTAuth<any, any> {

    serialize(data: any) {
        return data;
    }

    deserialize(data: any) {
        return data;
    }
}

describe('Auth Loader', () => {
    Authentication()(AuthServiceMock);

    describe('#AuthLoader', async () => {           
        const dependencyComposer = getDependencyComposer();   
        const dependencyContainer = dependencyComposer['container'];


        const loader = new AuthLoader({ dependencyComposer }); 
        const processor = await loader.processBase();       

        it('should return processing function', () => expect(processor).to.be.instanceOf(Function));
        
        it('should put instance in DI container', async () => {    
            await processor(AuthServiceMock);

            expect(dependencyContainer.contain(AuthServiceMock)).to.be.eq(true);
            expect(dependencyContainer.containById('auth')).to.be.eq(true);
        });
        
        it('should override existed repository in DI container',async () => {            
            (dependencyContainer.get(AuthServiceMock) as any)['flag'] = 'origin';
            await processor(AuthServiceMock);
            
            expect((dependencyContainer.get(AuthServiceMock) as any)['flag']).to.be.eq(undefined);
        });
    });
});