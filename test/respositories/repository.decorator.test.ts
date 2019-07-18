import { expect } from "chai";
import { INJECT_ID, REPOSITORY } from "../../src/definitions";
import { EntityRepository } from "../../src/index";

import { FooModel } from "../utils/db.utils";

export class RepoMock {}

describe("Repository Decorators", () => {
    describe("#EntityRepository", () => {
        EntityRepository(FooModel)(RepoMock);

        it("should emit inject id metadata", () => expect(Reflect.getMetadata(INJECT_ID, RepoMock)).to.be.eq("default"));
        it("should emit repository metadata", () => expect(Reflect.getMetadata(REPOSITORY, RepoMock)).to.be.eq(FooModel));
    });
});
