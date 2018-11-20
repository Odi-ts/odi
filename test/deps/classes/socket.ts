import { ISocket } from "../../../src/sockets/socket.interfaces";
import { Sockets } from "../../../src/sockets/socket.decorator";

@Sockets('/')
export class SocketMock extends ISocket{} 