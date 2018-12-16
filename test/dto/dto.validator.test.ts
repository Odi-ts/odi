import { expect } from 'chai';

import { buildSchema } from "../../src/dto/dto.validator";
import { Data, IsEmail, Maximum, IsUrl, Nested, ArrayOf, MaxItems, IsOptional, Const } from "../../src/dto/index";

@Data()
class DtoLocalSampledNested {
    
    @IsUrl()
    prop1: string;

}

// Decorator disabled for auto schema build
//@Data()
class DtoLocalSampled {
    
    @IsEmail()
    prop1: string;

    @Maximum(20)
    prop2: number;

    @MaxItems(20)
    prop4: number[];

    @Nested()
    nested: DtoLocalSampledNested;
 
    @ArrayOf(DtoLocalSampledNested)
    nesteds: DtoLocalSampledNested[];

    @IsOptional()
    prop3: number;

    @IsOptional()
    date: Date;

    @Const(true)
    bool: boolean;

}

const schema = {
    "properties": {
        "prop1": {
            "type": "string",
            "format": "email"
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
            "required": [
                "prop1"
            ]
        },
        "nesteds": {
            "type": "array",
            "items": {}
        },
        "prop3": {
            "type": "number"
        },
        "date": {
            "type": "string",
            "format": "date-time"
        },
        "bool": {
            "type": "boolean",
            "const": true
        }
    },
    "required": [
        "prop1",
        "prop2",
        "prop4",
        "nested",
        "nesteds",
        "bool"
    ]
};

describe('DTOs Validators', () => {
    const result = buildSchema(DtoLocalSampled);
    describe('#buildSchema(...)', () => it('should build correct schema', () => expect(result).to.deep.eq(schema)));
});