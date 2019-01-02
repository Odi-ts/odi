import { capitalize } from "../utils";

interface ControllerPayload {
    name: string;
    type: 'REST' | 'empty';
}

export function generateController(payload: ControllerPayload) {


    return () => 
    `import { Controller, IController } from "odi";

    @Controller()    
    export default class ${capitalize(payload.name)}Controller extends IController {

    }    
    `
}

