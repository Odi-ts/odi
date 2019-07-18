import { onInit } from "../../../src/index";

export class Custom {

    public async [onInit]() {
        return "hello from hook !";
    }
}
