import { expect } from 'chai';
import { Service } from "../../src/index";
import { SERVICE } from '../../src/definitions';

export class ServiceMock{}

describe('Service', () => {
    describe('#Service(...)', () => {
        Service()(ServiceMock);

        it('should emit correct metadata key', () => expect(Reflect.hasMetadata(SERVICE, ServiceMock)).to.be.eq(true));
       
        it('should emit correct metadata value', () => expect(Reflect.getMetadata(SERVICE, ServiceMock)).to.be.eq(true));
    });
});
