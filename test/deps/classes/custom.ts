import { onInit } from "../../../src/index";

export class Custom {

    async [onInit]() {
        return 'hello from hook !';
    }
}