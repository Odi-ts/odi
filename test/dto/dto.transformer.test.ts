import { expect } from 'chai';

import { plainToClass } from "../../src/dto/dto.transformer";
import { Data, IsEmail, Maximum, IsUrl, Nested, ArrayOf, MaxItems} from "../../src/dto";

@Data()
class DtoSampleNested {
    
    @IsUrl()
    prop1: string;

}

@Data()
class DtoSample {
    
    @IsEmail()
    prop1: string;

    @Maximum(20)
    prop2: number;

    @MaxItems(20)
    prop4: number[];

    @Nested()
    nested: DtoSampleNested;
 
    @ArrayOf(DtoSampleNested)
    nesteds: DtoSampleNested[];
}

const payload = { 
    prop1: "dan@odi.com", 
    prop2: 15, 
    prop3: false, 
    nested: { prop1: 'www.google.com' },
    nesteds: [
        { prop1: 'www.ibm.com' }, 
        { prop1: 'www.ibm.com' }, 
        { prop1: 'www.ibm.com' }
    ],
    prop4: [1,2,3,4,5],
    props5: [1,2,3,4,5]
};


describe('DTOs Transformers', () => {

    describe('#plainToClass(...)', () => {
        const instance = plainToClass(DtoSample, payload);
        
        it('should create instance of DTO class', () => expect(instance instanceof DtoSample).to.be.eq(true));
        it('should include decorated props', () => { 
            expect(instance).to.have.property('prop1', payload.prop1);
            expect(instance).to.have.property('prop2', payload.prop2);
        });        
        it('should include undecorated props', () => expect(instance).to.have.property('prop3', false));     

        it('should include nested props', () => expect(instance.nested).to.deep.eq(payload.nested));
        it('should create instance of nested DTO class', () => expect(instance.nested instanceof DtoSampleNested).to.be.eq(true));

        it('should include full array of primitives', () => expect(instance.prop4).to.deep.eq(payload.prop4));
        it('should include full array of undecorated primitives', () => expect(instance).to.have.property('props5', payload.props5));

        it('should include full array of nested DTOs', () => expect(instance.nesteds.length).to.be.eq(payload.nesteds.length));
        it('should create array of DTO instances', () => expect(instance.nesteds.every(e => e instanceof DtoSampleNested)).to.be.eq(true));
        it('should create array of DTOs and include decorated props', () => expect(instance.nesteds.every((e,i) => e.prop1 == payload.nesteds[i].prop1 )).to.be.eq(true));
    });
}); 