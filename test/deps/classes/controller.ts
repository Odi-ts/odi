import { Controller, IController, Autowired, Service, Inject } from "../../../src/index";
import { RepositoryMock } from "./repo";
import { ServiceMock } from "./service";
import { Custom } from "./custom";

@Controller()
export class ControllerMock extends IController{

    @Inject()
    repo: RepositoryMock;

    @Inject()
    serivce: ServiceMock;

    @Inject('custom')
    custom: Custom;

    @Autowired()
    public injectService(serivce: ServiceMock){}

} 