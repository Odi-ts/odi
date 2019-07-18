import { expect } from "chai";

import { ServicesLoader } from "../../src/services/services.loader";
import { getDependencyComposer } from "../utils/di.utils";
import { ServiceMock } from "./service.decorator.test";

import DependencyComposer from "../dependency/dependency.composer";
import DependencyContainer from "../dependency/dependency.container";

let dependencyComposer: DependencyComposer;
let dependencyContainer: DependencyContainer;

describe("Repository Loader", () => {
    describe("#RepositoryLoader", async () => {
        let loader;
        let processor: Function;

        before(async () => {
            dependencyComposer = getDependencyComposer();
            dependencyContainer = dependencyComposer["container"];
            loader = new ServicesLoader({ dependencyComposer });
            processor = await loader.processBase();
        });

        it("should return processing function", () => expect(processor).to.be.instanceOf(Function));
        it("should put instance in DI container", async () => {
            await processor(ServiceMock);
            expect(dependencyContainer.contain(ServiceMock, "default")).to.be.eq(true);
        });
        it("should not override existed repository in DI container", async () => {
            (dependencyContainer.get(ServiceMock) as any).flag = "origin";
            await processor(ServiceMock);

            expect((dependencyContainer.get(ServiceMock) as any).flag).to.be.eq("origin");
        });
    });
});
