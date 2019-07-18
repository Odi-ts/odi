import { expect } from "chai";
import { Data, Minimum } from "../../src";
import { getDtoProps, getSchema } from "../../src/dto/dto.storage";

@Data()
class DtoSample {

    @Minimum(2)
    public prop1: number;

    public prop2: number;
}

class DtoNotDecoratedSample {}

const dtoSampleSchema = {
    type: "object",
    properties: {
      prop1: {
        minimum: 2,
        type: "number"
      }
    },
    required: [
      "prop1"
    ]
};

describe("DTOs Storage", () => {

    describe("#getSchema(...)", () => {
        it("should return empty object for undecorated class", () => expect(getSchema(DtoNotDecoratedSample)).to.deep.eq({}));
        it("should return schema object for decorated class", () => expect(getSchema(DtoSample)).to.deep.eq(dtoSampleSchema));
    });

    describe("#getDtoProps(...)", () => {
        it("should return empty array for undecorated class", () => expect(getDtoProps(DtoNotDecoratedSample.prototype)).to.deep.eq([]));
        it("should return array of decorated props names for decorated class", () => expect(getDtoProps(DtoSample.prototype)).to.deep.eq([ "prop1" ]));
    });

});
