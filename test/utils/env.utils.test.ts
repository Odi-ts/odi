import { expect } from "chai";
import { getModule } from "../../src/utils/env.tools";

describe("getModule(...)", () => {
    const module = "react-dom/server";

    it("should load module in global scope", () => {

        expect((global as any)[module]).to.be.eq(undefined);
        expect(getModule(module)).to.be.a("object");
        expect((global as any)[module]).to.be.a("object");
    });

});
