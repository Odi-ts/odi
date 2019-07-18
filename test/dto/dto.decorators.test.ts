import "reflect-metadata";

import { expect } from "chai";
import { BODY_DTO, DATA_CLASS, DATA_VALIDATION_PROP, QUERY_DTO } from "../../src/definitions";
import { CustomValidation,  Data, Query, validationFactory } from "../../src/dto/dto.decorators";
import { DtoPropsStorage } from "../../src/dto/dto.storage";

class BodyDtoMock {

    public prop1: string;

    public prop2: string;

    public prop3: string;
}

class QueryDtoMock {

    public prop1: string;

    public prop2: string;

    public prop3: string;
}

describe("DTOs Decorators", () => {

    describe("#Data()", () => {
        Data()(BodyDtoMock);

        it("should emit correct metadata key on class", () => expect(Reflect.hasMetadata(DATA_CLASS, BodyDtoMock)).to.be.eq(true));
        it("should emit correct metadata value on class", () => expect(Reflect.getMetadata(DATA_CLASS, BodyDtoMock)).to.be.eq(BODY_DTO));
    });

    describe("#Query()", () => {
        Query()(QueryDtoMock);

        it("should emit correct metadata key on class", () => expect(Reflect.hasMetadata(DATA_CLASS, QueryDtoMock)).to.be.eq(true));
        it("should emit correct metadata value on class", () => expect(Reflect.getMetadata(DATA_CLASS, QueryDtoMock)).to.be.eq(QUERY_DTO));
    });

    describe("#validationFactory(...)", () => {
        validationFactory({ minimum: 1 })(BodyDtoMock, "prop1");

        it("should emit correct metadata on class property", () => expect(Reflect.getMetadata(DATA_VALIDATION_PROP, BodyDtoMock, "prop1")).to.deep.eq({ minimum: 1 }));
        it("should write prop key in Props storage", () => expect(DtoPropsStorage.get(BodyDtoMock)).to.deep.equal(["prop1"]));

        it("should merge metadata", () => {
            validationFactory({ maximum: 2 })(BodyDtoMock, "prop1");
            expect(Reflect.getMetadata(DATA_VALIDATION_PROP, BodyDtoMock, "prop1")).to.deep.eq({ minimum: 1, maximum: 2 });
        });
        it("should not duplicate prop key in Props storage", () => expect(DtoPropsStorage.get(BodyDtoMock)).to.deep.equal(["prop1"]));

        it("should add new props for DTO to Props storage ", () => {
            validationFactory({ maximum: 2 })(BodyDtoMock, "prop2");
            expect(DtoPropsStorage.get(BodyDtoMock)).to.deep.equal(["prop1", "prop2"]);
        });
    });

    describe("#CustomValidation (...)", () => {
        it("should emit metadata on class property", () =>  {
            CustomValidation(() => true)(BodyDtoMock, "prop3");
            expect(Reflect.hasMetadata(DATA_VALIDATION_PROP, BodyDtoMock, "prop3")).to.be.eq(true);
        });
    });

});
