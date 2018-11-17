import { expect } from 'chai';

import { buildSchema } from "../../../src/dto/dto.validator";
import { Data, IsEmail, Maximum, IsUrl, Nested, ArrayOf, MaxItems, IsOptional } from "../../../src/dto/index";

@Data()
class DtoSampleNested {
    
    @IsUrl()
    prop1: string;

}

// Decorator disabled for auto schema build
//@Data()
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

    @IsOptional()
    prop3: number;

}

const schema = {
    "properties": {
        "prop1": {
            "type": "string",
            "format": "email"
        },
        "prop3": { 
            "type": "number"
        },
        "prop2": {
            "type": "number",
            "maximum": 20
        },
        "prop4": {
            "type": "array",
            "maxItems": 20
        },
        "nested": {
            "type": "object",
            "properties": {
                "prop1": {
                    "type": "string",
                    "format": "url"
                }
            },
            "$async": true,
            "required": [
                "prop1"
            ]
        },
        "nesteds": {
            "type": "array",
            "items": {}
        }
    },
    "$async": true,
    "required": [
        "prop1",
        "prop2",
        "prop4",
        "nested",
        "nesteds"
    ]
};

describe('DTOs Validators', () => {
    const schema = buildSchema(DtoSample);

    describe('#buildSchema(...)', () => it('should build correct schema', () => expect(schema).to.deep.eq(schema)));
});