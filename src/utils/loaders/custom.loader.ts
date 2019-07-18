import { Constructor } from "../../types";
import { ILoader } from "../directory.loader";

export class CustomLoader implements ILoader {

    public async processBase() {
        return async (classType: Constructor) => new classType();
    }
}
