import { expect } from "chai";

import { buildSchema } from "../../src/dto/dto.validator";
import { ArrayOf, Const, Data, IsEmail, IsOptional, IsUrl, Maximum, MaxItems, Nested } from "../../src/dto/index";

@Data()
class DtoLocalSampledNested {

    @IsUrl()
    public prop1: string;

}

// Decorator disabled for auto schema build
// @Data()
class DtoLocalSampled {

    @IsEmail()
    public prop1: string;

    @Maximum(20)
    public prop2: number;

    @MaxItems(20)
    public prop4: number[];

    @Nested()
    public nested: DtoLocalSampledNested;

    @ArrayOf(DtoLocalSampledNested)
    public nesteds: DtoLocalSampledNested[];

    @IsOptional()
    public prop3: number;

    @IsOptional()
    public date: Date;

    @Const(true)
    public bool: boolean;

}

const schema = {
    type: "object",
    properties: {
        prop1: {
            type: "string",
            format: "email"
        },
        prop2: {
            type: "number",
            maximum: 20
        },
        prop4: {
            type: "array",
            maxItems: 20
        },
        nested: {
            type: "object",
            properties: {
                prop1: {
                    type: "string",
                    format: "url"
                }
            },
            required: [
                "prop1"
            ]
        },
        nesteds: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    prop1: {
                        format: "url",
                        type: "string"
                    }
                },
                required: [
                    "prop1"
                ]
            }
        },
        prop3: {
            type: "number"
        },
        date: {
            type: "string",
            format: "date-time"
        },
        bool: {
            type: "boolean",
            const: true
        }
    },
    required: [
        "prop1",
        "prop2",
        "prop4",
        "nested",
        "nesteds",
        "bool"
    ]
};

describe("DTOs Validators", () => {
    const result = buildSchema(DtoLocalSampled);
    describe("#buildSchema(...)", () => it("should build correct schema", () => expect(result).to.deep.eq(schema)));
});
