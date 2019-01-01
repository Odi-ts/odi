import { DependencyManager, DepType } from "../../src/dependency/dependency.manager"


function readControllers(sources: string) {
    const manager = new DependencyManager({ sources });
    manager.classify();

    const controllers = manager.getDeps(DepType.Controller);
    console.log(controllers);
}