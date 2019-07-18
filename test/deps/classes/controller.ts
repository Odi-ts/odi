import { Autowired, Controller, IController, Inject, Service } from "../../../src/index";
import { Custom } from "./custom";
import { RepositoryMock } from "./repo";
import { ServiceMock } from "./service";

@Controller()
export class ControllerMock extends IController {

    @Inject()
    public repo: RepositoryMock;

    @Inject()
    public serivce: ServiceMock;

    @Inject("custom")
    public custom: Custom;

    @Autowired()
    public injectService(serivce: ServiceMock) {}

}
