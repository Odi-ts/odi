import DependencyComposer from "../dependency/dependency.composer";

import DependencyContainer from "../dependency/dependency.container";
import { Constructor } from "../types";
import { ILoader } from "../utils/directory.loader";
import { metadata } from "../utils/metadata.utils";

export interface LoaderOptions {
    dependencyComposer: DependencyComposer;
}

export class RepositoryLoader implements ILoader {

    constructor(readonly options: LoaderOptions) {}

    public async processBase() {
        return async (classType: Constructor) => {
            const { getConnection } = await import("typeorm");

            const id = metadata(classType).getMetadata("INJECT_ID");
            const predefine = DependencyContainer.getContainer().get(classType, id);

            if (predefine) {
                return predefine;
            }

            const target = getConnection().getCustomRepository(classType);
            DependencyContainer.getContainer().put(classType, target, id);

            return target;
        };
    }

}
