import "reflect-metadata";

import { expect } from "chai";
import { SOCKET, SOCKET_EVENT } from "../../src/definitions";
import { OnEvent, Socket } from "../../src/sockets/socket.decorator";
import { ISocket } from "../../src/sockets/socket.interfaces";

@Socket("/fooo")
class HomeSocket extends ISocket {

    @OnEvent("smth")
    public foo() {}

}

describe("Socket Decorators", () => {
    it("should emmit correct metadata for class", () => expect(Reflect.getMetadata(SOCKET, HomeSocket)).to.eq("/fooo"));

    it("should emmit correct metadata for class property", () => expect(Reflect.getMetadata(SOCKET_EVENT, HomeSocket.prototype, "foo")).to.eq("smth"));
});
