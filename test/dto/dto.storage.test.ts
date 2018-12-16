import { expect } from 'chai';
import { getDtoProps, getSchema } from '../../src/dto/dto.storage';
import { Data, Minimum } from '../../src';

@Data()
class DtoSample {
    
    @Minimum(2)
    prop1: number;

    prop2: number
}

class DtoNotDecoratedSample {}


const dtoSampleSchema = {
    "properties": {
      "prop1": {
        "minimum": 2,
        "type": "number"
      }
    },
    "required": [
      "prop1"
    ]
};

describe('DTOs Storage', () => {
    
    describe('#getSchema(...)', () => {
        it('should return empty object for undecorated class', () => expect(getSchema(DtoNotDecoratedSample)).to.deep.eq({}));
        it('should return schema object for decorated class', () => expect(getSchema(DtoSample)).to.deep.eq(dtoSampleSchema));
    });

    describe('#getDtoProps(...)', () => {
        it('should return empty array for undecorated class', () => expect(getDtoProps(DtoNotDecoratedSample.prototype)).to.deep.eq([]));
        it('should return array of decorated props names for decorated class', () => expect(getDtoProps(DtoSample.prototype)).to.deep.eq([ 'prop1' ]));
    });

});