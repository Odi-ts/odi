import { capitalize } from "../utils";

interface ControllerPayload {
    name: string;
    type?: "REST" | "empty" | "JSX";
}

export const generateController = ({ name, type }: ControllerPayload) => `
${type === "JSX" ? 'import React from "react"' : ""}
import { Controller, IController, Get } from "odi";
${type === "JSX" ? 'import { HomeView } from "../../views/home.view"' : ""}

@Controller()
export default class ${capitalize(name)}Controller extends IController {

    @Get index() {
        return ${type === "JSX" ? "<HomeView />" : "'Hello, world!'"};
    }
}
`;
