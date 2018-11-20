import { Controller, IController, Autowired, Service } from "../../../src/index";
import { RepositoryMock } from "./repo";
import { ServiceMock } from "./service";
import { Custom } from "./custom";

@Controller()
export class ControllerMock extends IController{

    @Autowired()
    repo: RepositoryMock;

    @Autowired()
    serivce: ServiceMock;

    @Autowired('custom')
    custom: Custom;

    @Autowired()
    public injectService(serivce: ServiceMock){}

} 