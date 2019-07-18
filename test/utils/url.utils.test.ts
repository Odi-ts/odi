import { expect } from "chai";
import { concatinateBase } from "../../src/utils/url.utils";

describe("#concatinateBase(...)", () => {

    it("should correctly concatinate pathes", () => {
        expect(concatinateBase("/", "/")).to.be.eq("/");
        expect(concatinateBase("/", "/foo")).to.be.eq("/foo");
        expect(concatinateBase("/bar", "/")).to.be.eq("/bar");
    });
});
