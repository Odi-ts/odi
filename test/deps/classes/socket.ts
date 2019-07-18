import { Socket } from "../../../src/sockets/socket.decorator";
import { ISocket } from "../../../src/sockets/socket.interfaces";

@Socket("/")
export class SocketMock extends ISocket {}
