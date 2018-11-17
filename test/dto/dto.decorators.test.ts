import 'reflect-metadata';

import { expect } from 'chai';
import { Data, validationFactory, CustomValidation } from '../../src/dto/dto.decorators';
import { DATA_CLASS, DATA_VALIDATION_PROP } from '../../src/definitions';
import { DtoPropsStorage } from '../../src/dto/dto.storage';

class DtoMock {

    prop1: string;

    prop2: string;

    prop3: string;
}

describe('DTOs Decorators', () => {

    describe('#Data()', () => {
        Data()(DtoMock);

        it('should emit correct metadata key on class', () => expect(Reflect.hasMetadata(DATA_CLASS, DtoMock)).to.be.eq(true));
        it('should emit correct metadata value on class', () => expect(Reflect.getMetadata(DATA_CLASS, DtoMock)).to.be.eq(true));
    });

    describe('#Data()', () => {
        Data()(DtoMock);

        it('should emit correct metadata key on class', () => expect(Reflect.hasMetadata(DATA_CLASS, DtoMock)).to.be.eq(true));
        it('should emit correct metadata value on class', () => expect(Reflect.getMetadata(DATA_CLASS, DtoMock)).to.be.eq(true));
    });


    describe('#validationFactory(...)', () => {
        validationFactory({ minimum: 1 })(DtoMock, 'prop1');

        it('should emit correct metadata on class property', () => expect(Reflect.getMetadata(DATA_VALIDATION_PROP, DtoMock, 'prop1')).to.deep.eq({ minimum: 1 }));
        it('should write prop key in Props storage', () => expect(DtoPropsStorage.get(DtoMock)).to.deep.equal(['prop1']));
        
        it('should merge metadata', () => {
            validationFactory({ maximum: 2 })(DtoMock, 'prop1');
            expect(Reflect.getMetadata(DATA_VALIDATION_PROP, DtoMock, 'prop1')).to.deep.eq({ minimum: 1, maximum: 2 })
        });
        it('should not duplicate prop key in Props storage', () => expect(DtoPropsStorage.get(DtoMock)).to.deep.equal(['prop1']));

        it('should add new props for DTO to Props storage ', () => {
            validationFactory({ maximum: 2 })(DtoMock, 'prop2');
            expect(DtoPropsStorage.get(DtoMock)).to.deep.equal(['prop1', 'prop2']);
        });
    });

    describe('#CustomValidation (...)', () => {  
        it('should emit metadata on class property', () =>  { 
            CustomValidation(() => true)(DtoMock, 'prop3');
            expect(Reflect.hasMetadata(DATA_VALIDATION_PROP, DtoMock, 'prop3')).to.be.eq(true)
        });    
    });

});