import { ILoader } from "../directory.loader";
import { Constructor } from "../../types";

export class CustomLoader implements ILoader {
    
    public async processBase() {
        return async (classType: Constructor) => new classType();
    }
}