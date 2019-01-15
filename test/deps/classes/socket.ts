import { ISocket } from "../../../src/sockets/socket.interfaces";
import { Socket } from "../../../src/sockets/socket.decorator";

@Socket('/')
export class SocketMock extends ISocket{} 