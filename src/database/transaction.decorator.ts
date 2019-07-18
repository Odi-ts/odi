import { getNamespace } from "cls-hooked";
import { Instance } from "../types";
import { getModule } from "../utils/env.tools";

export function Transaction(connectionName: string = "default"): MethodDecorator {
    const { getConnection } = getModule("typeorm");

    return function(target: Instance, property: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]) {
            return getConnection(connectionName).transaction(async (entityManager: any) => {
                // const context = getNamespace("__context");

                // if (!context)
                //     throw new Error("Cannot use CLS transaction management.");

                // return context.runAndReturn(async () => {

                //     context.set("_", entityManager);

                //     const result = await originalMethod.apply(this, [...args]);

                //     context.set("_", null);

                //     return result;
                // });
            });
        };

    };
}
