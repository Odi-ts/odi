import { expect } from 'chai';

import { Authentication } from '../../src/index';
import { AuthLoader } from '../../src/auth/local/auth.loader';
import { getDependencyComposer } from '../utils/di.utils';
import { CoreAuth } from '../../src/auth/local/auth.interface';

class AuthServiceMock extends CoreAuth<any, any> {

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
        const loader = new AuthLoader({ dependencyComposer }); 
        const processor = loader.processBase();       

        it('should return processing function', () => expect(processor).to.be.instanceOf(Function));
        
        it('should put instance in DI container', async () => {    
            await processor(AuthServiceMock);

            expect(dependencyComposer.contain(AuthServiceMock)).to.be.eq(true);
            expect(dependencyComposer.containById('auth')).to.be.eq(true);
        });
        
        it('should override existed repository in DI container',async () => {            
            dependencyComposer.get(AuthServiceMock)['flag'] = 'origin';
            await processor(AuthServiceMock);
            
            expect(dependencyComposer.get(AuthServiceMock)['flag']).to.be.eq(undefined);
        })
    });
});