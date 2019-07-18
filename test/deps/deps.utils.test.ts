import { expect } from "chai";
import { ComponentSettingsStorage } from "../../src/dependency/dependency.store";
import { define, Hook, onInit } from "../../src/dependency/dependency.utils";
import { Custom } from "./classes/custom";

describe("Dependency Utils", () => {

    describe("#Hook", () => it("should return onInit symbol", () => expect(Hook()).to.be.eq(onInit)));

    describe("#define(...)", () => {
        const definition = define(Custom);

        it("should return setting methods for class", () => expect(definition).to.have.keys(["set", "setSingleton", "setScoped"]));

        it("should write settings for class to global store", () => {
            definition.set("custom", { type: "scoped" });
            definition.setScoped("something");
            definition.setSingleton("others");

            const settings = ComponentSettingsStorage.get(Custom);

            expect(settings).to.be.not.eq(undefined);
            expect(settings!.custom).to.be.deep.include({ type: "scoped" });
            expect(settings!.something).to.be.deep.include({ type: "scoped" });
            expect(settings!.others).to.be.deep.include({ type: "singleton" });
        });
    });
});
